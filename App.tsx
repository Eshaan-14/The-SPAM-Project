import './index.css'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Task, UrgencyLevel, Goal } from './types';
import { calculateUrgency, projectTasksInRange, calculateStreak, getVibe } from './utils';
import Dashboard from './components/Dashboard';
import FocusMode from './components/FocusMode';
import MinimizedTimer from './components/MinimizedTimer';
import ChaosControl from './components/ChaosControl';
import TaskForm from './components/TaskForm';
import GoalForm from './components/GoalForm';
import CalendarView from './components/CalendarView';
import GoalsView from './components/GoalsView';
import ModusOperandi from './components/ModusOperandi';
import Sidebar from './components/Sidebar';
import OnboardingModal from './components/OnboardingModal';
import WelcomeScreen from './components/WelcomeScreen';
import { auth, db, loginWithGoogle, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';


enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const STORAGE_KEY_TASKS = 'spam_project_tasks_v6';
const STORAGE_KEY_GOALS = 'spam_project_goals_v6';
const STORAGE_KEY_PROGRESS = 'spam_project_progress_v6';
const STORAGE_KEY_ORDER = 'spam_project_order_v6';

type ViewMode = 'dashboard' | 'calendar' | 'modus' | 'goals';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [taskProgress, setTaskProgress] = useState<Record<string, number>>({});
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Navigation & Filtering
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedGoalId, setSelectedGoalId] = useState<string | 'all'>('all');
  const [showEdgeFlicker, setShowEdgeFlicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Derived State for Gamification
  const streak = useMemo(() => calculateStreak(tasks), [tasks]);
  const overdueCount = useMemo(() => {
    const now = Date.now();
    return tasks.filter(m => !m.isCompleted && m.deadline < now).length;
  }, [tasks]);
  
  const vibe = useMemo(() => getVibe(streak, overdueCount), [streak, overdueCount]);

  // Splash Screen State
  const [splashStep, setSplashStep] = useState<'welcome' | 'igniting' | 'bursting' | 'done'>('welcome');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const fullWelcomeMsg = "SYSTEM_STATUS: PARALYSIS_DETECTED";

  const clutterItems = [
    { text: "Tomorrow", code: "0x4A" }, { text: "Later", code: "0x7F" },
    { text: "Maybe", code: "0x2B" }, { text: "Planning", code: "0xEE" },
    { text: "Researching", code: "0xAC" }, { text: "Analysis", code: "0x12" },
    { text: "Eventually", code: "0xDD" }, { text: "Unsure", code: "0x98" },
    { text: "Overthinking", code: "0xFF" }, { text: "Waiting", code: "0x00" },
    { text: "Someday", code: "0xCC" }, { text: "Procrastinate", code: "0x55" }
  ];

  const clutterPositions = useMemo(() => {
    const zones: { r: number; c: number }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        zones.push({ r, c });
      }
    }
    const shuffledZones = [...zones].sort(() => Math.random() - 0.5);

    return clutterItems.map((_, idx) => {
      const zone = shuffledZones[idx % shuffledZones.length];
      const zoneWidth = 100 / 4;
      const zoneHeight = 100 / 3;

      const jitterX = (Math.random() - 0.5) * (zoneWidth * 0.8);
      const jitterY = (Math.random() - 0.5) * (zoneHeight * 0.8);
      
      const left = (zone.c * zoneWidth) + (zoneWidth / 2) + jitterX;
      const top = (zone.r * zoneHeight) + (zoneHeight / 2) + jitterY;
      const rotate = Math.random() * 30 - 15;
      const scale = 0.9 + Math.random() * 0.3;

      return { top: `${top}%`, left: `${left}%`, rotate: `${rotate}deg`, scale };
    });
  }, []);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const radarIntervalRef = useRef<number | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playRadarPing = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  }, []);

  const playIgnitionSound = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(35, now);
    sub.frequency.exponentialRampToValueAtTime(80, now + 1.2);
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.2, now + 1.0);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 1.5);

    const oscMain = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const mainGain = ctx.createGain();

    oscMain.type = 'sawtooth';
    oscMain.frequency.setValueAtTime(55, now);
    oscMain.frequency.exponentialRampToValueAtTime(110, now + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(50, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 1.2);
    filter.Q.setValueAtTime(10, now);

    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.2, now + 1.0);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    oscMain.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(ctx.destination);

    oscMain.start(now);
    oscMain.stop(now + 1.5);
  }, []);

  useEffect(() => {
    if (splashStep === 'welcome') {
      radarIntervalRef.current = window.setInterval(playRadarPing, 2800);
    } else {
      if (radarIntervalRef.current) clearInterval(radarIntervalRef.current);
    }
    return () => { if (radarIntervalRef.current) clearInterval(radarIntervalRef.current); };
  }, [splashStep, playRadarPing]);

  useEffect(() => {
    if (splashStep !== 'welcome') return;
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < fullWelcomeMsg.length) {
        setDisplayedText(prev => prev + fullWelcomeMsg.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 40);
    return () => clearInterval(typingInterval);
  }, [splashStep]);

  const initiateLaunch = useCallback(() => {
    initAudio(); 
    if (splashStep !== 'welcome' || isTyping || !isAuthReady) return;
    
    setSplashStep('igniting');
    playIgnitionSound(); 
    
    setTimeout(() => {
      setSplashStep('bursting');
      document.body.classList.add('app-ready');

      setTimeout(() => {
        setSplashStep('done');
      }, 1000); 
    }, 1200);
  }, [splashStep, isTyping, playIgnitionSound, isAuthReady]);

  useEffect(() => {
    if (splashStep !== 'welcome') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        initiateLaunch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initiateLaunch, splashStep]);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      const savedGoals = localStorage.getItem(STORAGE_KEY_GOALS);
      const savedProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);
      const savedOrder = localStorage.getItem(STORAGE_KEY_ORDER);
      
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedGoals) setGoals(JSON.parse(savedGoals));
      if (savedProgress) setTaskProgress(JSON.parse(savedProgress));
      if (savedOrder) setCustomOrder(JSON.parse(savedOrder));
      setIsLoaded(true);
    } catch (e) {
      console.error("Storage load error:", e);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(taskProgress));
    localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(customOrder));
  }, [tasks, goals, taskProgress, customOrder, isLoaded]);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [timerTaskId, setTimerTaskId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chaosMinutes, setChaosMinutes] = useState(0);
  const [returnToTaskForm, setReturnToTaskForm] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [draftTask, setDraftTask] = useState<Partial<Task> | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  const syncTaskToFirestore = async (task: Task) => {
    if (!userId) return;
    try {
      const taskData = { ...task, uid: userId };
      Object.keys(taskData).forEach(key => {
        if (taskData[key as keyof typeof taskData] === undefined) {
          delete taskData[key as keyof typeof taskData];
        }
      });
      await setDoc(doc(db, `users/${userId}/tasks/${task.id}`), taskData);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/tasks/${task.id}`);
    }
  };

  const removeTaskFromFirestore = async (taskId: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/tasks/${taskId}`));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/tasks/${taskId}`);
    }
  };

  const syncGoalToFirestore = async (goal: Goal) => {
    if (!userId) return;
    try {
      const goalData = { ...goal, uid: userId };
      Object.keys(goalData).forEach(key => {
        if (goalData[key as keyof typeof goalData] === undefined) {
          delete goalData[key as keyof typeof goalData];
        }
      });
      await setDoc(doc(db, `users/${userId}/goals/${goal.id}`), goalData);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/goals/${goal.id}`);
    }
  };

  const syncSettingsToFirestore = async (order: string[], progress: Record<string, number>) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, `users/${userId}/settings/preferences`), {
        customOrder: order,
        taskProgress: progress,
        uid: userId
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/settings/preferences`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUsername(user.email || user.displayName || 'User');
        setShowLogin(false);
      } else {
        setUserId(null);
        setUsername(null);
        setShowLogin(true);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        setLoginError('Sign-in was cancelled.');
      } else {
        setLoginError(error.message || 'An error occurred during sign-in.');
      }
    }
  };

  useEffect(() => {
    if (!userId) return;
    
    const unsubTasks = onSnapshot(collection(db, `users/${userId}/tasks`), (snap) => {
      const loadedTasks = snap.docs.map(d => d.data() as Task);
      setTasks(loadedTasks);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${userId}/tasks`));

    const unsubGoals = onSnapshot(collection(db, `users/${userId}/goals`), (snap) => {
      const loadedGoals = snap.docs.map(d => d.data() as Goal);
      setGoals(loadedGoals);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${userId}/goals`));

    const unsubSettings = onSnapshot(doc(db, `users/${userId}/settings/preferences`), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.customOrder) setCustomOrder(data.customOrder);
        if (data.taskProgress) setTaskProgress(data.taskProgress);
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${userId}/settings/preferences`));

    const unsubProfile = onSnapshot(doc(db, `users/${userId}/profile/data`), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.username) setUsername(data.username);
        if (!data.hasCompletedOnboarding) setShowOnboarding(true);
      } else {
        setShowOnboarding(true);
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${userId}/profile/data`));

    return () => {
      unsubTasks();
      unsubGoals();
      unsubSettings();
      unsubProfile();
    };
  }, [userId]);

  const handleLogout = async () => {
    await logout();
  };

  const handleOnboardingComplete = async (newUsername: string) => {
    setUsername(newUsername);
    setShowOnboarding(false);
    if (userId) {
      try {
        await setDoc(doc(db, `users/${userId}/profile/data`), {
          username: newUsername,
          hasCompletedOnboarding: true,
          uid: userId
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${userId}/profile/data`);
      }
    }
  };

  const handleUpdateUsername = async () => {
    if (!tempUsername.trim() || !userId) {
      setIsEditingUsername(false);
      return;
    }
    const newUsername = tempUsername.trim();
    setUsername(newUsername);
    setIsEditingUsername(false);
    try {
      await setDoc(doc(db, `users/${userId}/profile/data`), {
        username: newUsername,
        uid: userId
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/profile/data`);
    }
  };

  // Timer Ticking Logic
  useEffect(() => {
    let interval: number;
    if (isTimerActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => {
          const newVal = prev - 1;
          if (timerTaskId) {
            setTaskProgress(prog => ({ ...prog, [timerTaskId]: newVal }));
          }
          return newVal;
        });
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, timerTaskId]);

  const currentRange = useMemo(() => {
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
    const end = start + 86400000;
    return { start, end };
  }, [selectedDate]);

  const activeTasksList = useMemo(() => {
    const incomplete = tasks.filter(m => !m.isCompleted);
    const projected = projectTasksInRange(incomplete, currentRange.start, currentRange.end);
    let filtered = projected;
    if (selectedGoalId !== 'all') filtered = filtered.filter(m => m.goalId === selectedGoalId);
    
    return filtered.sort((a, b) => {
      const indexA = customOrder.indexOf(a.id);
      const indexB = customOrder.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      const uA = calculateUrgency(a, chaosMinutes).score;
      const uB = calculateUrgency(b, chaosMinutes).score;
      return uA - uB;
    });
  }, [tasks, chaosMinutes, selectedGoalId, currentRange, customOrder, currentTime]);

  // Auto-completion & Overdue Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      
      let changed = false;
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
      if (changed) setTasks(newTasks);

      // Check for overdue tasks to trigger edge flicker
      const hasNewOverdue = activeTasksList.some(m => !m.isCompleted && m.deadline < now && m.deadline > now - 60000);
      if (hasNewOverdue) {
        setShowEdgeFlicker(true);
        setTimeout(() => setShowEdgeFlicker(false), 500);
      }
    }, 10000); 
    return () => clearInterval(interval);
  }, [tasks, activeTasksList]);

  const completedTasksInRange = useMemo(() => {
    const explicitlyCompleted = tasks.filter(m => 
      m.isCompleted && m.deadline >= currentRange.start && m.deadline < currentRange.end &&
      (selectedGoalId === 'all' || m.goalId === selectedGoalId)
    );

    return explicitlyCompleted.sort((a, b) => (b.deadline || 0) - (a.deadline || 0));
  }, [tasks, selectedGoalId, currentRange]);

  const executionStats = useMemo(() => {
    const totalPossible = activeTasksList.length + completedTasksInRange.length;
    const progressPercent = totalPossible > 0 ? (completedTasksInRange.length / totalPossible) * 100 : 0;
    const urgentCount = activeTasksList.filter(m => calculateUrgency(m, chaosMinutes).level !== UrgencyLevel.SAFE).length;
    const goalName = selectedGoalId === 'all' ? 'All' : (goals.find(g => g.id === selectedGoalId)?.name || '');
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    let rangeLabel = isToday ? 'Today' : selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return { total: activeTasksList.length, completed: completedTasksInRange.length, urgentCount, viewModeLabel: `${goalName} ${rangeLabel}`, progressPercent };
  }, [activeTasksList, completedTasksInRange, chaosMinutes, selectedDate, selectedGoalId, goals]);

  const completeTask = useCallback((id: string) => {
    const isProjection = id.includes('-projection-');
    const baseId = isProjection ? id.split('-projection-')[0] : id;
    
    setTasks(prev => {
      const task = prev.find(m => m.id === baseId);
      if (!task || task.isCompleted) return prev;

      if (isProjection) {
        // Find the projection's deadline from activeTasksList
        const projectionTask = activeTasksList.find(t => t.id === id);
        if (!projectionTask) return prev;

        // Add the projection's deadline to canceledDates of the base task
        const updatedBaseTask = { 
          ...task, 
          canceledDates: [...(task.canceledDates || []), projectionTask.deadline] 
        };

        // Create a completed copy of the projection
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
    if (timerTaskId === baseId) handleCloseTimer();
  }, [timerTaskId, activeTasksList, userId]);

  const handleStartFocus = useCallback((id: string) => {
    const baseId = id.split('-projection-')[0];
    const task = tasks.find(m => m.id === baseId);
    if (!task) return;
    setTimerTaskId(baseId);
    const initialTime = taskProgress[baseId] !== undefined ? taskProgress[baseId] : task.estimatedDuration * 60;
    setTimeLeft(initialTime);
    setIsTimerActive(true);
    setIsTimerMinimized(false);
  }, [tasks, taskProgress]);

  const handleCloseTimer = () => {
    setIsTimerActive(false);
    setTimerTaskId(null);
    syncSettingsToFirestore(customOrder, taskProgress);
  };

  const handleSetToday = () => { setSelectedDate(new Date()); setViewMode('dashboard'); };
  const handleSetTomorrow = () => { setSelectedDate(new Date(Date.now() + 86400000)); setViewMode('dashboard'); };

  const isSplashActive = splashStep !== 'done';
  const isAppVisible = splashStep === 'bursting' || splashStep === 'done';

  if (!isAuthReady) {
    return <div className="min-h-screen bg-[#020617]"></div>;
  }

  if (!userId) {
    return <WelcomeScreen onLogin={handleLogin} loginError={loginError} />;
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-500 ${showEdgeFlicker ? 'overdue-edge-flicker' : ''}`}>
      
      {isSplashActive && (
        <div className={`splash-screen ${splashStep === 'bursting' ? 'bursting' : ''}`} onClick={() => { if (splashStep === 'welcome') initAudio(); }}>
          <div className="scanlines"></div>
          <div className="scanner-line"></div>
          <div className={`shockwave ${splashStep === 'bursting' ? 'shock-active' : ''}`}></div>
          
          <div className={`splash-content ${splashStep === 'igniting' ? 'scale-105' : ''} transition-transform duration-700`}>
            {clutterItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`clutter ${splashStep === 'igniting' ? 'opacity-0 scale-150 blur-lg' : ''}`}
                style={{
                  top: clutterPositions[idx].top,
                  left: clutterPositions[idx].left,
                  transform: `translate(-50%, -50%) rotate(${clutterPositions[idx].rotate}) scale(${clutterPositions[idx].scale})`,
                }}
              >
                {item.text} <span className="clutter-tag">[{item.code}]</span>
              </div>
            ))}

            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="font-mono text-xs text-blue-500 font-bold mb-2 tracking-widest animate-pulse">
                [ {displayedText} ]
              </div>
              
              <div 
                className={`reactor-container ${splashStep === 'igniting' ? 'igniting' : ''}`}
                onClick={initiateLaunch}
              >
                <div className="reactor-ring ring-inner"></div>
                <div className="reactor-ring ring-mid"></div>
                <div className="reactor-ring ring-outer"></div>
                <div className="reactor-core">
                  <i className="fa-solid fa-bolt bolt-main"></i>
                </div>
              </div>
              
              <div className={`mt-8 transition-opacity duration-500 ${splashStep !== 'welcome' ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-slate-400 font-black tracking-[0.4em] uppercase text-xs">
                  PURGE PLANNING. INITIATE ACTION.
                </p>
                <p className="text-slate-700 font-bold uppercase text-xs mt-2 tracking-widest font-mono">
                  &lt; PRESS SPACE OR CLICK TO IGNITE &gt;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex h-screen overflow-hidden ${isAppVisible ? 'entered' : 'hidden'}`}>
        <Sidebar 
          goals={goals}
          activeTab={viewMode === 'modus' ? 'dashboard' : viewMode}
          setActiveTab={(tab) => { setViewMode(tab); setIsSidebarOpen(false); }}
          selectedGoalId={selectedGoalId}
          setSelectedGoalId={(id) => { setSelectedGoalId(id); setIsSidebarOpen(false); }}
          onOpenGoalModal={() => setShowGoalForm(true)}
          streak={streak}
          progressPercent={executionStats.progressPercent}
          vibe={vibe}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <header className="p-4 sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 transition-colors duration-500">
            <div className="max-w-5xl mx-auto flex gap-4 justify-between items-center">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-0 active:translate-y-[4px]"
                >
                  <i className="fa-solid fa-bars"></i>
                </button>
                <div 
                  className="bg-blue-600 text-white px-3 py-2 rounded-xl flex items-center justify-center shadow-md transform -rotate-2 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => { initAudio(); playIgnitionSound(); }}
                  title="Systematic Productivity and Activity Management"
                >
                  <h1 className="font-black text-xl tracking-widest uppercase m-0 leading-none">SPAM</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-3">
            
                <ChaosControl chaosMinutes={chaosMinutes} setChaosMinutes={setChaosMinutes} />
                
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1"></div>
                
                <button
                  onClick={() => {
                    if (document.documentElement.classList.contains('dark')) {
                      document.documentElement.classList.remove('dark');
                      localStorage.setItem('theme', 'light');
                    } else {
                      document.documentElement.classList.add('dark');
                      localStorage.setItem('theme', 'dark');
                    }
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-0 active:translate-y-[4px]"
                  title="Toggle Theme"
                >
                  <i className="fa-solid fa-moon dark:hidden"></i>
                  <i className="fa-solid fa-sun hidden dark:block"></i>
                </button>

                <button onClick={() => setShowLogin(true)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-blue-600 bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-0 active:translate-y-[4px]" title={username ? `Logged in as ${username}` : "Login"}>
                  <i className={`fa-solid ${username ? 'fa-user-astronaut' : 'fa-user'}`}></i>
                </button>

                <button id="nav-add-task" onClick={() => { setEditingTask(null); setDraftTask(null); setShowTaskForm(true); }} className="ml-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white border-b-4 border-blue-700 hover:border-blue-600 active:border-b-0 active:translate-y-[4px] transition-all">
                  <i className="fa-solid fa-plus"></i> <span className="hidden sm:inline">Add Task</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-8 relative">
              {viewMode === 'dashboard' && (
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-xl items-center gap-1">
                    <button onClick={handleSetToday} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedDate.toDateString() === new Date().toDateString() ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>Today</button>
                    <button onClick={handleSetTomorrow} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedDate.toDateString() === new Date(Date.now() + 86400000).toDateString() ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>Tmrw</button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                    <input 
                      type="date" 
                      value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                      onChange={(e) => {
                        if (e.target.value) {
                          const [year, month, day] = e.target.value.split('-').map(Number);
                          setSelectedDate(new Date(year, month - 1, day));
                        }
                      }}
                      className="bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-4 px-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                     <div className="flex flex-col items-center px-4 border-r border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{executionStats.total}</span>
                     </div>
                     <div className="flex flex-col items-center px-4 border-r border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Done</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{executionStats.completed}</span>
                     </div>
                     <div className="flex flex-col items-center px-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urgent</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{executionStats.urgentCount}</span>
                     </div>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewMode === 'modus' ? (
                    <section>
                       <ModusOperandi tasks={tasks} />
                    </section>
                  ) : viewMode === 'calendar' ? (
                    <CalendarView tasks={tasks} selectedDate={selectedDate} selectedGoalId={selectedGoalId} onSelectDate={(date) => { setSelectedDate(date); setViewMode('dashboard'); }} />
                  ) : viewMode === 'goals' ? (
                    <GoalsView tasks={tasks} goals={goals} />
                  ) : (
                    <Dashboard 
                      activeTasks={activeTasksList} 
                      completedTasks={completedTasksInRange} 
                      goals={goals} 
                      chaosMinutes={chaosMinutes} 
                      currentTime={currentTime}
                      onComplete={completeTask} 
                      onDelete={id => {
                        const taskToCancel = [...activeTasksList, ...completedTasksInRange].find(t => t.id === id);
                        if (id.includes('-projection-')) {
                          const baseId = id.split('-projection-')[0];
                          if (taskToCancel) {
                            setTasks(prev => prev.map(t => {
                              if (t.id === baseId) {
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
                      }} 
                      onFocus={handleStartFocus} 
                      onEdit={(task) => { 
                        let taskToEdit = task;
                        if (task.isProjection && task.id.includes('-projection-')) {
                          const baseId = task.id.split('-projection-')[0];
                          const baseTask = tasks.find(t => t.id === baseId);
                          if (baseTask) {
                            taskToEdit = baseTask;
                          }
                        }
                        setEditingTask(taskToEdit); 
                        setShowTaskForm(true); 
                      }} 
                      onReorder={ids => {
                        setCustomOrder(ids);
                        syncSettingsToFirestore(ids, taskProgress);
                      }} 
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              <footer className="mt-16 pt-8 pb-4 text-center border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                  Built by <span className="text-blue-500 font-bold">The Product Folks:</span> NIT Trichy
                </p>
              </footer>
            </div>
          </main>
        </div>
      </div>

      {(showTaskForm || editingTask) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white dark:bg-slate-900/50 backdrop-blur-sm transition-colors duration-500">
          <TaskForm 
            onAdd={taskData => { 
              const newTask = { ...taskData, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now(), isCompleted: false } as Task;
              setTasks(prev => [...prev, newTask]); 
              syncTaskToFirestore(newTask);
              setShowTaskForm(false); 
              setDraftTask(null);
            }} 
            onUpdate={(id, updates) => { 
              setTasks(prev => prev.map(m => {
                if (m.id === id) {
                  const updated = { ...m, ...updates };
                  syncTaskToFirestore(updated);
                  return updated;
                }
                return m;
              })); 
              setEditingTask(null); 
              setDraftTask(null);
              setShowTaskForm(false);
            }} 
            initialData={editingTask} 
            draftData={draftTask}
            defaultDate={selectedDate} 
            goals={goals} 
            onCreateGoal={(draft: Partial<Task>) => { 
              setDraftTask(draft);
              setReturnToTaskForm(true);
              setShowTaskForm(false); 
              setShowGoalForm(true); 
            }} 
            onClose={() => { setShowTaskForm(false); setEditingTask(null); setDraftTask(null); }} 
          />
        </div>
      )}

      {showGoalForm && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-white dark:bg-slate-900/50 backdrop-blur-sm transition-colors duration-500">
          <GoalForm 
            existingGoals={goals} 
            onAdd={goal => { 
              const newGoal = { ...goal, id: Math.random().toString(36).substr(2, 9) } as Goal;
              setGoals(prev => [...prev, newGoal]); 
              syncGoalToFirestore(newGoal);
              setShowGoalForm(false); 
              if (returnToTaskForm) {
                setShowTaskForm(true);
                setReturnToTaskForm(false);
              }
            }} 
            onClose={() => { 
              setShowGoalForm(false); 
              if (returnToTaskForm) {
                setShowTaskForm(true);
                setReturnToTaskForm(false);
              }
            }} 
          />
        </div>
      )}

      {showOnboarding && userId && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {showLogin && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-white dark:bg-slate-900/50 backdrop-blur-sm transition-colors duration-500">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300 border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-center mb-6">
               <div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Identity Link</h3>
                 <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Pilot Authentication</p>
               </div>
               <button onClick={() => setShowLogin(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
                 <i className="fa-solid fa-xmark"></i>
               </button>
             </div>
             
             <div className="space-y-6 text-center">
               <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 mx-auto flex items-center justify-center text-3xl text-indigo-600">
                 <i className="fa-solid fa-user-astronaut"></i>
               </div>
               <div>
                 <p className="text-xs text-slate-400 uppercase tracking-wider">Current Pilot</p>
                 {isEditingUsername ? (
                   <div className="flex items-center justify-center gap-2 mt-2">
                     <input 
                       type="text" 
                       value={tempUsername} 
                       onChange={(e) => setTempUsername(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleUpdateUsername()}
                       className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                       autoFocus
                     />
                     <button 
                       onClick={handleUpdateUsername}
                       className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors"
                     >
                       <i className="fa-solid fa-check"></i>
                     </button>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center gap-2 mt-1 group">
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{username}</h2>
                     <button 
                       onClick={() => {
                         setTempUsername(username || '');
                         setIsEditingUsername(true);
                       }}
                       className="w-6 h-6 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                       title="Edit Name"
                     >
                       <i className="fa-solid fa-pen text-xs"></i>
                     </button>
                   </div>
                 )}
               </div>
               <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100">
                 <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                   <i className="fa-solid fa-cloud"></i>
                   Data Synced to Cloud
                 </p>
               </div>
               <button 
                 onClick={handleLogout}
                 className="w-full py-3 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 font-bold text-xs uppercase tracking-wider hover:bg-rose-50 dark:bg-rose-900/30 transition-colors"
               >
                 Disconnect
               </button>
             </div>
          </div>
        </div>
      )}

      {tasks.find(m => m.id === timerTaskId) && !isTimerMinimized && (
        <FocusMode task={tasks.find(m => m.id === timerTaskId)!} timeLeft={timeLeft} isTimerActive={isTimerActive} onToggleTimer={() => setIsTimerActive(!isTimerActive)} onMinimize={() => setIsTimerMinimized(true)} onClose={handleCloseTimer} onComplete={() => completeTask(timerTaskId!)} />
      )}

      {tasks.find(m => m.id === timerTaskId) && isTimerMinimized && (
        <MinimizedTimer taskName={tasks.find(m => m.id === timerTaskId)!.name} timeLeft={timeLeft} totalTime={tasks.find(m => m.id === timerTaskId)!.estimatedDuration * 60} isTimerActive={isTimerActive} onToggleTimer={() => setIsTimerActive(!isTimerActive)} onExpand={() => setIsTimerMinimized(false)} onClose={handleCloseTimer} />
      )}
    </div>
  );
};

export default App;
