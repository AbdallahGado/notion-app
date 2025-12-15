import React, { useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import katex from 'katex';

interface MathInlineComponentProps {
  node: {
    attrs: {
      latex: string;
    };
  };
}

export const MathInlineComponent: React.FC<MathInlineComponentProps> = ({ node }) => {
  const mathRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (mathRef.current && node.attrs.latex) {
      try {
        katex.render(node.attrs.latex, mathRef.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (error) {
        console.error('KaTeX render error:', error);
        if (mathRef.current) {
          mathRef.current.textContent = node.attrs.latex;
        }
      }
    }
  }, [node.attrs.latex]);

  return (
    <NodeViewWrapper as="span" className="inline-math">
      <span ref={mathRef} className="math-inline" />
    </NodeViewWrapper>
  );
};
