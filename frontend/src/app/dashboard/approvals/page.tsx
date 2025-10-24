'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock } from 'lucide-react'

export default function ApprovalsPage() {
  const [tab, setTab] = useState('pending')

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Approvals</h1>
        <p className="text-gray-600">Review and manage leave requests awaiting your approval</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Approved
            </TabsTrigger>
          </TabsList>
          <Button variant="outline">Refresh</Button>
        </div>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pending approval requests will appear here once backend integration is complete.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Recently Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Recently approved requests will appear here once backend integration is complete.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}