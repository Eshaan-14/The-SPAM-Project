
import React, { useState } from 'react';

interface CalendarModalProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ selectedDate, onSelectDate, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty slots for previous month's days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-full"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <button
          key={day}
          onClick={() => {
            onSelectDate(date);
            onClose();
          }}
          className={`h-12 w-full rounded-xl flex items-center justify-center text-sm font-bold transition-all relative group
            ${isSelected ? 'bg-emerald-600 text-white shadow-lg shadow-blue-900/40' : 'hover:bg-white dark:bg-slate-900/5 text-slate-600 dark:text-slate-300'}
            ${isToday && !isSelected ? 'text-blue-400' : ''}
          `}
        >
          {day}
          {isToday && !isSelected && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-50 dark:bg-indigo-900/300 rounded-full"></div>
          )}
        </button>
      );
    }

    return days;
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const yearName = currentMonth.getFullYear();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="glass p-8 rounded-[2.5rem] w-full max-w-sm border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Select Date</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Timeline Jump</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white dark:bg-slate-900/5 flex items-center justify-center text-slate-400">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex justify-between items-center mb-6 px-2">
          <button onClick={handlePrevMonth} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900/5 hover:bg-white dark:bg-slate-900/10 flex items-center justify-center transition-colors">
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
            {monthName} {yearName}
          </div>
          <button onClick={handleNextMonth} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900/5 hover:bg-white dark:bg-slate-900/10 flex items-center justify-center transition-colors">
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderDays()}
        </div>

        <button 
          onClick={() => { onSelectDate(new Date()); onClose(); }}
          className="w-full mt-8 py-4 bg-white dark:bg-slate-900/5 hover:bg-indigo-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all text-slate-400 border border-white/5"
        >
          Return to Today
        </button>
      </div>
    </div>
  );
};

export default CalendarModal;
