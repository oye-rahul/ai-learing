import React from 'react';

interface ActivityCalendarProps {
  className?: string;
}

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ className = '' }) => {
  // Generate calendar data for the last 12 weeks
  const generateCalendarData = () => {
    const data = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 84); // 12 weeks ago

    for (let i = 0; i < 84; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Simulate activity data
      const activity = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
      
      data.push({
        date: date.toISOString().split('T')[0],
        activity,
        day: date.getDay(),
        week: Math.floor(i / 7),
      });
    }
    
    return data;
  };

  const calendarData = generateCalendarData();
  const weeks = Array.from({ length: 12 }, (_, i) => i);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getActivityColor = (activity: number) => {
    switch (activity) {
      case 0:
        return 'bg-slate-100 dark:bg-slate-800';
      case 1:
        return 'bg-green-200 dark:bg-green-900';
      case 2:
        return 'bg-green-300 dark:bg-green-700';
      case 3:
        return 'bg-green-400 dark:bg-green-600';
      case 4:
        return 'bg-green-500 dark:bg-green-500';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const getTooltipText = (date: string, activity: number) => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    
    if (activity === 0) {
      return `No activity on ${formattedDate}`;
    }
    
    return `${activity} ${activity === 1 ? 'session' : 'sessions'} on ${formattedDate}`;
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Less
        </span>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
              title={`${level} sessions`}
            />
          ))}
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          More
        </span>
      </div>
      
      <div className="grid grid-cols-12 gap-1">
        {weeks.map((week) => (
          <div key={week} className="grid grid-rows-7 gap-1">
            {days.map((_, dayIndex) => {
              const dayData = calendarData.find(
                (d) => d.week === week && d.day === dayIndex
              );
              
              if (!dayData) return <div key={dayIndex} className="w-3 h-3" />;
              
              return (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${getActivityColor(dayData.activity)} hover:ring-2 hover:ring-primary-500 cursor-pointer transition-all`}
                  title={getTooltipText(dayData.date, dayData.activity)}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span>84 days of coding activity</span>
      </div>
    </div>
  );
};

export default ActivityCalendar;
