import React, { useState } from 'react';
import {
 format,
 startOfMonth,
 endOfMonth,
 startOfWeek,
 endOfWeek,
 eachDayOfInterval,
 isSameMonth,
 isSameDay,
 addMonths,
 subMonths,
 parseISO,
 isWithinInterval
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Trash } from '@mynaui/icons-react';
import { H3 } from './Typography';

export interface CalendarEvent {
 id: string;
 title: string;
 start: string; // YYYY-MM-DD
 end: string;   // YYYY-MM-DD
 type: 'chantier' | 'indisponibilite';
 details?: any;
}

interface CalendarProps {
 events: CalendarEvent[];
 onEventClick?: (event: CalendarEvent) => void;
 onDeleteEvent?: (event: CalendarEvent) => void;
 onDateClick?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onEventClick, onDateClick, onDeleteEvent }) => {
 const [currentDate, setCurrentDate] = useState(new Date());

 const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
 const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
 const resetToday = () => setCurrentDate(new Date());

 const monthStart = startOfMonth(currentDate);
 const monthEnd = endOfMonth(currentDate);
 const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lundi
 const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

 const days = eachDayOfInterval({ start: startDate, end: endDate });

 const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

 return (
  <div className="bg-bg-secondary rounded-lg border border-border overflow-hidden select-none">
   {/* Header */}
   <div className="flex items-center justify-between p-4 border-b border-border bg-bg-secondary/10">
    <H3 className="capitalize text-lg font-semibold text-text-primary">
     {format(currentDate, 'MMMM yyyy', { locale: fr })}
    </H3>
    <div className="flex gap-2">
     <button onClick={prevMonth} className="p-2 hover:bg-bg-secondary rounded-full transition-colors text-text-secondary hover:text-text-primary">
      <ChevronLeft className="w-5 h-5" />
     </button>
     <button onClick={resetToday} className="px-3 py-1 text-sm border border-border rounded-md bg-bg-primary text-text-secondary hover:text-text-primary transition-colors">
      Aujourd'hui
     </button>
     <button onClick={nextMonth} className="p-2 hover:bg-bg-secondary rounded-full transition-colors text-text-secondary hover:text-text-primary">
      <ChevronRight className="w-5 h-5" />
     </button>
    </div>
   </div>

   {/* Days Header */}
   <div className="grid grid-cols-7 border-b border-border bg-bg-secondary/30">
    {weekDays.map(day => (
     <div key={day} className="py-2 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
      {day}
     </div>
    ))}
   </div>

   {/* Grid */}
   <div className="grid grid-cols-7 auto-rows-fr bg-border gap-px">
    {days.map(day => {
     const isCurrentMonth = isSameMonth(day, monthStart);
     const isToday = isSameDay(day, new Date());

     // Find events for this day
     const dayEvents = events.filter(event => {
      const start = parseISO(event.start);
      const end = parseISO(event.end);
      return isWithinInterval(day, { start, end });
     });

     const isSunday = day.getDay() === 0;

     return (
      <div
       key={day.toISOString()}
       onClick={() => onDateClick?.(day)}
       className={`min-h-[120px] p-2 flex flex-col gap-1 cursor-pointer transition-colors hover:bg-bg-secondary/10 
        ${!isCurrentMonth ? 'bg-gray-200 text-text-secondary' : isSunday ? 'bg-red-100' : 'bg-bg-primary'}
       `}
      >
       <div className="flex justify-between items-start">
        <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white font-bold' : 'text-text-secondary'}`}>
         {format(day, 'd')}
        </span>
       </div>

       <div className="flex flex-col gap-1 mt-1">
        {dayEvents.map(event => {
         const isStart = isSameDay(day, parseISO(event.start));
         // const isEnd = isSameDay(day, parseISO(event.end));

         return (
          <div
           key={event.id}
           onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
           className={`
                         text-xs p-1.5 rounded cursor-pointer transition-all hover:translate-x-0.5 relative group ring-1 ring-inset
                         ${event.type === 'chantier'
             ? 'bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100'
             : 'bg-red-50 text-red-700 ring-red-200 hover:bg-red-100'
            }
                       `}
           title={event.title}
          >
           <div className="flex justify-between items-center overflow-hidden">
            <span className="truncate font-medium">{isStart ? event.title : '...'}</span>
            {onDeleteEvent && event.type === 'indisponibilite' && (
             <button
              onClick={(e) => {
               e.stopPropagation();
               onDeleteEvent(event);
              }}
              className="p-0.5 hover:bg-red-200 rounded text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Supprimer"
             >
              <Trash className="w-3 h-3" />
             </button>
            )}
           </div>
          </div>
         );
        })}
       </div>
      </div>
     );
    })}
   </div>
  </div>
 );
};

export default Calendar;
