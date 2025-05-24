import type { Metadata } from "next";
import { UsersTable } from "@/components/admin/users-table";
import { getUsers } from "@/utils/users";

export const metadata: Metadata = {
  title: "Users | Admin Dashboard",
  description: "Manage users in the admin dashboard",
};

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium tracking-tight">Users</h1>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
