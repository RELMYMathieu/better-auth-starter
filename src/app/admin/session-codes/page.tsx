"use client";

import { useState } from "react";
import useSWR from "swr";

const format = (date: Date | string) => {
  const d = new Date(date);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Plus } from "lucide-react";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

const EXPIRATION_OPTIONS = [
  { label: "1 Hour", value: 1 },
  { label: "6 Hours", value: 6 },
  { label: "24 Hours", value: 24 },
  { label: "7 Days", value: 168 },
  { label: "30 Days", value: 720 },
];

interface SessionCode {
  id: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt: string | null;
  createdByUser?: {
    name: string;
  };
}

export default function SessionCodesPage() {
  const [expiresInHours, setExpiresInHours] = useState("24");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: codes, error, mutate } = useSWR<SessionCode[]>("/api/admin/session-codes", fetcher, {
    refreshInterval: 5000,
  });

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/admin/session-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInHours: parseInt(expiresInHours) }),
      });

      if (!response.ok) throw new Error("Failed to generate code");

      const newCode = await response.json();
      toast.success(`Code generated: ${newCode.code}`);
      mutate();
    } catch {
      toast.error("Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  const getStatus = (code: SessionCode) => {
    if (code.used) return "used";
    if (new Date() > new Date(code.expiresAt)) return "expired";
    return "active";
  };

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Failed to load session codes</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Guest Session Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Expiration Time
              </label>
              <Select value={expiresInHours} onValueChange={setExpiresInHours}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateCode} disabled={isGenerating}>
              <Plus className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Code"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Code</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-left font-medium">Expires</th>
                  <th className="px-4 py-3 text-left font-medium">Used At</th>
                  <th className="px-4 py-3 text-left font-medium">Created By</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!codes ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : codes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No session codes yet
                    </td>
                  </tr>
                ) : (
                  codes.map((code) => {
                    const status = getStatus(code);
                    return (
                      <tr key={code.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono">{code.code}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              status === "active"
                                ? "default"
                                : status === "used"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {format(code.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {format(code.expiresAt)}
                        </td>
                        <td className="px-4 py-3">
                          {code.usedAt ? format(code.usedAt) : "-"}
                        </td>
                        <td className="px-4 py-3">{code.createdByUser?.name || "-"}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(code.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
