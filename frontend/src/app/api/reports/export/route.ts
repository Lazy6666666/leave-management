import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * RLS Policy References
 *
 * This export endpoint reads reporting data (no writes) to generate CSV/XLSX/PDF.
 * The current implementation queries the leave_requests view/table with joins
 * to employees, departments, and leave_types.
 *
 * Depending on the underlying data source, row visibility is governed by:
 *
 * - public.leaves (SELECT):
 *   - "leaves_requester_select" — Requesters can view their own leaves
 *   - "leaves_approver_select" — Approvers can view assigned leaves
 *   - "leaves_department_select" — Managers can view leaves in their department
 *   - "leaves_admin_select" — Admin/HR can view all leaves
 *
 * - public.employees (SELECT):
 *   - "employees_self_access" — Users can view their own profile
 *   - "employees_department_access" — Managers can view department employees
 *   - "employees_admin_access" — Admin/HR can view all employees
 *
 * - public.leave_types (SELECT):
 *   - "leave_types_read_all" — All authenticated users can read leave types
 *
 * Note: If leave_requests is a view over public.leaves, its RLS behavior
 * should align with the leaves SELECT policies listed above.
 *
 * See:
 * - docs/backend-functions-and-policies.md#004_refine_rls_leavessql
 * - docs/backend-functions-and-policies.md#006_rls_calendar_documents_reportingsql
 */

type ReportDataItem = {
  employees: {
    first_name: string;
    last_name: string;
    email: string;
    department_id: string;
    hire_date: string;
  };
  departments: {
    name: string;
  };
  leave_types: {
    name: string;
    description: string;
    max_days_per_year: number;
  };
  start_date: string;
  end_date: string;
  status: string;
  reason: string | null;
  created_at: string;
  updated_at: string;
};

type ReportStats = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  utilizationRate?: number;
};

// Unified row type for exports (CSV/Excel/PDF tables)
type ReportRow = Record<string, string | number>;

const exportSchema = z.object({
  format: z.enum(['csv', 'excel', 'pdf']),
  reportType: z.enum(['leave-stats', 'leave-by-type', 'leave-by-department', 'monthly-trends', 'comprehensive']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  departmentId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  employeeId: z.string().optional()
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Validate input
    const validatedData = exportSchema.parse(body);
    
    // Build base query based on report type
    let query;
    let filename;
    let data;
    
    switch (validatedData.reportType) {
      case 'leave-stats':
        query = supabase
          .from('leave_requests')
          .select(`
            *,
            employees!inner(first_name, last_name, email, department_id),
            departments!inner(name),
            leave_types!inner(name)
          `);
        filename = 'leave-statistics';
        break;
        
      case 'leave-by-type':
        query = supabase
          .from('leave_requests')
          .select(`
            *,
            leave_types!inner(name),
            employees!inner(first_name, last_name)
          `);
        filename = 'leave-by-type';
        break;
        
      case 'leave-by-department':
        query = supabase
          .from('leave_requests')
          .select(`
            *,
            employees!inner(first_name, last_name, department_id),
            departments!inner(name)
          `);
        filename = 'leave-by-department';
        break;
        
      case 'monthly-trends':
        query = supabase
          .from('leave_requests')
          .select(`
            *,
            leave_types!inner(name),
            employees!inner(first_name, last_name)
          `);
        filename = 'monthly-trends';
        break;
        
      case 'comprehensive':
        query = supabase
          .from('leave_requests')
          .select(`
            *,
            employees!inner(first_name, last_name, email, department_id, hire_date),
            departments!inner(name),
            leave_types!inner(name, description, max_days_per_year)
          `);
        filename = 'comprehensive-report';
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }
    
    // Apply filters
    if (validatedData.dateFrom) {
      query = query.gte('start_date', validatedData.dateFrom);
    }
    
    if (validatedData.dateTo) {
      query = query.lte('end_date', validatedData.dateTo);
    }
    
    if (validatedData.departmentId) {
      query = query.eq('employees.department_id', validatedData.departmentId);
    }
    
    if (validatedData.leaveTypeId) {
      query = query.eq('leave_type_id', validatedData.leaveTypeId);
    }
    
    if (validatedData.employeeId) {
      query = query.eq('employee_id', validatedData.employeeId);
    }
    
    // Execute query
    const { data: rawData, error } = await query;
    
    if (error) {
      console.error('Error fetching export data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch data for export' },
        { status: 500 }
      );
    }
    
    // Process data based on format
    let processedData: string | Blob;
    let contentType;
    let fileExtension;
    
    switch (validatedData.format) {
      case 'csv':
        processedData = convertToCSV(rawData, validatedData.reportType);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
        
      case 'excel':
        processedData = await convertToExcel(rawData, validatedData.reportType);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
        
      case 'pdf':
        processedData = await convertToPDF(rawData, validatedData.reportType);
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid export format' },
          { status: 400 }
        );
    }
    
    // Create response with proper headers
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}-${timestamp}.${fileExtension}`;
    
    return new NextResponse(processedData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${finalFilename}"`,
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Error in export:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

function convertToCSV(data: ReportDataItem[], reportType: string): string {
  if (!data || data.length === 0) {
    return '';
  }
  
  // Define headers based on report type
  let headers: string[];
  let rows: string[];
  
  switch (reportType) {
    case 'leave-stats':
      headers = ['Employee', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Status', 'Reason', 'Created Date'];
      rows = data.map(item => [
        `${item.employees.first_name} ${item.employees.last_name}`,
        item.departments.name,
        item.leave_types.name,
        item.start_date,
        item.end_date,
        item.status,
        item.reason || '',
        item.created_at
      ].map(field => `"${field}"`).join(','));
      break;
      
    case 'leave-by-type':
      headers = ['Leave Type', 'Total Requests', 'Approved', 'Pending', 'Rejected', 'Approval Rate'];
      const typeStats = aggregateByType(data);
      rows = Object.entries(typeStats).map(([type, stats]: [string, ReportStats]) => [
        type,
        stats.total,
        stats.approved,
        stats.pending,
        stats.rejected,
        `${((stats.approved / stats.total) * 100).toFixed(1)}%`
      ].map(field => `"${field}"`).join(','));
      break;
      
    case 'leave-by-department':
      headers = ['Department', 'Total Requests', 'Approved', 'Pending', 'Rejected', 'Utilization Rate'];
      const deptStats = aggregateByDepartment(data);
      rows = Object.entries(deptStats).map(([dept, stats]: [string, ReportStats]) => [
        dept,
        stats.total,
        stats.approved,
        stats.pending,
        stats.rejected,
        `${(stats.utilizationRate ?? 0).toFixed(1)}%`
      ].map(field => `"${field}"`).join(','));
      break;
      
    case 'monthly-trends':
      headers = ['Month', 'Total Requests', 'Approved', 'Pending', 'Rejected'];
      const monthlyStats = aggregateByMonth(data);
      rows = Object.entries(monthlyStats).map(([month, stats]: [string, ReportStats]) => [
        month,
        stats.total,
        stats.approved,
        stats.pending,
        stats.rejected
      ].map(field => `"${field}"`).join(','));
      break;
      
    default:
      // Comprehensive report
      headers = ['Employee', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Status', 'Days', 'Reason', 'Created Date', 'Processed Date'];
      rows = data.map(item => [
        `${item.employees.first_name} ${item.employees.last_name}`,
        item.departments.name,
        item.leave_types.name,
        item.start_date,
        item.end_date,
        item.status,
        calculateDays(item.start_date, item.end_date).toString(),
        item.reason || '',
        item.created_at,
        item.updated_at
      ].map(field => `"${field}"`).join(','));
  }
  
  return [headers.join(','), ...rows].join('\n');
}

async function convertToExcel(data: ReportDataItem[], reportType: string): Promise<Blob> {
  // For Excel export, we'll create a simple JSON structure
  // In a real implementation, you'd use a library like xlsx or exceljs
  
  const processedData = processDataForExport(data, reportType);
  
  // Create a simple Excel-compatible format (this is a simplified implementation)
  const excelData = {
    data: processedData,
    reportType,
    generatedAt: new Date().toISOString()
  };
  
  // Convert to bytes (placeholder for real Excel generation)
  const json = JSON.stringify(excelData, null, 2);
  return new Blob([json], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function convertToPDF(data: ReportDataItem[], reportType: string): Promise<Blob> {
  // For PDF export, you'd typically use a library like puppeteer, pdfkit, or jspdf
  // This is a simplified implementation
  
  const processedData = processDataForExport(data, reportType);
  
  // Create a simple HTML structure for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Leave Management Report - ${reportType}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Leave Management Report</h1>
        <p>Type: ${reportType}</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
      </div>
      <table>
        ${generateHTMLTable(processedData, reportType)}
      </table>
    </body>
    </html>
  `;
  
  // In a real implementation, you'd convert HTML to PDF using a proper library
  return new Blob([htmlContent], { type: 'application/pdf' });
}

function processDataForExport(data: ReportDataItem[], reportType: string): ReportRow[] {
  switch (reportType) {
    case 'leave-by-type':
      return Object.entries(aggregateByType(data)).map(([type, stats]: [string, ReportStats]) => ({
        'Leave Type': type,
        'Total Requests': stats.total,
        'Approved': stats.approved,
        'Pending': stats.pending,
        'Rejected': stats.rejected,
        'Approval Rate': `${((stats.approved / stats.total) * 100).toFixed(1)}%`
      }));
      
    case 'leave-by-department':
      return Object.entries(aggregateByDepartment(data)).map(([dept, stats]: [string, ReportStats]) => ({
        'Department': dept,
        'Total Requests': stats.total,
        'Approved': stats.approved,
        'Pending': stats.pending,
        'Rejected': stats.rejected,
        'Utilization Rate': `${(stats.utilizationRate ?? 0).toFixed(1)}%`
      }));
      
    case 'monthly-trends':
      return Object.entries(aggregateByMonth(data)).map(([month, stats]: [string, ReportStats]) => ({
        'Month': month,
        'Total Requests': stats.total,
        'Approved': stats.approved,
        'Pending': stats.pending,
        'Rejected': stats.rejected
      }));
      
    default:
      return data.map(item => ({
        'Employee': `${item.employees.first_name} ${item.employees.last_name}`,
        'Department': item.departments.name,
        'Leave Type': item.leave_types.name,
        'Start Date': item.start_date,
        'End Date': item.end_date,
        'Status': item.status,
        'Days': calculateDays(item.start_date, item.end_date),
        'Reason': item.reason || '',
        'Created Date': item.created_at,
        'Processed Date': item.updated_at
      }));
  }
}

function aggregateByType(data: ReportDataItem[]): Record<string, ReportStats> {
  const stats: Record<string, ReportStats> = {};
  
  data.forEach(item => {
    const type = item.leave_types.name;
    if (!stats[type]) {
      stats[type] = { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
    
    stats[type].total++;
    const status = item.status as 'approved' | 'pending' | 'rejected';
    if (status in stats[type]) {
      stats[type][status]++;
    }
  });
  
  return stats;
}

function aggregateByDepartment(data: ReportDataItem[]): Record<string, ReportStats> {
  const stats: Record<string, ReportStats> = {};
  
  data.forEach(item => {
    const dept = item.departments.name;
    if (!stats[dept]) {
      stats[dept] = { total: 0, approved: 0, pending: 0, rejected: 0, utilizationRate: 0 };
    }
    
    stats[dept].total++;
    const status = item.status as 'approved' | 'pending' | 'rejected';
    if (status in stats[dept]) {
      stats[dept][status]++;
    }
    
    // Calculate utilization rate (simplified)
    stats[dept].utilizationRate = (stats[dept].approved / stats[dept].total) * 100;
  });
  
  return stats;
}

function aggregateByMonth(data: ReportDataItem[]): Record<string, ReportStats> {
  const stats: Record<string, ReportStats> = {};
  
  data.forEach(item => {
    const month = new Date(item.start_date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!stats[month]) {
      stats[month] = { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
    
    stats[month].total++;
    const status = item.status as 'approved' | 'pending' | 'rejected';
    if (status in stats[month]) {
      stats[month][status]++;
    }
  });
  
  return stats;
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

function generateHTMLTable(data: ReportRow[], reportType: string): string {
  if (!data || data.length === 0) {
    return '<tr><td colspan="100%">No data available</td></tr>';
  }
  
  const headers = Object.keys(data[0]);
  
  const headerRow = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const dataRows = data.map(row => {
    return `<tr>${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`;
  }).join('');
  
  return headerRow + dataRows;
}