import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    contentStorageId: v.optional(v.id("_storage")),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    starred: v.optional(v.boolean()),
    isFolder: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),
  document_versions: defineTable({
    documentId: v.id("documents"),
    title: v.string(),
    content: v.optional(v.string()),
    contentStorageId: v.optional(v.id("_storage")),
    userId: v.string(),
    createdAt: v.number(),
    versionNumber: v.optional(v.number()),
  })
    .index("by_document", ["documentId"])
    .index("by_document_createdAt", ["documentId", "createdAt"]),
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
  presence: defineTable({
    documentId: v.id("documents"),
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    lastSeen: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_document_user", ["documentId", "userId"]),
  files: defineTable({
    storageId: v.id("_storage"),
    documentId: v.id("documents"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    uploadedAt: v.number(),
  }).index("by_document", ["documentId"]),
});
