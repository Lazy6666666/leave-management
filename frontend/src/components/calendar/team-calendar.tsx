'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface LeaveEvent {
  id: string;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  color: string;
}

interface TeamCalendarProps {
  leaves: LeaveEvent[];
  selectedDate?: Date;
  onDateSelect: (date: Date | null) => void;
  currentMonth: Date;
}

export function TeamCalendar({ leaves, selectedDate, onDateSelect, currentMonth }: TeamCalendarProps) {
  const [calendarDate, setCalendarDate] = useState(currentMonth);

  useEffect(() => {
    setCalendarDate(currentMonth);
  }, [currentMonth]);

  const startDay = startOfWeek(startOfMonth(calendarDate));
  const endDay = endOfWeek(endOfMonth(calendarDate));
  const days = eachDayOfInterval({ start: startDay, end: endDay });

  const handleDateClick = (day: Date) => {
    onDateSelect(selectedDate && isSameDay(day, selectedDate) ? null : day);
  };

  return (
    <Card>
      <CardHeader>
        <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold leading-6 text-muted-foreground">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 gap-px bg-muted">
          {days.map((day) => {
            const dayLeaves = leaves.filter(leave => 
              (isSameDay(day, leave.startDate) || day > leave.startDate) && 
              (isSameDay(day, leave.endDate) || day < leave.endDate)
            );

            return (
              <div
                key={day.toString()}
                onClick={() => handleDateClick(day)}
                className={cn(
                  'relative min-h-[120px] bg-card text-card-foreground p-2',
                  isSameMonth(day, calendarDate) ? '' : 'bg-muted',
                  isSameDay(day, new Date()) && 'bg-primary/10',
                  selectedDate && isSameDay(day, selectedDate) && 'border-2 border-blue-500',
                  'cursor-pointer'
                )}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')} className="text-sm">
                  {format(day, 'd')}
                </time>
                <div className="mt-1 space-y-1">
                  {dayLeaves.slice(0, 2).map(leave => (
                    <div 
                      key={leave.id} 
                      className="text-xs rounded-md px-1 text-white truncate"
                      style={{ backgroundColor: leave.color }}
                    >
                      {leave.employeeName}
                    </div>
                  ))}
                  {dayLeaves.length > 2 && (
                    <div className="text-xs text-muted-foreground">+ {dayLeaves.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}