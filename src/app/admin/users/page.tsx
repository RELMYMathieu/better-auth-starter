import type { Metadata } from "next";
import { UsersTable } from "@/components/admin/users-table";

export const metadata: Metadata = {
  title: "Users | Admin Dashboard",
  description: "Manage users in the admin dashboard",
};

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Users</h1>
      </div> */}
      <UsersTable />
    </div>
  );
}
