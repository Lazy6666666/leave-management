'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarEventWithEmployee, CalendarViewOptions } from '@/types/calendar-documents-reporting';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface CalendarProps {
  viewOptions?: CalendarViewOptions;
  events?: CalendarEventWithEmployee[];
  onEventClick?: (event: CalendarEventWithEmployee) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

interface CalendarUIEvent {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  event_type: 'leave' | 'holiday' | 'meeting' | 'personal';
  color?: string;
  employee: {
    first_name: string;
    last_name: string;
  };
}

const eventTypeColors = {
  leave: 'bg-destructive',
  holiday: 'bg-primary',
  meeting: 'bg-success',
  personal: 'bg-secondary',
};

const eventTypeLabels = {
  leave: 'Leave',
  holiday: 'Holiday',
  meeting: 'Meeting',
  personal: 'Personal',
};

export function Calendar({ 
  viewOptions = { 
    view: 'month', 
    date: new Date().toISOString(), 
    show_leave_events: true, 
    show_holidays: true, 
    show_personal_events: true, 
    show_meetings: true 
  }, 
  events = [], 
  onEventClick, 
  onDateSelect, 
  className 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(viewOptions.date));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  const supabase = createClient();

  // Fetch calendar events
  const { data: calendarEvents = [], isLoading } = useQuery({
    queryKey: ['calendar-events', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const startOfMonthDate = startOfMonth(currentDate);
      const endOfMonthDate = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          employee:employees!employee_id(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          ),
          leave_request:leave_requests!leave_request_id(
            id,
            leave_type:leave_types!leave_type_id(name),
            status
          )
        `)
        .gte('start_date', startOfMonthDate.toISOString())
        .lte('end_date', endOfMonthDate.toISOString())
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
      }

      return data as CalendarEventWithEmployee[];
    },
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      return date >= eventStart && date <= eventEnd;
    });
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayEvents = getEventsForDate(cloneDay);

        days.push(
          // Replace in the month view
          <div
            key={day.toString()}
            className={cn(
              'min-h-[100px] p-2 border border-border cursor-pointer hover:bg-accent transition-colors',
              !isSameMonth(day, monthStart) && 'bg-muted text-muted-foreground',
              isSameDay(day, selectedDate || new Date()) && 'bg-primary/10 border-primary'
            )}
            onClick={() => handleDateClick(cloneDay)}
          >
          
          // Replace in the week view header
          <div className="p-2 border-b border-border font-medium text-center">
            <div className="text-sm text-muted-foreground">{format(day, 'EEE')}</div>
            <div className="text-lg">{format(day, 'd')}</div>
          </div>
          
          // Replace in the week view event details
          <div className="text-xs text-muted-foreground">
            {format(parseISO(event.start_date), 'HH:mm')} - {format(parseISO(event.end_date), 'HH:mm')}
          </div>
          <div className="text-xs text-muted-foreground">
            {event.employee.first_name} {event.employee.last_name}
          </div>
          
          // Replace in the day view header
          <div className="p-4 border-b border-border bg-muted">
            <div className="font-medium text-lg">{format(currentDate, 'EEEE, MMMM d, yyyy')}</div>
          </div>
          
          // Replace in the day view hour column
          <div className="w-20 p-2 text-sm text-muted-foreground border-r border-border">
            {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
          </div>
          
          // Replace in the list view event details
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
            {dayEvents.map((event) => (
              <Card key={event.id} className="p-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-2">
                  <div className={cn('w-3 h-3 rounded-full', eventTypeColors[event.event_type])} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-gray-500">
                      {format(parseISO(event.start_date), 'HH:mm')} - {format(parseISO(event.end_date), 'HH:mm')}
                    </div>
                    <div className="text-xs text-gray-600">
                      {event.employee.first_name} {event.employee.last_name}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = getEventsForDate(day);

      days.push(
        <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0">
          <div className="p-2 border-b border-gray-200 font-medium text-center">
            <div className="text-sm text-gray-500">{format(day, 'EEE')}</div>
            <div className="text-lg">{format(day, 'd')}</div>
          </div>
          <div className="p-2 space-y-2 min-h-[400px]">
            {dayEvents.map((event) => (
              <Card key={event.id} className="p-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-2">
                  <div className={cn('w-3 h-3 rounded-full', eventTypeColors[event.event_type])} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-gray-500">
                      {format(parseISO(event.start_date), 'HH:mm')} - {format(parseISO(event.end_date), 'HH:mm')}
                    </div>
                    <div className="text-xs text-gray-600">
                      {event.employee.first_name} {event.employee.last_name}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return <div className="flex border border-gray-200 rounded-lg overflow-hidden">{days}</div>;
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="font-medium text-lg">{format(currentDate, 'EEEE, MMMM d, yyyy')}</div>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(event => {
              const eventHour = parseISO(event.start_date).getHours();
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 p-2 text-sm text-gray-500 border-r border-gray-200">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {hourEvents.map((event) => (
                    <Card key={event.id} className="p-2 mb-2 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2">
                        <div className={cn('w-3 h-3 rounded-full', eventTypeColors[event.event_type])} />
                        <div className="flex-1">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-600">
                            {event.employee.first_name} {event.employee.last_name}
                          </div>
                          {event.description && (
                            <div className="text-sm text-gray-500 mt-1">{event.description}</div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const allEvents = calendarEvents.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    return (
      <div className="space-y-4">
        {allEvents.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={cn('w-4 h-4 rounded-full mt-1', eventTypeColors[event.event_type])} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium">{event.title}</h3>
                    <Badge className="border">{eventTypeLabels[event.event_type]}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(parseISO(event.start_date), 'MMM d, yyyy HH:mm')} - 
                        {format(parseISO(event.end_date), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{event.employee.first_name} {event.employee.last_name}</span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="flex items-center space-x-2">
            <Button aria-label="Previous month" variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button aria-label="Next month" variant="outline" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.location.href = '/api/outlook/auth'}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Integrate Outlook
          </Button>
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Add a new calendar event. Click save when you&#39;re done.
                </DialogDescription>
              </DialogHeader>
              {/* Event form would go here */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex items-center space-x-2">
        {(['month', 'week', 'day', 'list'] as const).map((view) => (
          <Button
            key={view}
            variant={viewOptions.view === view ? 'default' : 'outline'}
            size="sm"
            onClick={() => {/* Handle view change */}}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </Button>
        ))}
      </div>

      {/* Calendar Grid Header */}
      {viewOptions.view === 'month' && (
        <div className="grid grid-cols-7 border border-gray-200 rounded-t-lg">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center font-medium bg-gray-50 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Calendar Content */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {viewOptions.view === 'month' && renderMonthView()}
        {viewOptions.view === 'week' && renderWeekView()}
        {viewOptions.view === 'day' && renderDayView()}
        {viewOptions.view === 'list' && renderListView()}
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 text-sm">
        <span className="font-medium">Event Types:</span>
        {Object.entries(eventTypeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center space-x-2">
            <div className={cn('w-3 h-3 rounded-full', eventTypeColors[type as keyof typeof eventTypeColors])} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}