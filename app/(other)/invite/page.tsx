'use client';
import React from 'react';
import ReedemInvite from './redeem-invite';
import MigrateAccount from './migrate-account';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Invite() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center p-4 md:p-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-lg">Account Access</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="old" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-accent/10 text-foreground">
              <TabsTrigger
                value="old"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                Old User
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                New User
              </TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="mt-2">
              <ReedemInvite />
            </TabsContent>
            <TabsContent value="old" className="mt-2">
              <MigrateAccount />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
