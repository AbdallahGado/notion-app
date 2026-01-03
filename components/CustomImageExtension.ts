import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageResizer } from "./ImageResizer";

export const CustomImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      storageId: {
        default: null,
        renderHTML: (attributes) => ({
          "data-storage-id": attributes.storageId,
        }),
      },
      width: {
        default: "300px",
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },
      height: {
        default: "auto",
        renderHTML: (attributes) => ({
          height: attributes.height,
        }),
      },
      left: {
        default: "0px",
        renderHTML: (attributes) => ({
          style: `left: ${attributes.left};`,
        }),
      },
      top: {
        default: "0px",
        renderHTML: (attributes) => ({
          style: `top: ${attributes.top};`,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizer);
  },
});
