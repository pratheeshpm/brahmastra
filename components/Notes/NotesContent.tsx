import React from 'react';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { MermaidDiagram } from '../Markdown/MermaidDiagram';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';

interface NotesContentProps {
  note: any;
  contentRef: React.RefObject<HTMLDivElement>;
  handleLinkClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  selectedText: string;
  selectionPosition: { x: number; y: number } | null;
  handleExplainSelection: () => void;
  showBackToTop: boolean;
  scrollToTop: () => void;
  generateHeadingId: (text: string) => string;
}

export const NotesContent: React.FC<NotesContentProps> = ({
  note,
  contentRef,
  handleLinkClick,
  selectedText,
  selectionPosition,
  handleExplainSelection,
  showBackToTop,
  scrollToTop,
  generateHeadingId,
}) => {
  return (
    <div
      ref={contentRef}
      className="flex-1 overflow-y-auto p-6 relative"
      onClick={handleLinkClick}
    >
      <div className="prose prose-lg max-w-none">
        <MemoizedReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeMathjax]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              if (language === 'mermaid') {
                return (
                  <MermaidDiagram
                    code={String(children).replace(/\n$/, '')}
                  />
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300" {...props}>
                  {children}
                </table>
              </div>
            ),
            thead: ({ children, ...props }) => (
              <thead className="bg-gray-100" {...props}>
                {children}
              </thead>
            ),
            tbody: ({ children, ...props }) => (
              <tbody {...props}>
                {children}
              </tbody>
            ),
            tr: ({ children, ...props }) => (
              <tr className="border-b border-gray-200 hover:bg-gray-50" {...props}>
                {children}
              </tr>
            ),
            th: ({ children, ...props }) => (
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold bg-gray-100" {...props}>
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td className="border border-gray-300 px-4 py-2" {...props}>
                {children}
              </td>
            ),
            h1: ({ children, ...props }) => {
              const id = generateHeadingId(String(children));
              return <h1 id={id} {...props}>{children}</h1>;
            },
            h2: ({ children, ...props }) => {
              const id = generateHeadingId(String(children));
              return <h2 id={id} {...props}>{children}</h2>;
            },
            h3: ({ children, ...props }) => {
              const id = generateHeadingId(String(children));
              return <h3 id={id} {...props}>{children}</h3>;
            },
            h4: ({ children, ...props }) => {
              const id = generateHeadingId(String(children));
              return <h4 id={id} {...props}>{children}</h4>;
            },
            h5: ({ children, ...props }) => {
              const id = generateHeadingId(String(children));
              return <h5 id={id} {...props}>{children}</h5>;
            },
            h6: ({ children, ...props }) => {
              const id = generateHeadingId(String(children));
              return <h6 id={id} {...props}>{children}</h6>;
            },
            blockquote: ({ children, ...props }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 py-2" {...props}>
                {children}
              </blockquote>
            ),
            hr: ({ ...props }) => (
              <hr className="my-8 border-gray-300" {...props} />
            ),
            em: ({ children, ...props }) => (
              <em className="font-medium text-blue-600" {...props}>{children}</em>
            ),
            strong: ({ children, ...props }) => (
              <strong className="font-bold text-gray-900" {...props}>{children}</strong>
            ),
            ul: ({ children, ...props }) => (
              <ul className="list-disc pl-6 space-y-1" {...props}>{children}</ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal pl-6 space-y-1" {...props}>{children}</ol>
            ),
            li: ({ children, ...props }) => (
              <li className="text-gray-800" {...props}>{children}</li>
            ),
            p: ({ children, ...props }) => (
              <p className="text-gray-800 leading-relaxed mb-3" {...props}>{children}</p>
            ),
            a: ({ children, href, ...props }) => (
              <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            )
          }}
        >
          {note.content}
        </MemoizedReactMarkdown>
      </div>
      {selectedText && selectionPosition && (
        <div
          className="fixed bg-white border border-gray-300 rounded shadow-lg p-2 z-50"
          style={{
            left: selectionPosition.x,
            top: selectionPosition.y - 50
          }}
        >
          <button
            onClick={handleExplainSelection}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center space-x-1"
          >
            <span>🔍</span>
            <span>Explain with AI</span>
          </button>
        </div>
      )}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-40"
        >
          ↑
        </button>
      )}
    </div>
  );
}; 