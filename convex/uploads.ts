import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createFile = mutation({
  args: {
    storageId: v.id("_storage"),
    documentId: v.id("documents"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      storageId: args.storageId,
      documentId: args.documentId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedAt: Date.now(),
    });
  },
});

export const getFilesByDocument = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
  },
});

export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
