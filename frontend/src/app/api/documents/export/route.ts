import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type DocumentForExport = {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  expiry_date: string | null;
  tags: string[] | null;
  description: string | null;
  employees: {
    first_name: string;
    last_name: string;
    email: string;
    department_id: string;
  };
  departments: {
    name: string;
  };
  document_categories: {
    name: string;
    description: string;
  };
};

const exportSchema = z.object({
  format: z.enum(['csv', 'excel', 'pdf']),
  documentIds: z.array(z.string()).optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'expired', 'all']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Validate input
    const validatedData = exportSchema.parse(body);
    
    // Build query
    let query = supabase
      .from('documents')
      .select(`
        *,
        employees!inner(first_name, last_name, email, department_id),
        departments!inner(name),
        document_categories!inner(name, description)
      `);
    
    // Apply filters
    if (validatedData.documentIds && validatedData.documentIds.length > 0) {
      query = query.in('id', validatedData.documentIds);
    }
    
    if (validatedData.category) {
      query = query.eq('document_categories.name', validatedData.category);
    }
    
    if (validatedData.status && validatedData.status !== 'all') {
      if (validatedData.status === 'active') {
        query = query.gte('expiry_date', new Date().toISOString());
      } else if (validatedData.status === 'expired') {
        query = query.lt('expiry_date', new Date().toISOString());
      }
    }
    
    if (validatedData.dateFrom) {
      query = query.gte('uploaded_at', validatedData.dateFrom);
    }
    
    if (validatedData.dateTo) {
      query = query.lte('uploaded_at', validatedData.dateTo);
    }
    
    // Execute query
    const { data: documents, error } = await query;
    
    if (error) {
      console.error('Error fetching documents for export:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents for export' },
        { status: 500 }
      );
    }
    
    // Process data based on format
    let processedData: string | Blob;
    let contentType;
    let fileExtension;
    
    switch (validatedData.format) {
      case 'csv':
        processedData = convertToCSV(documents);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
        
      case 'excel':
        processedData = await convertToExcel(documents);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
        
      case 'pdf':
        processedData = await convertToPDF(documents);
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
    const filename = `documents-export-${timestamp}.${fileExtension}`;
    
    return new NextResponse(processedData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Error in document export:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

function convertToCSV(documents: DocumentForExport[]): string {
  if (!documents || documents.length === 0) {
    return '';
  }
  
  const headers = [
    'Document Name',
    'Employee',
    'Department',
    'Category',
    'File Type',
    'File Size',
    'Upload Date',
    'Expiry Date',
    'Status',
    'Tags',
    'Description'
  ];
  
  const rows = documents.map(doc => [
    doc.name,
    `${doc.employees.first_name} ${doc.employees.last_name}`,
    doc.departments.name,
    doc.document_categories.name,
    doc.file_type,
    formatFileSize(doc.file_size),
    new Date(doc.uploaded_at).toLocaleDateString(),
    doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'No expiry',
    getDocumentStatus(doc),
    doc.tags ? doc.tags.join(', ') : '',
    doc.description || ''
  ].map(field => `"${field}"`).join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

async function convertToExcel(documents: DocumentForExport[]): Promise<Blob> {
  // Process data for Excel format
  const processedData = documents.map(doc => ({
    'Document Name': doc.name,
    'Employee': `${doc.employees.first_name} ${doc.employees.last_name}`,
    'Department': doc.departments.name,
    'Category': doc.document_categories.name,
    'File Type': doc.file_type,
    'File Size': formatFileSize(doc.file_size),
    'Upload Date': new Date(doc.uploaded_at).toLocaleDateString(),
    'Expiry Date': doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'No expiry',
    'Status': getDocumentStatus(doc),
    'Tags': doc.tags ? doc.tags.join(', ') : '',
    'Description': doc.description || ''
  }));
  
  // Convert to JSON bytes (placeholder for real Excel generation)
  const json = JSON.stringify({
    documents: processedData,
    summary: {
      total: documents.length,
      active: documents.filter(d => getDocumentStatus(d) === 'Active').length,
      expired: documents.filter(d => getDocumentStatus(d) === 'Expired').length,
      expiringSoon: documents.filter(d => getDocumentStatus(d) === 'Expiring Soon').length
    },
    generatedAt: new Date().toISOString()
  }, null, 2);
  return new Blob([json], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function convertToPDF(documents: DocumentForExport[]): Promise<Blob> {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Document Export Report</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          font-size: 12px;
        }
        .header { 
          margin-bottom: 20px; 
          text-align: center;
        }
        .summary {
          display: flex;
          justify-content: space-around;
          margin: 20px 0;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-number {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin-top: 20px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold;
        }
        .status-active { color: #28a745; }
        .status-expired { color: #dc3545; }
        .status-expiring-soon { color: #ffc107; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Document Management Report</h1>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-number">${documents.length}</div>
          <div>Total Documents</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${documents.filter(d => getDocumentStatus(d) === 'Active').length}</div>
          <div>Active</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${documents.filter(d => getDocumentStatus(d) === 'Expired').length}</div>
          <div>Expired</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${documents.filter(d => getDocumentStatus(d) === 'Expiring Soon').length}</div>
          <div>Expiring Soon</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Document Name</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Category</th>
            <th>Upload Date</th>
            <th>Expiry Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${documents.map(doc => `
            <tr>
              <td>${doc.name}</td>
              <td>${doc.employees.first_name} ${doc.employees.last_name}</td>
              <td>${doc.departments.name}</td>
              <td>${doc.document_categories.name}</td>
              <td>${new Date(doc.uploaded_at).toLocaleDateString()}</td>
              <td>${doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'No expiry'}</td>
              <td class="status-${getDocumentStatus(doc).toLowerCase().replace(' ', '-')}">
                ${getDocumentStatus(doc)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  // In a real implementation, you'd convert HTML to PDF using a proper library
  return new Blob([htmlContent], { type: 'application/pdf' });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDocumentStatus(document: DocumentForExport): string {
  if (!document.expiry_date) {
    return 'Active';
  }
  
  const expiryDate = new Date(document.expiry_date);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return 'Expired';
  } else if (daysUntilExpiry <= 30) {
    return 'Expiring Soon';
  } else {
    return 'Active';
  }
}