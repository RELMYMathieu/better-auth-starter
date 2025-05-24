"use client";

import { useState } from "react";
import { Ban, MoreHorizontal, Trash2, UserCog } from "lucide-react";
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
import { UserBanDialog } from "./user-ban-dialog";
import { UserUnbanDialog } from "./user-unban-dialog";
import { UserDeleteDialog } from "./user-delete-dialog";

interface UserActionsProps {
  user: UserWithDetails;
  onEdit?: (user: UserWithDetails) => void;
  onActionComplete?: () => void;
}

export function UserActions({
  user,
  onEdit,
  onActionComplete,
}: UserActionsProps) {
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handlers for dialog actions
  const handleDialogClose = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setter(false);
    if (onActionComplete) {
      onActionComplete();
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
          <DropdownMenuItem
            className="text-xs"
            onClick={() => {
              setDropdownOpen(false);
              if (onEdit) onEdit(user);
            }}
          >
            <UserCog className="mr-2 h-4 w-4" />
            <span>Edit User</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.banned ? (
            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                setDropdownOpen(false);
                setShowUnbanDialog(true);
              }}
            >
              <Ban className="mr-2 h-4 w-4" />
              <span>Unban User</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                setDropdownOpen(false);
                setShowBanDialog(true);
              }}
            >
              <Ban className="mr-2 h-4 w-4" />
              <span>Ban User</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-xs text-destructive focus:text-destructive"
            onClick={() => {
              setDropdownOpen(false);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete User</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <UserBanDialog
        user={user}
        isOpen={showBanDialog}
        onClose={() => handleDialogClose(setShowBanDialog)}
      />

      <UserUnbanDialog
        user={user}
        isOpen={showUnbanDialog}
        onClose={() => handleDialogClose(setShowUnbanDialog)}
      />

      <UserDeleteDialog
        user={user}
        isOpen={showDeleteDialog}
        onClose={() => handleDialogClose(setShowDeleteDialog)}
      />
    </>
  );
}
