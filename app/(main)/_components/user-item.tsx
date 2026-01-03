"use client";

import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";

export const UserItem = () => {
  const { user } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center text-sm p-2 w-full hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all duration-300 group active:scale-[0.98]"
        >
          <div className="gap-2 flex items-center max-w-[150px]">
            <Avatar className="h-6 w-6 border border-black/5 dark:border-white/10 ring-2 ring-indigo-500/10 group-hover:ring-indigo-500/20 transition-all">
              <AvatarImage src={user?.imageUrl} />
            </Avatar>
            <span className="text-start font-bold line-clamp-1 text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {user?.fullName}&apos;s Workspace
            </span>
          </div>
          <ChevronsUpDown className="ml-auto text-slate-400 h-4 w-4 group-hover:text-indigo-500 transition-colors" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 p-2 bg-white/70 dark:bg-[#0b0c14]/70 backdrop-blur-xl rounded-2xl border-black/5 dark:border-white/10 shadow-2xl relative overflow-hidden"
        align="start"
        alignOffset={0}
        forceMount
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex flex-col space-y-4 p-3 relative z-10">
          <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10 border-2 border-indigo-500/20">
               <AvatarImage src={user?.imageUrl} />
             </Avatar>
             <div className="space-y-0.5">
               <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                 {user?.fullName}
               </p>
               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate max-w-[160px]">
                 {user?.emailAddresses?.[0]?.emailAddress || "Guest"}
               </p>
             </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-black/5 dark:border-white/5" />
        
        <div className="grid grid-cols-1 gap-1 p-1">
           <div className="flex flex-col gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase flex items-center gap-2">
              <Settings className="w-3 h-3" />
              Quick Theme
            </span>
            <div className="flex justify-center">
              <ModeToggle />
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-black/5 dark:border-white/5" />

        <DropdownMenuItem asChild>
          <SignOutButton>
            <button className="w-full flex items-center gap-2 p-2 text-sm font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-xl transition-all group">
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

UserItem.displayName = "UserItem";
