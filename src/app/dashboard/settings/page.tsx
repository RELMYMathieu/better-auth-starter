// src/app/dashboard/settings/page.tsx
import { SessionsManager } from "@/components/user/sessions-manager";
import Navbar from "@/components/landing/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and active sessions
          </p>
        </div>

        <div className="space-y-6">
          {/* Active Sessions Section */}
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage where you&#39;re logged in. You can sign out of any session you don&#39;t recognize.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionsManager />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
