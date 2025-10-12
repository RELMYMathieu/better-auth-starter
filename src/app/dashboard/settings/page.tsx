"use client";

import { useState } from "react";
import { SessionsManager } from "@/components/user/sessions-manager";
import { AccountSettings } from "@/components/user/account-settings";
import { PasswordChange } from "@/components/user/password-change";
import Navbar from "@/components/landing/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Settings as SettingsIcon } from "lucide-react";

type TabType = "sessions" | "account";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("sessions");

  const tabs = [
    {
      id: "sessions" as const,
      label: "Sessions",
      icon: Monitor,
      description: "Manage your active sessions",
    },
    {
      id: "account" as const,
      label: "Account Management",
      icon: SettingsIcon,
      description: "Manage your account settings",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and security preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b">
          <nav className="flex gap-6" aria-label="Settings tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "sessions" && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Active Sessions</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage where you&#39;re logged in. You can sign out of any session you don&#39;t recognize.
                  </p>
                </div>
                <SessionsManager />
              </CardContent>
            </Card>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Account Management</h2>
                <p className="text-sm text-muted-foreground">
                  Update your account information, change your password, or delete your account.
                </p>
              </div>
              
              <PasswordChange />
              <AccountSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
