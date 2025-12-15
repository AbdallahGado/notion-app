"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OnlineUsersProps {
  documentId: string;
}

export const OnlineUsers = React.memo(({ documentId }: OnlineUsersProps) => {
  const onlineUsers = useQuery(api.presence.getOnlineUsers, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documentId: documentId as any,
  });

  if (!onlineUsers || onlineUsers.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {onlineUsers.length} online
        </span>
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 3).map((user) => (
            <Tooltip key={user.userId}>
              <TooltipTrigger asChild>
                <Avatar className="w-6 h-6 border-2 border-white">
                  <AvatarImage
                    src={user.userAvatar || ""}
                    alt={user.userName}
                  />
                  <AvatarFallback className="text-xs">
                    {user.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.userName}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        {onlineUsers.length > 3 && (
          <span className="text-xs text-gray-500 ml-1">
            +{onlineUsers.length - 3} more
          </span>
        )}
      </div>
    </TooltipProvider>
  );
});

// Provide displayName for React devtools and to satisfy lint rule
OnlineUsers.displayName = "OnlineUsers";
