'use client';



import { useState, useEffect } from 'react';

const getActionBadgeStyle = (action: string) => {
  switch (action.toLowerCase()) {
    case 'create':
      return 'bg-success/20 text-success border-success/20';
    case 'update':
      return 'bg-primary/20 text-primary border-primary/20';
    case 'delete':
      return 'bg-destructive/20 text-destructive border-destructive/20';
    case 'login':
      return 'bg-secondary/20 text-secondary border-secondary/20';
    case 'logout':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-warning/20 text-warning border-warning/20';
  };
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { format } from 'date-fns';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { AuditLog } from '@/types';

import { Input } from '@/components/ui/input';

import { Search, Filter } from 'lucide-react';

import { Badge } from '@/components/ui/badge';



export function AuditLogViewer() {

  const supabase = createClientComponentClient();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [actionFilter, setActionFilter] = useState('all');

  const [tableFilter, setTableFilter] = useState('all');



  useEffect(() => {

    fetchAuditLogs();

  }, []);



  const fetchAuditLogs = async () => {

    try {

      setLoading(true);

      const { data, error } = await supabase

        .from('audit_logs')

        .select('*, user:user_id(first_name, last_name, email)')

        .order('created_at', { ascending: false });



      if (error) {

        console.error('Error fetching audit logs:', error);

        return;

      }

      setAuditLogs(data || []);

    } catch (error) {

      console.error('Error fetching audit logs:', error);

    } finally {

      setLoading(false);

    }

  };



  const filteredLogs = auditLogs.filter(log => {

    const matchesSearch =

      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||

      log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||

      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||

      log.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||

      log.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());



    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    const matchesTable = tableFilter === 'all' || log.table_name === tableFilter;



    return matchesSearch && matchesAction && matchesTable;

  });



  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

  const uniqueTables = [...new Set(auditLogs.map(log => log.table_name))];



  if (loading) {

    return (

      <Card>

        <CardHeader>

          <CardTitle>Audit Logs</CardTitle>

          <CardDescription>Loading audit logs...</CardDescription>

        </CardHeader>

        <CardContent>

          <div className="animate-pulse space-y-4">

            {[1, 2, 3, 4, 5].map(i => (

              <div key={i} className="h-10 bg-gray-200 rounded"></div>

            ))}

          </div>

        </CardContent>

      </Card>

    );

  }



  return (

    <Card>

      <CardHeader>

        <CardTitle>Audit Logs</CardTitle>

        <CardDescription>Review system activities and changes.</CardDescription>

      </CardHeader>

      <CardContent>

        <div className="flex flex-wrap items-center gap-4 mb-4">

          <div className="relative flex-1 min-w-64">

            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

            <Input

              placeholder="Search logs..."

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              className="pl-10"

            />

          </div>

          <div className="flex items-center space-x-2">

            <Filter className="h-4 w-4 text-gray-400" />

            <select

              value={actionFilter}

              onChange={(e) => setActionFilter(e.target.value)}

              className="p-2 border rounded-md"

            >

              <option value="all">All Actions</option>

              {uniqueActions.map(action => (

                <option key={action} value={action}>{action}</option>

              ))}

            </select>

            <select

              value={tableFilter}

              onChange={(e) => setTableFilter(e.target.value)}

              className="p-2 border rounded-md"

            >

              <option value="all">All Tables</option>

              {uniqueTables.map(table => (

                <option key={table} value={table}>{table}</option>

              ))}

            </select>

          </div>

        </div>



        <div className="overflow-x-auto">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Timestamp</TableHead>

                <TableHead>User</TableHead>

                <TableHead>Action</TableHead>

                <TableHead>Table</TableHead>

                <TableHead>Record ID</TableHead>

                <TableHead>Changes</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {filteredLogs.length === 0 && (
                <TableRow>

                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">

                    No audit logs found.

                  </TableCell>

                </TableRow>

              )}

              {filteredLogs.length > 0 && filteredLogs.map((log) => (
                  <TableRow key={log.id}>

                    <TableCell className="whitespace-nowrap">{format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>

                    <TableCell className="whitespace-nowrap">{log.user ? `${log.user.first_name} ${log.user.last_name} (${log.user.email})` : 'System'}</TableCell>

                    <TableCell><Badge className={getActionBadgeStyle(log.action)}>{log.action}</Badge></TableCell>

                    <TableCell>{log.table_name}</TableCell>

                    <TableCell className="font-mono text-xs">{log.record_id || '-'}</TableCell>

                    <TableCell>

                      {log.old_values && log.new_values ? (

                        <details>

                          <summary className="cursor-pointer text-blue-600 hover:underline">View Changes</summary>

                          <pre className="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-x-auto">

                            Old: {JSON.stringify(log.old_values, null, 2)}

                            New: {JSON.stringify(log.new_values, null, 2)}

                          </pre>

                        </details>

                      ) : log.new_values ? (

                        <details>

                          <summary className="cursor-pointer text-blue-600 hover:underline">View Details</summary>

                          <pre className="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-x-auto">

                            {JSON.stringify(log.new_values, null, 2)}

                          </pre>

                        </details>

                      ) : '-'}

                    </TableCell>

                  </TableRow>

                ))}

            </TableBody>

          </Table>

        </div>

      </CardContent>

    </Card>

  );

}