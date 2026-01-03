import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingDocument = await context.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const recursiveArchive = async (documentId: Id<"documents">) => {
      const children = await context.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      for (const child of children) {
        await context.db.patch(child._id, {
          isArchived: true,
        });
        await recursiveArchive(child._id);
      }
    };

    const document = await context.db.patch(args.id, {
      isArchived: true,
    });

    recursiveArchive(args.id);

    return document;
  },
});

export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documents = await context.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument)
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
    isFolder: v.optional(v.boolean()),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const document = await context.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
      isFolder: args.isFolder ?? false,
    });

    return document;
  },
});

export const getTrash = query({
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documents = await context.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();

    return documents;
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingDocument = await context.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await context.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      for (const child of children) {
        await context.db.patch(child._id, {
          isArchived: false,
        });

        await recursiveRestore(child._id);
      }
    };

    const options: Partial<Doc<"documents">> = {
      isArchived: false,
    };

    if (existingDocument.parentDocument) {
      const parent = await context.db.get(existingDocument.parentDocument);
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }

    const document = await context.db.patch(args.id, options);

    recursiveRestore(args.id);

    return document;
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingDocument = await context.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await context.db.delete(args.id);

    return document;
  },
});

export const getSearch = query({
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documents = await context.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    const document = await context.db.get(args.documentId);

    if (!document) {
      throw new Error("Not found");
    }

    if (document.isPublished && !document.isArchived) {
      return document;
    }

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    if (document.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // If content is stored in Convex storage, fetch it
    let content = document.content;
    if (!content && document.contentStorageId) {
      try {
        const contentUrl = await context.storage.getUrl(document.contentStorageId);
        if (contentUrl) {
          const response = await fetch(contentUrl);
          if (response.ok) {
            content = await response.text();
          }
        }
      } catch (error) {
        console.error("Failed to fetch content from storage:", error);
      }
    }

    return {
      ...document,
      content,
    };
  },
});

export const getByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const documents = await context.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.documentId)
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    parentDocument: v.optional(v.id("documents")), // <-- allow parentDocument
    isFolder: v.optional(v.boolean()),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;

    const { id, ...rest } = args;

    const existingDocument = await context.db.get(id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Handle large content by storing in Convex storage
    let contentToStore = rest.content;
    let contentStorageId = existingDocument.contentStorageId;

      if (rest.content !== undefined) {
        const contentSize = new Blob([rest.content]).size;

        // If content is larger than 100KB (leaving buffer for 1MB storage limit), store in Convex storage
        if (contentSize > 100 * 1024) {
          // Delete existing storage file if it exists
          if (contentStorageId) {
            await context.storage.delete(contentStorageId);
          }

          try {
            // Generate upload URL and store content
            const uploadUrl = await context.storage.generateUploadUrl();
            const contentBlob = new Blob([rest.content], { type: 'text/html' });

            const uploadResult = await fetch(uploadUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/html' },
              body: contentBlob,
            });

            if (!uploadResult.ok) {
              throw new Error(`Failed to upload content: ${uploadResult.status}`);
            }

            const { storageId } = await uploadResult.json();
            contentStorageId = storageId;
            contentToStore = undefined; // Don't store in DB field
          } catch (error) {
            // If upload fails, keep existing content
            contentToStore = existingDocument.content;
            contentStorageId = existingDocument.contentStorageId;
          }
        } else {
          // Content is small enough, store in DB and clean up storage if needed
          if (contentStorageId) {
            await context.storage.delete(contentStorageId);
            contentStorageId = undefined;
          }
          contentToStore = rest.content;
        }
      }

    // Create a version snapshot before updating
    if (rest.title !== undefined || rest.content !== undefined) {
      const latestVersion = await context.db
        .query("document_versions")
        .withIndex("by_document", (q) => q.eq("documentId", id))
        .order("desc")
        .first();

      const versionNumber = (latestVersion?.versionNumber || 0) + 1;

      // Get the current content (from storage if needed)
      let currentContent = existingDocument.content;
      let currentContentStorageId = existingDocument.contentStorageId;
      if (!currentContent && existingDocument.contentStorageId) {
        try {
          const contentUrl = await context.storage.getUrl(existingDocument.contentStorageId);
          if (contentUrl) {
            const response = await fetch(contentUrl);
            if (response.ok) {
              currentContent = await response.text();
            }
          }
        } catch (error) {
          console.error("Failed to fetch current content for version:", error);
        }
      }

      // Handle large content in version snapshots
      let versionContentToStore = undefined;
      let versionContentStorageId = undefined;

      if (currentContent) {
        const contentSize = new Blob([currentContent]).size;

        // If content is larger than 100KB, store in Convex storage for version
        if (contentSize > 100 * 1024) {
          try {
            // Generate upload URL and store content for version
            const uploadUrl = await context.storage.generateUploadUrl();
            const contentBlob = new Blob([currentContent], { type: 'text/html' });

            const uploadResult = await fetch(uploadUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/html' },
              body: contentBlob,
            });

            if (!uploadResult.ok) {
              throw new Error(`Failed to upload version content: ${uploadResult.status}`);
            }

            const { storageId } = await uploadResult.json();
            versionContentStorageId = storageId;
            versionContentToStore = undefined; // Don't store in DB field
          } catch (error) {
            versionContentToStore = undefined;
            versionContentStorageId = undefined;
          }
        } else {
          // Content is small enough, store in DB
          versionContentToStore = currentContent;
        }
      }

      await context.db.insert("document_versions", {
        documentId: id,
        title: existingDocument.title,
        content: versionContentToStore,
        contentStorageId: versionContentStorageId,
        userId,
        createdAt: Date.now(),
        versionNumber,
      });
    }

    const { content: _, ...restWithoutContent } = rest;

    const document = await context.db.patch(id, {
      ...restWithoutContent,
      content: contentToStore,
      contentStorageId,
    });

    return document;
  },
});

export const removeIcon = mutation({
  args: { id: v.id("documents") },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;

    const existingDocument = await context.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await context.db.patch(args.id, {
      icon: undefined,
    });

    return document;
  },
});

export const removeCoverImage = mutation({
  args: { id: v.id("documents") },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;

    const existingDocument = await context.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await context.db.patch(args.id, {
      coverImage: undefined,
    });

    return document;
  },
});

export const toggleStarred = mutation({
  args: { id: v.id("documents") },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const doc = await context.db.get(args.id);
    if (!doc) throw new Error("Not found");
    if (doc.userId !== userId) throw new Error("Unauthorized");
    const newStarred = !doc.starred;
    await context.db.patch(args.id, { starred: newStarred });
    return { starred: newStarred };
  },
});

export const getVersions = query({
  args: { documentId: v.id("documents") },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const document = await context.db.get(args.documentId);
    if (!document || document.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const versions = await context.db
      .query("document_versions")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .collect();

    return versions;
  },
});

export const restoreVersion = mutation({
  args: {
    documentId: v.id("documents"),
    versionId: v.id("document_versions"),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const document = await context.db.get(args.documentId);
    if (!document || document.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const version = await context.db.get(args.versionId);
    if (!version || version.documentId !== args.documentId) {
      throw new Error("Version not found");
    }

    // Create a version snapshot of the current state before restoring
    const latestVersion = await context.db
      .query("document_versions")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .first();

    const versionNumber = (latestVersion?.versionNumber || 0) + 1;

    // Get the current content (from storage if needed)
    let currentContent = document.content;
    if (!currentContent && document.contentStorageId) {
      try {
        const contentUrl = await context.storage.getUrl(document.contentStorageId);
        if (contentUrl) {
          const response = await fetch(contentUrl);
          if (response.ok) {
            currentContent = await response.text();
          }
        }
      } catch (error) {
        console.error("Failed to fetch current content for version:", error);
      }
    }

    // Handle large content in version snapshots
    let versionContentToStore = currentContent;
    let versionContentStorageId = undefined;

    if (currentContent) {
      const contentSize = new Blob([currentContent]).size;

      // If content is larger than 100KB, store in Convex storage for version
      if (contentSize > 100 * 1024) {
        try {
          // Generate upload URL and store content for version
          const uploadUrl = await context.storage.generateUploadUrl();
          const contentBlob = new Blob([currentContent], { type: 'text/html' });

          const uploadResult = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/html' },
            body: contentBlob,
          });

          if (!uploadResult.ok) {
            throw new Error(`Failed to upload version content: ${uploadResult.status}`);
          }

          const { storageId } = await uploadResult.json();
          versionContentStorageId = storageId;
          versionContentToStore = undefined; // Don't store in DB field
        } catch (error) {
          versionContentToStore = undefined;
          versionContentStorageId = undefined;
        }
      }
    }

    await context.db.insert("document_versions", {
      documentId: args.documentId,
      title: document.title,
      content: versionContentToStore,
      contentStorageId: versionContentStorageId,
      userId,
      createdAt: Date.now(),
      versionNumber,
    });

    // Restore the selected version - handle large content properly
    // Get the version content (from storage if needed)
    let versionContent = version.content;
    if (!versionContent && version.contentStorageId) {
      try {
        const contentUrl = await context.storage.getUrl(version.contentStorageId);
        if (contentUrl) {
          const response = await fetch(contentUrl);
          if (response.ok) {
            versionContent = await response.text();
          }
        }
      } catch (error) {
        console.error("Failed to fetch version content from storage:", error);
      }
    }

    let contentToStore = versionContent;
    let contentStorageId = document.contentStorageId;

    if (versionContent !== undefined) {
      const contentSize = new Blob([versionContent]).size;

      // If content is larger than 100KB, store in Convex storage
      if (contentSize > 100 * 1024) {
        // Delete existing storage file if it exists
        if (contentStorageId) {
          await context.storage.delete(contentStorageId);
        }

        try {
          // Generate upload URL and store content
          const uploadUrl = await context.storage.generateUploadUrl();
          const contentBlob = new Blob([versionContent], { type: 'text/html' });

          const uploadResult = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/html' },
            body: contentBlob,
          });

          if (!uploadResult.ok) {
            throw new Error(`Failed to upload content: ${uploadResult.status}`);
          }

          const { storageId } = await uploadResult.json();
          contentStorageId = storageId;
          contentToStore = undefined; // Don't store in DB field
        } catch (error) {
          // If upload fails, keep existing
          contentToStore = document.content;
          contentStorageId = document.contentStorageId;
        }
      } else {
        // Content is small enough, store in DB and clean up storage if needed
        if (contentStorageId) {
          await context.storage.delete(contentStorageId);
          contentStorageId = undefined;
        }
        contentToStore = versionContent;
      }
    }

    const restoredDocument = await context.db.patch(args.documentId, {
      title: version.title,
      content: contentToStore,
      contentStorageId,
    });

    return restoredDocument;
  },
});
