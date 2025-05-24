"use client";
import { CheckCircle, XCircle, Mail, Ban, Check } from "lucide-react";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserWithDetails } from "@/utils/users";
import { GithubIcon, GoogleIcon } from "../ui/icons";
import { UserActions } from "./user-actions";

interface UsersTableProps {
  users: UserWithDetails[];
}

// Helper function to render account icons
const getAccountIcon = (account: string) => {
  switch (account) {
    case "credential":
      return <Mail className="h-4 w-4" />;
    case "github":
      return <GithubIcon className="h-4 w-4" />;
    case "google":
      return <GoogleIcon className="h-4 w-4" />;
    default:
      return null;
  }
};

export function UsersTable({ users }: UsersTableProps) {
  // Handler functions for user actions
  const handleEditUser = (user: UserWithDetails) => {
    console.log("Edit user:", user.id);
    // Add actual edit user implementation here
  };

  return (
    <div className="overflow-hidden">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            {[
              { label: "Name" },
              { label: "Verification" },
              { label: "Linked Accounts" },
              { label: "Status" },
              { label: "Last Sign In" },
              { label: "Created At" },
              { label: "Actions", className: "w-[80px]" },
            ].map((col) => (
              <TableHead
                key={col.label}
                className={[
                  col.className,
                  "px-4 py-3 text-xs font-medium text-muted-foreground",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                {user.verified ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2 py-1 text-xs"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 px-2 py-1 text-xs"
                  >
                    <XCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex -space-x-2">
                  {user.accounts.map((account) => (
                    <div
                      key={account}
                      className="rounded-full bg-muted p-1.5 text-muted-foreground"
                      title={account}
                    >
                      {getAccountIcon(account)}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                {user.banned ? (
                  <div className="flex flex-col gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="destructive"
                          className="flex items-center gap-1 px-2 py-1 text-xs cursor-help"
                        >
                          <Ban className="h-3 w-3" />
                          Banned
                        </Badge>
                      </TooltipTrigger>
                      {user.banReason && (
                        <TooltipContent>
                          Reason: {user.banReason}
                        </TooltipContent>
                      )}
                    </Tooltip>
                    {user.banExpires && (
                      <span className="text-xs text-muted-foreground">
                        Expires: {format(user.banExpires, "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2 py-1 text-xs"
                  >
                    <Check className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </TableCell>
              <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                {user.lastSignIn
                  ? format(user.lastSignIn, "MMM d, yyyy 'at' h:mm a")
                  : "Never"}
              </TableCell>
              <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                {format(user.createdAt, "MMM d, yyyy 'at' h:mm a")}
              </TableCell>
              <TableCell className="px-4 py-3">
                <UserActions user={user} onEdit={handleEditUser} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
