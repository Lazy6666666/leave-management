'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { calendarEventFormSchema } from '@/lib/validations/calendar-documents-reporting';
import { type CalendarEventFormData } from '@/types/calendar-documents-reporting';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface CalendarEventFormProps {
  initialData?: Partial<CalendarEventFormData>;
  onSubmit: (data: CalendarEventFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CalendarEventForm({ initialData, onSubmit, onCancel, isLoading = false }: CalendarEventFormProps) {
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  const form = useForm<CalendarEventFormData>({
    resolver: zodResolver(calendarEventFormSchema as any),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      start_date: initialData?.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: initialData?.end_date || format(new Date(), 'yyyy-MM-dd'),
      event_type: initialData?.event_type || 'personal',
      is_all_day: initialData?.is_all_day || false,
      // color and employee_id are optional; use undefined by default to satisfy validation schemas
      color: initialData?.color ?? undefined,
      location: initialData?.location || '',
      employee_id: initialData?.employee_id ?? undefined,
    },
  });

  // Fetch employees for selection
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching employees:', error);
        return [];
      }

      return data;
    },
  });

  const handleSubmit = async (data: CalendarEventFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Error submitting calendar event:', error);
    }
  };

  const eventTypeOptions = [
    { value: 'leave', label: 'Leave', color: 'bg-red-500' },
    { value: 'holiday', label: 'Holiday', color: 'bg-blue-500' },
    { value: 'meeting', label: 'Meeting', color: 'bg-green-500' },
    { value: 'personal', label: 'Personal', color: 'bg-purple-500' },
  ];

  const colorOptions = [
    { value: '#ef4444', label: 'Red' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#84cc16', label: 'Lime' },
    { value: '#f97316', label: 'Orange' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-6">
        <FormField<CalendarEventFormData>
          control={form.control as any}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter event title"
                  value={(typeof field.value === 'string' ? field.value : '')}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<CalendarEventFormData>
          control={form.control as any}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter event description (optional)" 
                  value={(typeof field.value === 'string' ? field.value : '')}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField<CalendarEventFormData>
            control={form.control as any}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                          {typeof field.value === 'string' && field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={typeof field.value === 'string' ? new Date(field.value) : undefined}
                      onSelect={(date: Date | undefined) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      disabled={(date: Date) => date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField<CalendarEventFormData>
            control={form.control as any}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                          {typeof field.value === 'string' && field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={typeof field.value === 'string' ? new Date(field.value) : undefined}
                      onSelect={(date: Date | undefined) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      disabled={(date: Date) => date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField<CalendarEventFormData>
          control={form.control as any}
          name="event_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={(val) => field.onChange(val === 'default' ? undefined : val)} value={field.value as string | undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <div className={cn('w-3 h-3 rounded-full', option.color)} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<CalendarEventFormData>
          control={form.control as any}
          name="is_all_day"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  All Day Event
                </FormLabel>
                <FormDescription>
                  This event lasts all day
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField<CalendarEventFormData>
          control={form.control as any}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Color</FormLabel>
              <Select onValueChange={field.onChange} value={field.value as string | undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: option.value }}
                        />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<CalendarEventFormData>
          control={form.control as any}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Enter location (optional)" 
                    value={(typeof field.value === 'string' ? field.value : '')}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<CalendarEventFormData>
          control={form.control as any}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select onValueChange={(val) => field.onChange(val === 'self' ? undefined : val)} value={field.value as string | undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="self">Myself</SelectItem>
                  {employees.map((employee: { id: string; first_name: string; last_name: string; email: string }) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{employee.first_name} {employee.last_name}</span>
                        <span className="text-gray-500">({employee.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Event
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}