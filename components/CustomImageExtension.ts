import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageResizer } from "./ImageResizer";

export const CustomImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
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
    };
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ImageResizer);
  },
});
