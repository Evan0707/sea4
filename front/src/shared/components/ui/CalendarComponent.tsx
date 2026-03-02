import React, { useState, useMemo } from 'react';
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
 differenceInDays,
 addDays,
 startOfDay,
 endOfDay
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
 const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lundi
 const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

 const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

 // Générer les semaines
 const weeks = useMemo(() => {
  const weeksArray = [];
  let currentWeekStart = calendarStart;

  while (currentWeekStart <= calendarEnd) {
   const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
   weeksArray.push({
    start: currentWeekStart,
    end: currentWeekEnd,
    days: eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd })
   });
   currentWeekStart = addDays(currentWeekEnd, 1);
  }
  return weeksArray;
 }, [calendarStart, calendarEnd]);

 // Préparer les événements pour l'affichage (positionnement)
 const getWeekEvents = (weekStart: Date, weekEnd: Date) => {
  // 1. Filtrer les événements qui intersectent cette semaine
  const weekEvents = events.filter(event => {
   const evtStart = startOfDay(parseISO(event.start));
   const evtEnd = endOfDay(parseISO(event.end));
   return (evtStart <= weekEnd && evtEnd >= weekStart);
  }).map(event => {
   // 2. Calculer la position relative dans la semaine
   const evtStart = startOfDay(parseISO(event.start));
   const evtEnd = endOfDay(parseISO(event.end));

   const effectiveStart = evtStart < weekStart ? weekStart : evtStart;
   const effectiveEnd = evtEnd > weekEnd ? weekEnd : evtEnd;

   const colStart = differenceInDays(effectiveStart, weekStart);
   const span = differenceInDays(effectiveEnd, effectiveStart) + 1;

   return {
    original: event,
    colStart, // 0-6
    span,     // 1-7
    isStart: isSameDay(evtStart, effectiveStart),
    isEnd: isSameDay(evtEnd, effectiveEnd)
   };
  });

  // 3. Algorithme de placement (Tetris-like) pour éviter les chevauchements
  weekEvents.sort((a, b) => a.colStart - b.colStart || (b.span - a.span)); // Trier par début puis longueur

  const rows: any[][] = []; // [Row1: [evt1, evt2], Row2: [evt3]]

  const positionedEvents = weekEvents.map(evt => {
   let rowIndex = 0;
   while (true) {
    if (!rows[rowIndex]) {
     rows[rowIndex] = [];
     break;
    }
    // Vérifier collision dans cette ligne
    const hasCollision = rows[rowIndex].some(existing => {
     const existingEnd = existing.colStart + existing.span;
     const evtEnd = evt.colStart + evt.span;
     return (evt.colStart < existingEnd && evtEnd > existing.colStart);
    });

    if (!hasCollision) break;
    rowIndex++;
   }
   rows[rowIndex].push(evt);
   return { ...evt, rowIndex };
  });

  return { events: positionedEvents, totalRows: rows.length };
 };

 return (
  <div className="bg-bg-secondary rounded-lg border border-border overflow-hidden select-none">
   {/* Header */}
   <div className="flex items-center justify-between p-4 border-b border-border bg-bg-secondary/10">
    <H3 className="capitalize text-lg font-semibold text-text-primary">
     {format(currentDate, 'MMMM yyyy', { locale: fr })}
    </H3>
    <div className="flex gap-2">
     <button onClick={prevMonth} className="p-2 hover:bg-bg-secondary rounded-full transition-colors text-text-primary hover:text-text-primary">
      <ChevronLeft className="w-5 h-5" />
     </button>
     <button onClick={resetToday} className="px-3 py-1 text-sm border border-border rounded-md bg-bg-primary text-text-primary hover:text-text-primary transition-colors">
      Aujourd'hui
     </button>
     <button onClick={nextMonth} className="p-2 hover:bg-bg-secondary rounded-full transition-colors text-text-primary hover:text-text-primary">
      <ChevronRight className="w-5 h-5" />
     </button>
    </div>
   </div>

   {/* Days Header */}
   <div className="grid grid-cols-7 border-b border-border bg-bg-secondary/30">
    {weekDays.map(day => (
     <div key={day} className="py-2 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border/50 last:border-r-0">
      {day}
     </div>
    ))}
   </div>

   {/* Weeks Grid */}
   <div className="flex flex-col">
    {weeks.map((week, weekIndex) => {
     const { events: weekEvents, totalRows } = getWeekEvents(week.start, week.end);
     // Hauteur min pour une semaine : Header jour + espace événements
     const minHeight = Math.max(100, (totalRows * 28) + 40);

     return (
      <div
       key={weekIndex}
       className="relative border-b border-border last:border-b-0 flex"
       style={{ minHeight: `${minHeight}px` }}
      >
       {/* Fond de grille (Jours) */}
       <div className="absolute inset-0 grid grid-cols-7 w-full h-full bg-bg-primary hover:bg-bg-secondary
        text-text-primary">
        {week.days.map((day, dayIndex) => {
         const isCurrentMonth = isSameMonth(day, monthStart);
         const isToday = isSameDay(day, new Date());
         const isSunday = day.getDay() === 0;

         return (
          <div
           key={day.toISOString()}
           onClick={() => onDateClick?.(day)}
           className={`
                        border-r border-border/50 last:border-r-0 p-2 cursor-pointer transition-colors hover:bg-bg-secondary/10
                        ${!isCurrentMonth ? 'bg-gray-50/50 text-text-placeholder' : isSunday ? 'bg-red-50/30' : ''}
                      `}
          >
           <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white font-bold' : ''}`}>
            {format(day, 'd')}
           </span>
          </div>
         );
        })}
       </div>

       {/* Layer événements */}
       <div className="absolute inset-0 top-8 px-0 w-full pointer-events-none">
        {/* Top offset pour ne pas masquer les numéros de jour */}
        <div className="relative w-full h-full">
         {weekEvents.map((evt) => (
          <div
           key={`${evt.original.id}-${weekIndex}`}
           onClick={(e) => {
            e.stopPropagation(); // Stop propagation to row
            onEventClick?.(evt.original);
           }}
           className={`
                          absolute h-6 text-xs px-2 rounded flex items-center cursor-pointer pointer-events-auto transition-all hover:brightness-95 border
                          ${evt.original.type === 'chantier'
             ? 'bg-bg-tertiary text-blue-500 border-blue-500 hover:text-blue-400 hover:border-blue-400'
             : 'bg-red-100/90 text-red-500 border-red-500 hover:text-red-400 hover:border-red-400'}
                        `}
           style={{
            left: `${(evt.colStart / 7) * 100}%`,
            top: `${evt.rowIndex * 28}px`, // 24px height + 4px gap
            // Marges latérales pour détacher visuellement
            marginLeft: '2px',
            width: `calc(${(evt.span / 7) * 100}% - 4px)`,
            // Arrondis conditionnels
            borderTopLeftRadius: evt.isStart ? '4px' : '0',
            borderBottomLeftRadius: evt.isStart ? '4px' : '0',
            borderTopRightRadius: evt.isEnd ? '4px' : '0',
            borderBottomRightRadius: evt.isEnd ? '4px' : '0',
            // Bordures pour continuité
            borderLeftWidth: evt.isStart ? '1px' : '0',
            borderRightWidth: evt.isEnd ? '1px' : '0',
           }}
           title={evt.original.title}
          >
           <div className="flex items-center justify-between w-full overflow-hidden gap-1">
            <span className="truncate font-medium leading-none">
             {evt.isStart ? evt.original.title : ''}
            </span>

            {onDeleteEvent && evt.original.type === 'indisponibilite' && (
             <button
              onClick={(e) => {
               e.stopPropagation();
               onDeleteEvent(evt.original);
              }}
              className="p-0.5 hover:bg-red-200 rounded text-red-600 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
              title="Supprimer"
             >
              <Trash className="w-3 h-3" />
             </button>
            )}
           </div>
          </div>
         ))}
        </div>
       </div>
      </div>
     );
    })}
   </div>
  </div>
 );
};

export default Calendar;
