
import React, { useState, useEffect } from 'react';
import { Task, PriorityLevel, RecurrenceType, Goal } from '../types';

interface TaskFormProps {
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  onUpdate?: (id: string, task: Partial<Task>) => void;
  onClose: () => void;
  initialData?: Task | null;
  draftData?: Partial<Task> | null;
  defaultDate?: Date;
  goals: Goal[];
  onCreateGoal: (currentState: Partial<Task>) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, onUpdate, onClose, initialData, draftData, defaultDate, goals, onCreateGoal }) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [deadline, setDeadline] = useState('');
  const [hasTime, setHasTime] = useState(true);
  const [duration, setDuration] = useState('30');
  const [minDuration, setMinDuration] = useState('');
  const [isHardBlock, setIsHardBlock] = useState(false);
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [goalId, setGoalId] = useState<string>('');
  const [contributionLevel, setContributionLevel] = useState(5);
  const [isAutoCompletable, setIsAutoCompletable] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const source = draftData || initialData;
    if (source) {
      setName(source.name || '');
      setNotes(source.notes || '');
      if (source.deadline) {
        const date = new Date(source.deadline);
        if (!isNaN(date.getTime())) {
            const formattedDate = date.toISOString().slice(0, 16);
            setDeadline(formattedDate);
        }
      }
      setHasTime(source.hasTime !== false);
      setDuration(source.estimatedDuration?.toString() || '30');
      setMinDuration(source.minDuration?.toString() || '');
      setIsHardBlock(source.isHardBlock || false);
      setPriority(source.priority || PriorityLevel.MEDIUM);
      setRecurrence(source.recurrence || 'none');
      setGoalId(source.goalId || '');
      setContributionLevel(source.contributionLevel || 5);
      setIsAutoCompletable(source.isAutoCompletable || false);
    } else if (defaultDate) {
      const now = new Date();
      const year = defaultDate.getFullYear();
      const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const day = String(defaultDate.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setDeadline(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [initialData, draftData, defaultDate]);

  const handleCreateGoal = () => {
    let finalDeadline = deadline ? new Date(deadline).getTime() : undefined;
    if (finalDeadline && !hasTime) {
      const d = new Date(finalDeadline);
      d.setHours(23, 59, 59, 999);
      finalDeadline = d.getTime();
    }
    const currentDraft: Partial<Task> = {
        name,
        notes,
        deadline: finalDeadline,
        hasTime,
        estimatedDuration: parseInt(duration) || 30,
        minDuration: minDuration ? parseInt(minDuration) : undefined,
        isHardBlock,
        startTime: isHardBlock ? finalDeadline : undefined,
        priority,
        recurrence,
        goalId,
        contributionLevel,
        isAutoCompletable
    };
    onCreateGoal(currentDraft);
  };

  const handleTimeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    let current = deadline ? new Date(deadline) : new Date();
    if (isNaN(current.getTime())) current = new Date();
    
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const h = String(hours).padStart(2, '0');
    const m = String(mins).padStart(2, '0');
    
    setDeadline(`${year}-${month}-${day}T${h}:${m}`);
  };

  const getSliderValue = () => {
    if (!deadline) return 0;
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return 0;
    return d.getHours() * 60 + d.getMinutes();
  };

  const handleDateSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const daysOffset = parseInt(e.target.value);
    let current = deadline ? new Date(deadline) : new Date();
    if (isNaN(current.getTime())) current = new Date();
    
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysOffset);
    
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const h = String(current.getHours()).padStart(2, '0');
    const m = String(current.getMinutes()).padStart(2, '0');
    
    setDeadline(`${year}-${month}-${day}T${h}:${m}`);
  };

  const getDateSliderValue = () => {
    if (!deadline) return 0;
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !deadline) return;

    let finalDeadline = new Date(deadline).getTime();
    if (!hasTime) {
      const d = new Date(finalDeadline);
      d.setHours(23, 59, 59, 999);
      finalDeadline = d.getTime();
    }

    const taskData = {
      name,
      notes: notes.trim() || undefined,
      deadline: finalDeadline,
      hasTime,
      estimatedDuration: parseInt(duration),
      minDuration: minDuration ? parseInt(minDuration) : undefined,
      isHardBlock,
      startTime: isHardBlock ? finalDeadline : undefined,
      priority,
      isImportant: priority === PriorityLevel.CRITICAL || priority === PriorityLevel.HIGH,
      recurrence,
      goalId: goalId || undefined,
      contributionLevel,
      isAutoCompletable
    };

    if (initialData && onUpdate) {
      onUpdate(initialData.id, taskData);
    } else {
      onAdd(taskData);
    }
  };

  const priorityOptions = [
    { label: 'Critical', value: PriorityLevel.CRITICAL, color: 'bg-rose-50 dark:bg-rose-900/300' },
    { label: 'High', value: PriorityLevel.HIGH, color: 'bg-orange-50 dark:bg-orange-900/300' },
    { label: 'Medium', value: PriorityLevel.MEDIUM, color: 'bg-blue-50 dark:bg-blue-900/300' },
    { label: 'Low', value: PriorityLevel.LOW, color: 'bg-slate-50 dark:bg-slate-8000' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm text-blue-600">
              <i className={`fa-solid ${initialData ? 'fa-pen-to-square' : 'fa-plus'}`}></i>
            </div>
            {initialData ? 'Update Task' : 'Add Task'}
          </h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Task Parameters</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Objective</label>
          <div className="relative">
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What needs to be executed?"
              maxLength={30}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base font-medium text-slate-900 dark:text-white pr-16"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <span className={`text-[10px] font-mono font-bold ${name.length >= 30 ? 'text-rose-500' : 'text-slate-400'}`}>
                 {name.length}/30
               </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Execution Notes (Optional)</label>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Details, sub-tasks, or context..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm min-h-[100px] resize-none text-slate-900 dark:text-white"
          />
        </div>

        <div className={`p-4 rounded-xl border-2 transition-all ${isHardBlock ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-400 dark:border-blue-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-sm font-bold flex items-center gap-2 ${isHardBlock ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                <i className="fa-solid fa-calendar-check"></i>
                Hard Scheduled Event
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Fixed time blocks (e.g., meetings)</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-10 h-5 rounded-full transition-colors relative ${isHardBlock ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isHardBlock ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <input 
                type="checkbox" 
                checked={isHardBlock} 
                onChange={e => setIsHardBlock(e.target.checked)} 
                className="hidden" 
              />
            </label>
          </div>

          {isHardBlock && (
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Start Time
                </label>
                <input 
                  type="datetime-local" 
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Duration (Min)
                </label>
                <input 
                  type="number" 
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {!isHardBlock && (
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Date
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Has Time</span>
                  <div className={`w-8 h-4 rounded-full transition-colors relative ${hasTime ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${hasTime ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <input 
                    type="checkbox" 
                    checked={hasTime} 
                    onChange={e => setHasTime(e.target.checked)} 
                    className="hidden" 
                  />
                </label>
              </div>
              <input 
                type={hasTime ? "datetime-local" : "date"} 
                value={hasTime ? deadline : deadline.split('T')[0]}
                onChange={e => {
                  if (hasTime) {
                    setDeadline(e.target.value);
                  } else {
                    const d = new Date(deadline || new Date());
                    const newDate = e.target.value;
                    if (newDate) {
                      const [year, month, day] = newDate.split('-');
                      d.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
                      const h = String(d.getHours()).padStart(2, '0');
                      const m = String(d.getMinutes()).padStart(2, '0');
                      setDeadline(`${year}-${month}-${day}T${h}:${m}`);
                    }
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-900 dark:text-white"
              />
              <div className="pt-2 space-y-4">
                <div>
                  <input 
                    type="range" 
                    min="0" 
                    max="14" 
                    value={getDateSliderValue()} 
                    onChange={handleDateSliderChange}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    <span>Today</span>
                    <span>+1W</span>
                    <span>+2W</span>
                  </div>
                </div>
                {hasTime && (
                  <div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1439" 
                      value={getSliderValue()} 
                      onChange={handleTimeSliderChange}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                      <span>00:00</span>
                      <span>12:00</span>
                      <span>23:59</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ideal Duration (Min)
                </label>
                <input 
                  type="number" 
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Min Duration (Min)</label>
                <input 
                  type="number" 
                  value={minDuration}
                  onChange={e => setMinDuration(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goal</label>
            <button 
              type="button" 
              onClick={handleCreateGoal}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1"
            >
              <i className="fa-solid fa-plus-circle"></i> Create New
            </button>
          </div>
          <select 
            value={goalId} 
            onChange={e => setGoalId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none text-slate-900 dark:text-white"
          >
            <option value="">No Goal</option>
            {goals.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
           <div className="flex justify-between items-center">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goal Contribution</label>
             <span className="text-xs font-bold text-indigo-600">{contributionLevel}/10</span>
           </div>
           <input 
             type="range" 
             min="1" 
             max="10" 
             value={contributionLevel} 
             onChange={e => setContributionLevel(parseInt(e.target.value))}
             className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
           />
           <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
             <span>Minor</span>
             <span>Essential</span>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
            <div className="grid grid-cols-2 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                    priority === opt.value 
                    ? `${opt.color} border-transparent text-slate-900 dark:text-white shadow-sm` 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recurrence</label>
            <div className="grid grid-cols-2 gap-2">
              {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRecurrence(type)}
                  className={`py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                    recurrence === type
                    ? 'bg-indigo-600 border-transparent text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-300'
                  }`}
                >
                  {type === 'none' ? 'None' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
           <button 
             type="button"
             onClick={() => setShowAdvanced(!showAdvanced)}
             className="w-full flex justify-between items-center py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-indigo-600 transition-colors"
           >
              Advanced Parameters
              <i className={`fa-solid fa-chevron-right transition-transform ${showAdvanced ? 'rotate-90' : ''}`}></i>
           </button>
           
           {showAdvanced && (
             <div className="pt-4 pb-2 space-y-4 animate-in slide-in-from-top-2">
               <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                       <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Auto-Completion</p>
                      <p className="text-[10px] text-slate-400">Mark done after duration expires</p>
                    </div>
                 </div>
                 <button
                   type="button"
                   onClick={() => setIsAutoCompletable(!isAutoCompletable)}
                   className={`w-12 h-6 rounded-full transition-colors relative ${isAutoCompletable ? 'bg-indigo-600' : 'bg-slate-300'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full transition-all ${isAutoCompletable ? 'left-7' : 'left-1'}`} />
                 </button>
               </div>
             </div>
           )}
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-400 text-white border-b-4 border-blue-700 hover:border-blue-600 active:border-b-0 active:translate-y-[4px] font-bold py-4 rounded-xl transition-all uppercase tracking-wider text-sm"
        >
          {initialData ? 'Update Task' : 'Add Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
