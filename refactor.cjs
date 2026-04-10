const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Add Firestore sync helpers
const syncHelpers = `
  const syncTaskToFirestore = async (task: Task) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, \`users/\${userId}/tasks/\${task.id}\`), { ...task, uid: userId });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, \`users/\${userId}/tasks/\${task.id}\`);
    }
  };

  const removeTaskFromFirestore = async (taskId: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, \`users/\${userId}/tasks/\${taskId}\`));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, \`users/\${userId}/tasks/\${taskId}\`);
    }
  };

  const syncGoalToFirestore = async (goal: Goal) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, \`users/\${userId}/goals/\${goal.id}\`), { ...goal, uid: userId });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, \`users/\${userId}/goals/\${goal.id}\`);
    }
  };

  const syncSettingsToFirestore = async (order: string[], progress: Record<string, number>) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, \`users/\${userId}/settings/preferences\`), {
        customOrder: order,
        taskProgress: progress,
        uid: userId
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, \`users/\${userId}/settings/preferences\`);
    }
  };
`;

content = content.replace('const [userId, setUserId] = useState<string | null>(null);', 'const [userId, setUserId] = useState<string | null>(null);\n' + syncHelpers);

// 2. Add onSnapshot listeners
const snapshotListeners = `
  useEffect(() => {
    if (!userId) return;
    
    const unsubTasks = onSnapshot(collection(db, \`users/\${userId}/tasks\`), (snap) => {
      const loadedTasks = snap.docs.map(d => d.data() as Task);
      setTasks(loadedTasks);
    }, (e) => handleFirestoreError(e, OperationType.LIST, \`users/\${userId}/tasks\`));

    const unsubGoals = onSnapshot(collection(db, \`users/\${userId}/goals\`), (snap) => {
      const loadedGoals = snap.docs.map(d => d.data() as Goal);
      setGoals(loadedGoals);
    }, (e) => handleFirestoreError(e, OperationType.LIST, \`users/\${userId}/goals\`));

    const unsubSettings = onSnapshot(doc(db, \`users/\${userId}/settings/preferences\`), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.customOrder) setCustomOrder(data.customOrder);
        if (data.taskProgress) setTaskProgress(data.taskProgress);
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, \`users/\${userId}/settings/preferences\`));

    return () => {
      unsubTasks();
      unsubGoals();
      unsubSettings();
    };
  }, [userId]);
`;

content = content.replace('const handleLogin = async () => {', snapshotListeners + '\n  const handleLogin = async () => {');

// 3. Update completeTask
content = content.replace(
  /const completeTask = useCallback\(\(id: string\) => \{[\s\S]*?\}\, \[tasks\, activeTasksList\]\)\;/m,
  `const completeTask = useCallback((id: string) => {
    const isProjection = id.includes('-projection-');
    const baseId = isProjection ? id.split('-projection-')[0] : id;
    
    setTasks(prev => {
      const task = prev.find(m => m.id === baseId);
      if (!task || task.isCompleted) return prev;

      if (isProjection) {
        const projectionTask = activeTasksList.find(t => t.id === id);
        if (!projectionTask) return prev;

        const updatedBaseTask = { 
          ...task, 
          canceledDates: [...(task.canceledDates || []), projectionTask.deadline] 
        };

        const completedProjection: Task = {
          ...task,
          id: Math.random().toString(36).substr(2, 9),
          deadline: projectionTask.deadline,
          isCompleted: true,
          completedAt: Date.now(),
          recurrence: 'none' as const,
          isProjection: false
        };

        syncTaskToFirestore(updatedBaseTask);
        syncTaskToFirestore(completedProjection);

        return [...prev.map(m => m.id === baseId ? updatedBaseTask : m), completedProjection];
      } else {
        const updatedTask = { ...task, isCompleted: true, completedAt: Date.now() };
        syncTaskToFirestore(updatedTask);
        
        let nextTask: Task | null = null;
        if (task.recurrence && task.recurrence !== 'none') {
          let nextDeadline = task.deadline;
          if (task.recurrence === 'daily') nextDeadline += 24 * 60 * 60 * 1000;
          else if (task.recurrence === 'weekly') nextDeadline += 7 * 24 * 60 * 60 * 1000;
          else if (task.recurrence === 'monthly') {
            const d = new Date(task.deadline);
            d.setMonth(d.getMonth() + 1);
            nextDeadline = d.getTime();
          }

          nextTask = { 
            ...task, 
            id: Math.random().toString(36).substr(2, 9), 
            deadline: nextDeadline, 
            isCompleted: false, 
            createdAt: Date.now(), 
            completedAt: undefined 
          };
          syncTaskToFirestore(nextTask);
        }

        return prev.map(m => m.id === baseId ? updatedTask : m).concat(nextTask ? [nextTask] : []);
      }
    });
  }, [tasks, activeTasksList, userId]);`
);

// 4. Update auto-completion
content = content.replace(
  /let changed = false;\s*const newTasks = tasks\.map\(m => \{[\s\S]*?if \(changed\) setTasks\(newTasks\);/m,
  `let changed = false;
      const newTasks = tasks.map(m => {
        if (!m.isCompleted && m.isAutoCompletable) {
          const deadlineWithDuration = m.deadline + (m.estimatedDuration * 60000);
          if (now >= deadlineWithDuration) {
            changed = true;
            const updated = { ...m, isCompleted: true, completedAt: now };
            syncTaskToFirestore(updated);
            return updated;
          }
        }
        return m;
      });
      if (changed) setTasks(newTasks);`
);

// 5. Update onDelete
content = content.replace(
  /onDelete=\{id => \{[\s\S]*?\}\}/m,
  `onDelete={id => {
                    const taskToCancel = [...activeTasksList, ...completedTasksInRange].find(t => t.id === id);
                    if (id.includes('-projection-')) {
                      if (taskToCancel) {
                        setTasks(prev => prev.map(t => {
                          if (t.id === taskToCancel.id) {
                            const updated = { ...t, canceledDates: [...(t.canceledDates || []), taskToCancel.deadline] };
                            syncTaskToFirestore(updated);
                            return updated;
                          }
                          return t;
                        }));
                      }
                    } else {
                      setTasks(prev => prev.filter(m => m.id !== id));
                      removeTaskFromFirestore(id);
                    }
                  }}`
);

// 6. Update onAdd (Task)
content = content.replace(
  /onAdd=\{taskData => \{[\s\S]*?\}\}/m,
  `onAdd={taskData => { 
              const newTask = { ...taskData, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now(), isCompleted: false } as Task;
              setTasks(prev => [...prev, newTask]); 
              syncTaskToFirestore(newTask);
              setShowTaskForm(false); 
            }}`
);

// 7. Update onEdit (Task)
content = content.replace(
  /onEdit=\{\(id, updates\) => \{[\s\S]*?\}\}/m,
  `onEdit={(id, updates) => { 
              setTasks(prev => prev.map(m => {
                if (m.id === id) {
                  const updated = { ...m, ...updates };
                  syncTaskToFirestore(updated);
                  return updated;
                }
                return m;
              })); 
              setShowTaskForm(false); 
              setEditingTask(null); 
            }}`
);

// 8. Update onAdd (Goal)
content = content.replace(
  /onAdd=\{goal => \{[\s\S]*?\}\}/m,
  `onAdd={goal => { 
              const newGoal = { ...goal, id: Math.random().toString(36).substr(2, 9) } as Goal;
              setGoals(prev => [...prev, newGoal]); 
              syncGoalToFirestore(newGoal);
              setShowGoalForm(false); 
              if (returnToTaskForm) {
                setShowTaskForm(true);
                setReturnToTaskForm(false);
              }
            }}`
);

// 9. Update customOrder
content = content.replace(
  /setCustomOrder\(newOrder\);/g,
  `setCustomOrder(newOrder);
    syncSettingsToFirestore(newOrder, taskProgress);`
);

// 10. Update taskProgress (timer)
// We need to be careful not to sync every second. Let's sync when the timer stops or pauses.
content = content.replace(
  /setIsTimerActive\(false\);/g,
  `setIsTimerActive(false);
      syncSettingsToFirestore(customOrder, taskProgress);`
);

fs.writeFileSync('App.tsx', content);
console.log('Refactored App.tsx');
