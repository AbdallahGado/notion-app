import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Track online users per document
export const joinDocument = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Store presence in a simple key-value store
    await ctx.db.insert("presence", {
      documentId: args.documentId,
      userId: args.userId,
      userName: args.userName,
      userAvatar: args.userAvatar,
      lastSeen: Date.now(),
    });
  },
});

export const leaveDocument = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Remove presence record
    const presence = await ctx.db
      .query("presence")
      .withIndex("by_document_user", (q) =>
        q.eq("documentId", args.documentId).eq("userId", args.userId)
      )
      .first();

    if (presence) {
      await ctx.db.delete(presence._id);
    }
  },
});

export const updatePresence = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const presence = await ctx.db
      .query("presence")
      .withIndex("by_document_user", (q) =>
        q.eq("documentId", args.documentId).eq("userId", args.userId)
      )
      .first();

    if (presence) {
      await ctx.db.patch(presence._id, { lastSeen: Date.now() });
    }
  },
});

export const getOnlineUsers = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000; // 5 minutes

    const onlineUsers = await ctx.db
      .query("presence")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .filter((q) => q.gte(q.field("lastSeen"), fiveMinutesAgo))
      .collect();

    return onlineUsers.map((user, index) => ({
      userId: user.userId,
      userName: user.userName,
      userAvatar: user.userAvatar,
      isActive: true,
      color: [
        "bg-red-500",
        "bg-green-500",
        "bg-blue-500",
        "bg-yellow-500",
        "bg-purple-500",
      ][index % 5],
    }));
  },
});
