import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    starred: v.optional(v.boolean()),
    isFolder: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),
  comments: defineTable({
    documentId: v.id("documents"),
    from: v.number(),
    to: v.number(),
    text: v.string(),
    resolved: v.boolean(),
    replies: v.optional(
      v.array(
        v.object({
          text: v.string(),
          id: v.number(),
          resolved: v.boolean(),
          userId: v.optional(v.string()),
          userName: v.optional(v.string()),
          userAvatar: v.optional(v.string()),
          createdAt: v.optional(v.number()),
        })
      )
    ),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    userAvatar: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  }).index("by_document", ["documentId"]),
});
