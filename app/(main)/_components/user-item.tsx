"use client";

import { ChevronsLeftRight } from "lucide-react";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export const UserItem = () => {
  const { user } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center text-sm p-3 w-full hover:bg-slate-400/5"
        >
          <div className="gap-x-2 flex items-center max-w-[150px]">
            <Avatar className="h-5 w-5">
              <AvatarImage src={user?.imageUrl} />
            </Avatar>
            <span className="text-start font-medium line-clamp-1">
              {user?.fullName}&apos;s Jotion
            </span>
          </div>
          <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-gray-500 rounded-xl border-white"
        align="start"
        alignOffset={11}
        forceMount
      >
        <div className="flex flex-col space-y-4 p-2 ">
          <div className="flex items-center gap-x-2">
            <div className="rounded-md p-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} />
              </Avatar>
            </div>
            <div className="space-y-1">
              <p className="text-sm line-clamp-1">
                {user?.fullName}&apos;s Jotion
              </p>
            </div>
          </div>
          <p className="text-xs font-medium leading-none text-muted-foreground">
            {user?.emailAddresses?.[0]?.emailAddress || ""}
          </p>
        </div>
        <DropdownMenuSeparator />
        {/* Settings section with label and theme toggle */}
        <div className="px-4 py-3 bg-gray-400/30 dark:bg-gray-700/30 rounded-lg flex flex-col items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 tracking-wide uppercase mb-1">
            Settings
          </span>
          <ModeToggle />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="w-full cursor-pointer text-muted-foreground">
          <SignOutButton>
            <Button variant="outline" className="w-full rounded-full ">
              Sign Out
            </Button>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Improve DevTools and satisfy lint rules
UserItem.displayName = "UserItem";
