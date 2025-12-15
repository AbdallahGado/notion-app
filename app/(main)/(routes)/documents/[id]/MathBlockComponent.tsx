import React, { useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import katex from 'katex';

interface MathBlockComponentProps {
  node: {
    attrs: {
      latex: string;
    };
  };
}

export const MathBlockComponent: React.FC<MathBlockComponentProps> = ({ node }) => {
  const mathRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mathRef.current && node.attrs.latex) {
      try {
        katex.render(node.attrs.latex, mathRef.current, {
          throwOnError: false,
          displayMode: true,
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
    <NodeViewWrapper className="math-block">
      <div ref={mathRef} className="math-display" />
    </NodeViewWrapper>
  );
};
