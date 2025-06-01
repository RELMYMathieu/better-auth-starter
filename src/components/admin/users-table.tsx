"use client";
import { CheckCircle, XCircle, Mail, Ban, Check } from "lucide-react";
import { format } from "date-fns";
import useSWR from "swr";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
import { Skeleton } from "@/components/ui/skeleton";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserWithDetails } from "@/utils/users";
import { GithubIcon, GoogleIcon } from "../ui/icons";
import { UserActions } from "./user-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { UserAddDialog } from "./user-add-dialog";

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper function to render account icons
const getAccountIcon = (account: string) => {
  switch (account) {
    case "credential":
      return <Mail className="h-4 w-4" />;
    case "github":
      return <GithubIcon className="h-4 w-4 text-muted-foreground" />;
    case "google":
      return <GoogleIcon className="h-4 w-4" />;
    default:
      return null;
  }
};

export function UsersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filters and sort state, initialized from URL
  const [role, setRole] = useState(searchParams.get("role") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const limit = 10;

  // Update URL when filters/sort/page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (role && role !== "all") params.set("role", role);
    if (status && status !== "all") params.set("status", status);
    if (page) params.set("page", String(page));
    params.set("limit", String(limit));
    router.replace(`?${params.toString()}`);
  }, [role, status, page, router]);

  // Build SWR key with all params
  const swrKey = useMemo(() => {
    const params = new URLSearchParams();
    if (role && role !== "all") params.set("role", role);
    if (status && status !== "all") params.set("status", status);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return `/api/admin/users?${params.toString()}`;
  }, [role, status, page, limit]);

  const { data, error, mutate, isLoading } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  });

  // Handler functions for user actions
  const handleEditUser = (user: UserWithDetails) => {
    console.log("Edit user:", user.id);
    // Add actual edit user implementation here
  };

  const handleActionComplete = () => {
    mutate();
  };

  // Filter and sort controls
  const filterControls = (
    <div className="flex flex-wrap gap-2 items-end mb-2 w-full justify-between">
      <div className="flex gap-2">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Role
          </label>
          <Select
            value={role}
            onValueChange={(v) => {
              setRole(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Status
          </label>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <button
        className="ml-auto bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium shadow-xs hover:bg-primary/90 transition-colors"
        onClick={() => setIsAddDialogOpen(true)}
      >
        Add a user
      </button>
    </div>
  );

  if (error) return <div>Failed to load users</div>;
  if (!data)
    return (
      <div className="space-y-4 border-accent-foreground">
        {filterControls}
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
              {Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-3 w-[160px]" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex -space-x-2">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-8 rounded-full" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-6 w-[60px]" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-[140px]" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-[140px]" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );

  const { users, total, totalPages } = data;

  // Pagination logic for shadcn/ui Pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);
    if (endPage - startPage < maxPagesToShow - 1) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : 0}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}
          {pageNumbers.map((pNum) => (
            <PaginationItem key={pNum}>
              <PaginationLink
                isActive={pNum === page}
                onClick={() => setPage(pNum)}
              >
                {pNum}
              </PaginationLink>
            </PaginationItem>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => setPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-disabled={page === totalPages}
              tabIndex={page === totalPages ? -1 : 0}
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-4">
      {filterControls}
      <div className="overflow-hidden rounded-lg border-muted border-2 ">
        <Table className="text-sm ">
          <TableHeader className="bg-muted sticky top-0 z-10">
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
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-3 w-[160px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-6 w-[80px]" />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-8 w-8 rounded-full" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-6 w-[60px]" />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              : users.map((user: UserWithDetails) => (
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
                            {user.email.replace(/^[^@]+/, (match) =>
                              "*".repeat(match.length),
                            )}
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
                      <UserActions
                        user={user}
                        onEdit={handleEditUser}
                        onActionComplete={handleActionComplete}
                      />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4 py-1">
        <div className="text-sm text-muted-foreground">
          Showing {users.length} of {total} users
        </div>
        {renderPagination()}
      </div>
      <UserAddDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
