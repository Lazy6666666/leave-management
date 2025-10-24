'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportExportDialogProps {
  reportType: 'leave-stats' | 'leave-by-type' | 'leave-by-department' | 'monthly-trends' | 'comprehensive';
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    departmentId?: string;
    leaveTypeId?: string;
    employeeId?: string;
  };
}

export function ReportExportDialog({ reportType, filters = {} }: ReportExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: exportFormat,
          reportType,
          ...filters
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `report.${exportFormat}`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export successful', {
        description: `Report exported as ${exportFormat.toUpperCase()}`,
      });

      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', {
        description: 'Failed to export report. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
        return <FileImage className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeLabel = () => {
    switch (reportType) {
      case 'leave-stats':
        return 'Leave Statistics';
      case 'leave-by-type':
        return 'Leave by Type';
      case 'leave-by-department':
        return 'Leave by Department';
      case 'monthly-trends':
        return 'Monthly Trends';
      case 'comprehensive':
        return 'Comprehensive Report';
      default:
        return 'Report';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Export \"{getReportTypeLabel()}\" report in your preferred format
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="format" className="text-sm font-medium">
              Export Format
            </label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel' | 'pdf') => setExportFormat(value)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    CSV (Comma Separated Values)
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel (.xlsx)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <FileImage className="h-4 w-4 mr-2" />
                    PDF Document
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {exportFormat === 'csv' && 'Best for data analysis and spreadsheet applications'}
            {exportFormat === 'excel' && 'Formatted spreadsheet with multiple sheets and styling'}
            {exportFormat === 'pdf' && 'Professional document format for sharing and printing'}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                {getFormatIcon(exportFormat)}
                Export as {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}