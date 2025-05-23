"use client";
import {
  CheckCircle,
  XCircle,
  Mail,
  MoreHorizontal,
  Ban,
  Check,
  UserCog,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserWithDetails } from "@/utils/users";
import { GithubIcon, GoogleIcon } from "../ui/icons";

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
  return (
    <div className="overflow-hidden">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Verification
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Linked Accounts
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Ban Status
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Last Sign In
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
              Created At
            </TableHead>
            <TableHead className="w-[80px] px-4 py-3 text-xs font-medium text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={user.avatarUrl || "/placeholder.svg"}
                      alt={user.name}
                    />
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
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1 px-2 py-1 text-xs"
                    >
                      <Ban className="h-3 w-3" />
                      Banned
                    </Badge>
                    {user.banReason && (
                      <span className="text-xs text-muted-foreground italic">
                        Reason: {user.banReason}
                      </span>
                    )}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-sm">
                    <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                      Actions
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="text-xs">
                      <UserCog className="mr-2 h-4 w-4" />
                      <span>Edit User</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />{" "}
                    {user.banned ? (
                      <DropdownMenuItem className="text-xs">
                        <Ban className="mr-2 h-4 w-4" />
                        <span>Unban User</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="text-xs">
                        <Ban className="mr-2 h-4 w-4" />
                        <span>Ban User</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete User</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
