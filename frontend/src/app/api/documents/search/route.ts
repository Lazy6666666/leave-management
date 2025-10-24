import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const documentSearchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.enum(['active', 'expired', 'all']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'title', 'category', 'expiry_date']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      query: searchParams.get('query') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      tags: searchParams.getAll('tags'),
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      employeeId: searchParams.get('employeeId') || undefined,
      status: searchParams.get('status') || 'all',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    };

    // Validate parameters
    const validatedParams = documentSearchSchema.parse(params);

    // Build query
    let query = supabase
      .from('documents')
      .select(`
        *,
        document_categories!inner(name),
        employees!inner(first_name, last_name, email)
      `, { count: 'exact' });

    // Apply search filters
    if (validatedParams.query) {
      query = query.or(`title.ilike.%${validatedParams.query}%,description.ilike.%${validatedParams.query}%`);
    }

    if (validatedParams.categoryId) {
      query = query.eq('category_id', validatedParams.categoryId);
    }

    if (validatedParams.employeeId) {
      query = query.eq('employee_id', validatedParams.employeeId);
    }

    if (validatedParams.dateFrom) {
      query = query.gte('created_at', validatedParams.dateFrom);
    }

    if (validatedParams.dateTo) {
      query = query.lte('created_at', validatedParams.dateTo);
    }

    // Handle status filtering
    if (validatedParams.status === 'active') {
      query = query.or('expiry_date.is.null,expiry_date.gt.now()');
    } else if (validatedParams.status === 'expired') {
      query = query.lt('expiry_date', new Date().toISOString());
    }

    // Handle tags filtering
    if (validatedParams.tags && validatedParams.tags.length > 0) {
      query = query.contains('tags', validatedParams.tags);
    }

    // Apply sorting
    const sortColumn = validatedParams.sortBy === 'category' ? 'document_categories.name' : validatedParams.sortBy;
    query = query.order(sortColumn, { ascending: validatedParams.sortOrder === 'asc' });

    // Apply pagination
    const from = (validatedParams.page - 1) * validatedParams.limit;
    const to = from + validatedParams.limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching documents:', error);
      return NextResponse.json(
        { error: 'Failed to search documents' },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / validatedParams.limit);
    const hasNext = validatedParams.page < totalPages;
    const hasPrev = validatedParams.page > 1;

    return NextResponse.json({
      data: data || [],
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: count || 0,
        totalPages,
        hasNext,
        hasPrev
      }
    });

  } catch (error) {
    console.error('Error in document search:', error);
    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const body = await request.json();
    
    // Validate input
    const validatedData = documentSearchSchema.parse(body);

    // Build advanced search query with full-text search
    let query = supabase
      .from('documents')
      .select(`
        *,
        document_categories!inner(name),
        employees!inner(first_name, last_name, email)
      `, { count: 'exact' });

    // Apply full-text search if query provided
    if (validatedData.query) {
      // Use PostgreSQL full-text search
      query = query.textSearch('title,description', validatedData.query);
    }

    // Apply other filters
    if (validatedData.categoryId) {
      query = query.eq('category_id', validatedData.categoryId);
    }

    if (validatedData.employeeId) {
      query = query.eq('employee_id', validatedData.employeeId);
    }

    // Apply date range filtering
    if (validatedData.dateFrom || validatedData.dateTo) {
      if (validatedData.dateFrom) {
        query = query.gte('created_at', validatedData.dateFrom);
      }
      if (validatedData.dateTo) {
        query = query.lte('created_at', validatedData.dateTo);
      }
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error in advanced document search:', error);
      return NextResponse.json(
        { error: 'Failed to perform advanced search' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0
    });

  } catch (error) {
    console.error('Error in advanced document search:', error);
    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  }
}
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Tables: public.documents, public.document_shares
- GET/POST: SELECT policies (documents)
  • Users can view own uploaded documents
  • Users can view shared documents
  • Managers and HR can view team documents
*/