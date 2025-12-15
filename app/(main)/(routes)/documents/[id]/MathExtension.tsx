import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathInlineComponent } from './MathInlineComponent';
import { MathBlockComponent } from './MathBlockComponent';

export const MathInline = Node.create({
  name: 'math_inline',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math_inline"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math_inline' }), 0];
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(MathInlineComponent as any);
  },
});

export const MathBlock = Node.create({
  name: 'math_block',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math_block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math_block' }), 0];
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(MathBlockComponent as any);
  },
});
