'use client';

import { useState } from 'react';
import { Save, User, Bell, Monitor, Shield, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    warningAlerts: true,
    systemUpdates: false,
    sound: true,
  });

  const [display, setDisplay] = useState({
    theme: 'dark',
    refreshRate: '5',
    showOfflineVehicles: true,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your dashboard preferences
          </p>
        </div>
        <Button>
          <Save className="mr-2 size-4" />
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Monitor className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="size-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Database className="size-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize how the dashboard displays information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={display.theme}
                    onValueChange={(v) => setDisplay({ ...display, theme: v })}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refresh">Data Refresh Rate</Label>
                  <Select
                    value={display.refreshRate}
                    onValueChange={(v) =>
                      setDisplay({ ...display, refreshRate: v })
                    }
                  >
                    <SelectTrigger id="refresh">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 second</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Offline Vehicles</Label>
                  <p className="text-sm text-muted-foreground">
                    Display vehicles that are currently offline
                  </p>
                </div>
                <Switch
                  checked={display.showOfflineVehicles}
                  onCheckedChange={(v) =>
                    setDisplay({ ...display, showOfflineVehicles: v })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Alert Notifications</CardTitle>
              <CardDescription>
                Configure how you receive alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Critical Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for critical alerts
                  </p>
                </div>
                <Switch
                  checked={notifications.criticalAlerts}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, criticalAlerts: v })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Warning Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for warning alerts
                  </p>
                </div>
                <Switch
                  checked={notifications.warningAlerts}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, warningAlerts: v })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for system updates
                  </p>
                </div>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, systemUpdates: v })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound for critical notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.sound}
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, sound: v })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage authentication and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <User className="size-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Operator Account</p>
                    <p className="text-sm text-muted-foreground">
                      operator@infineon.com
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
              <CardDescription>
                Configure connections to external systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">OPC-UA Server</p>
                    <p className="text-sm text-muted-foreground">
                      Connection to OHT controller
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-500">Connected</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Server URL</Label>
                    <Input defaultValue="opc.tcp://192.168.1.100:4840" />
                  </div>
                  <div className="space-y-2">
                    <Label>Namespace</Label>
                    <Input defaultValue="ns=2;s=OHT" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AXIS Camera System</p>
                    <p className="text-sm text-muted-foreground">
                      Video streaming and privacy shield
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-500">Connected</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>VMS URL</Label>
                    <Input defaultValue="https://axis-vms.local" />
                  </div>
                  <div className="space-y-2">
                    <Label>Privacy Shield</Label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
