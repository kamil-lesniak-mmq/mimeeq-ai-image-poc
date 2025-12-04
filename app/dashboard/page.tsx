"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardImagesTab from "@/components/dashboard/DashboardImagesTab";
import DashboardPromptsTab from "@/components/dashboard/DashboardPromptsTab";
import DashboardConfiguratorTab from "@/components/dashboard/DashboardConfiguratorTab";
import DashboardGenerateTab from "@/components/dashboard/DashboardGenerateTab";


export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(setUser);
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-slate-800 bg-slate-950/60">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Dashboard</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Collect images from the configurator, define prompts, run nanobanana generations
              and review the results.
            </CardDescription>
          </div>
          {user && (
            <div className="text-right text-xs text-slate-400">
              <div className="font-mono text-slate-200">{user.email}</div>
              <div>Workspace scoped to this email</div>
            </div>
          )}
        </CardHeader>
      </Card>

      <Card className="border-slate-800 bg-slate-950/60">
        <CardContent className="pt-4">
          <Tabs defaultValue="images" className="space-y-4">
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="images">Images Collection</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="configurator">Configurator</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="images">
              <DashboardImagesTab />
            </TabsContent>
            <TabsContent value="prompts">
              <DashboardPromptsTab />
            </TabsContent>
            <TabsContent value="configurator">
              <DashboardConfiguratorTab />
            </TabsContent>
            <TabsContent value="generate">
              <DashboardGenerateTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
