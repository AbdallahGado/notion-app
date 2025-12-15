/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface User {
  userId: string;
  userName: string;
  userAvatar?: string;
  isActive: boolean;
  color: string;
}

interface CollaborativePresenceProps {
  documentId?: string;
  maxVisibleUsers?: number;
}

const CollaborativePresence: React.FC<CollaborativePresenceProps> = memo(
  ({ documentId, maxVisibleUsers = 5 }) => {
    const onlineUsers = useQuery(api.presence.getOnlineUsers, {
      documentId: documentId as any,
    }) as User[] | undefined;

    const activeUsers = onlineUsers?.filter((user: User) => user.isActive) || [];
    const visibleUsers = activeUsers.slice(0, maxVisibleUsers);
    const overflowCount = activeUsers.length - maxVisibleUsers;

    if (activeUsers.length === 0) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-white/20 dark:bg-zinc-800/50 backdrop-blur-xl rounded-full border border-white/30 dark:border-zinc-600/40">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            No collaborators
          </span>
        </div>
      );
    }

    return (
      <TooltipProvider>
        <div className="flex items-center gap-2 px-3 py-2 bg-white/20 dark:bg-zinc-800/50 backdrop-blur-xl rounded-full border border-white/30 dark:border-zinc-600/40">
          <div className="flex -space-x-2">
            <AnimatePresence>
              {visibleUsers.map((user, index) => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, scale: 0.8, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -10 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="relative"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar
                        className={`w-8 h-8 border-2 border-white dark:border-zinc-900 shadow-sm hover:scale-110 transition-transform duration-200 ${user.color}`}
                      >
                        <AvatarImage
                          src={user.userAvatar}
                          alt={user.userName}
                        />
                        <AvatarFallback className="text-xs font-medium text-white">
                          {user.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.userName}</p>
                    </TooltipContent>
                  </Tooltip>
                  {/* Active indicator */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-full h-full bg-green-500 rounded-full"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {overflowCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: visibleUsers.length * 0.1 }}
                className="relative"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-8 h-8 bg-gray-500 border-2 border-white dark:border-zinc-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
                      <span className="text-xs font-medium text-white">
                        +{overflowCount}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {overflowCount} more collaborator
                      {overflowCount !== 1 ? "s" : ""}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-600 dark:text-gray-400 ml-2"
          >
            {activeUsers.length} active
          </motion.span>
        </div>
      </TooltipProvider>
    );
  }
);

CollaborativePresence.displayName = "CollaborativePresence";

export { CollaborativePresence };
