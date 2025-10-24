'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, parseISO, isAfter, isBefore, startOfYear, endOfYear } from 'date-fns';

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'public' | 'religious' | 'company' | 'optional';
  description?: string;
  isRecurring: boolean;
  applicableRegions: string[];
  createdAt: string;
  updatedAt: string;
}

interface HolidayFormData {
  name: string;
  date: string;
  type: Holiday['type'];
  description: string;
  isRecurring: boolean;
  applicableRegions: string[];
}

function HolidayForm({ 
  holiday, 
  onSave, 
  onCancel 
}: { 
  holiday?: Holiday;
  onSave: (data: HolidayFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<HolidayFormData>({
    name: holiday?.name || '',
    date: holiday?.date || format(new Date(), 'yyyy-MM-dd'),
    type: holiday?.type || 'public',
    description: holiday?.description || '',
    isRecurring: holiday?.isRecurring || false,
    applicableRegions: holiday?.applicableRegions || ['all'],
  });

  const [newRegion, setNewRegion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addRegion = () => {
    if (newRegion.trim() && !formData.applicableRegions.includes(newRegion.trim())) {
      setFormData(prev => ({
        ...prev,
        applicableRegions: [...prev.applicableRegions, newRegion.trim()]
      }));
      setNewRegion('');
    }
  };

  const removeRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      applicableRegions: prev.applicableRegions.filter(r => r !== region)
    }));
  };

  const getTypeColor = (type: Holiday['type']) => {
    switch (type) {
      case 'public':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'religious':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'company':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'optional':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Holiday Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter holiday name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Holiday Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: Holiday['type']) => 
              setFormData(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select holiday type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public Holiday</SelectItem>
              <SelectItem value="religious">Religious Holiday</SelectItem>
              <SelectItem value="company">Company Holiday</SelectItem>
              <SelectItem value="optional">Optional Holiday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter holiday description"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRecurring"
            checked={formData.isRecurring}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, isRecurring: checked as boolean }))
            }
          />
          <Label htmlFor="isRecurring" className="font-normal">
            This holiday recurs annually
          </Label>
        </div>

        <div>
          <Label>Applicable Regions</Label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Add region (e.g., US, UK, Global)"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRegion()}
              />
              <Button type="button" onClick={addRegion} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.applicableRegions.map((region) => (
                <Badge key={region} variant="secondary" className="flex items-center space-x-1">
                  <span>{region}</span>
                  <button
                    type="button"
                    onClick={() => removeRegion(region)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {holiday ? 'Update Holiday' : 'Create Holiday'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function HolidayManagement() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<Holiday['type'] | 'all'>('all');
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  useEffect(() => {
    loadHolidays();
  }, [yearFilter]);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockHolidays: Holiday[] = [
        {
          id: '1',
          name: 'New Year\'s Day',
          date: `${yearFilter}-01-01`,
          type: 'public',
          description: 'First day of the year',
          isRecurring: true,
          applicableRegions: ['all'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'Christmas Day',
          date: `${yearFilter}-12-25`,
          type: 'public',
          description: 'Christmas celebration',
          isRecurring: true,
          applicableRegions: ['all'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '3',
          name: 'Company Anniversary',
          date: `${yearFilter}-06-15`,
          type: 'company',
          description: 'Company founding anniversary',
          isRecurring: true,
          applicableRegions: ['all'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];
      setHolidays(mockHolidays);
    } catch (error) {
      console.error('Error loading holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHoliday = async (data: HolidayFormData) => {
    try {
      // Mock creation - replace with actual API call
      const newHoliday: Holiday = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setHolidays(prev => [...prev, newHoliday]);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating holiday:', error);
    }
  };

  const handleUpdateHoliday = async (data: HolidayFormData) => {
    if (!editingHoliday) return;
    
    try {
      // Mock update - replace with actual API call
      const updatedHoliday: Holiday = {
        ...editingHoliday,
        ...data,
        updatedAt: new Date().toISOString()
      };
      setHolidays(prev => 
        prev.map(h => h.id === editingHoliday.id ? updatedHoliday : h)
      );
      setEditingHoliday(null);
    } catch (error) {
      console.error('Error updating holiday:', error);
    }
  };

  const handleDeleteHoliday = async (holiday: Holiday) => {
    if (confirm(`Are you sure you want to delete "${holiday.name}"?`)) {
      try {
        // Mock delete - replace with actual API call
        setHolidays(prev => prev.filter(h => h.id !== holiday.id));
      } catch (error) {
        console.error('Error deleting holiday:', error);
      }
    }
  };

  const handleImportHolidays = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Mock import - replace with actual import logic
      console.log('Importing holidays from:', file.name);
      await loadHolidays();
    } catch (error) {
      console.error('Error importing holidays:', error);
    }
  };

  const handleExportHolidays = () => {
    const csvContent = [
      ['Name', 'Date', 'Type', 'Description', 'Recurring', 'Regions'].join(','),
      ...holidays.map(h => [
        h.name,
        h.date,
        h.type,
        h.description || '',
        h.isRecurring ? 'Yes' : 'No',
        h.applicableRegions.join(';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holidays-${yearFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         holiday.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || holiday.type === typeFilter;
    const holidayDate = parseISO(holiday.date);
    const matchesYear = holidayDate.getFullYear() === yearFilter;
    
    return matchesSearch && matchesType && matchesYear;
  });

  const getTypeColor = (type: Holiday['type']) => {
    switch (type) {
      case 'public':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'religious':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'company':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'optional':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUpcomingHolidays = () => {
    const today = new Date();
    return filteredHolidays
      .filter(holiday => isAfter(parseISO(holiday.date), today))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 5);
  };

  const upcomingHolidays = getUpcomingHolidays();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holiday Management</CardTitle>
          <CardDescription>Loading holidays...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Holiday Management</h2>
          <p className="text-gray-600">
            Manage company holidays and leave calendar
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportHolidays}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <label>
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleImportHolidays}
                className="hidden"
              />
            </label>
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Holiday
          </Button>
        </div>
      </div>

      {/* Upcoming Holidays Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Holidays</CardTitle>
          <CardDescription>Next 5 holidays in the calendar</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingHolidays.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming holidays</p>
          ) : (
            <div className="space-y-3">
              {upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{holiday.name}</p>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(holiday.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge className={getTypeColor(holiday.type)}>
                    {holiday.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="year-filter">Year:</Label>
              <Select value={yearFilter.toString()} onValueChange={(value) => setYearFilter(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026, 2027].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="type-filter">Type:</Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as Holiday['type'] | 'all')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search holidays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Holidays Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Holidays ({filteredHolidays.length})</CardTitle>
          <CardDescription>Complete list of holidays for {yearFilter}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Recurring</TableHead>
                  <TableHead>Regions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell>{format(parseISO(holiday.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(holiday.type)}>
                        {holiday.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {holiday.description || '-'}
                    </TableCell>
                    <TableCell>
                      {holiday.isRecurring ? (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <Check className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600 border-gray-200">
                          <X className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {holiday.applicableRegions.slice(0, 2).map((region) => (
                          <Badge key={region} variant="secondary" size="sm">
                            {region}
                          </Badge>
                        ))}
                        {holiday.applicableRegions.length > 2 && (
                          <Badge variant="secondary" size="sm">
                            +{holiday.applicableRegions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingHoliday(holiday)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteHoliday(holiday)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredHolidays.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No holidays found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || typeFilter !== 'all'
                  ? "Try adjusting your search or filter criteria."
                  : "No holidays configured for this year."
              }
              </p>
              {!searchTerm && typeFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holiday
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Holiday Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Holiday</DialogTitle>
            <DialogDescription>
              Add a new holiday to the company calendar
            </DialogDescription>
          </DialogHeader>
          <HolidayForm
            onSave={handleCreateHoliday}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Holiday Dialog */}
      // REFACTOR: Explicitly type 'open' parameter to satisfy TS7006 (implicit any)
      <Dialog open={!!editingHoliday} onOpenChange={(open: boolean) => !open && setEditingHoliday(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Holiday</DialogTitle>
            <DialogDescription>
              Update holiday details
            </DialogDescription>
          </DialogHeader>
          {editingHoliday && (
            <HolidayForm
              holiday={editingHoliday}
              onSave={handleUpdateHoliday}
              onCancel={() => setEditingHoliday(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}