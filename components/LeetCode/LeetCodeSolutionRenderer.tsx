import React from 'react';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { CodeBlock } from '../Markdown/CodeBlock';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

interface LeetCodeSolutionRendererProps {
  content: string;
  className?: string;
}

export const LeetCodeSolutionRenderer: React.FC<LeetCodeSolutionRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <MemoizedReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeMathjax]}
        components={{
          code({ node, inline, className, children, ...props }) {
            if (children.length) {
              if (children[0] == '▍') {
                return (
                  <span className="animate-pulse cursor-default mt-1">▍</span>
                );
              }

              children[0] = (children[0] as string).replace('`▍`', '▍');
            }

            const match = /language-(\w+)/.exec(className || '');

            if (inline) {
              return (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                key={Math.random()}
                language={(match && match[1]) || ''}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-gray-50">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return (
              <tbody className="bg-white divide-y divide-gray-200">
                {children}
              </tbody>
            );
          },
          tr({ children }) {
            return (
              <tr className="hover:bg-gray-50">
                {children}
              </tr>
            );
          },
          th({ children }) {
            return (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 last:border-r-0">
                {children}
              </td>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 my-4">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-base font-medium text-gray-800 mb-2 mt-3">
                {children}
              </h4>
            );
          },
          p({ children }) {
            return (
              <p className="text-gray-700 mb-4 leading-relaxed">
                {children}
              </p>
            );
          },
          ul({ children }) {
            return (
              <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return (
              <li className="ml-4">
                {children}
              </li>
            );
          },
          strong({ children }) {
            return (
              <strong className="font-semibold text-gray-900">
                {children}
              </strong>
            );
          },
          em({ children }) {
            return (
              <em className="italic text-gray-800">
                {children}
              </em>
            );
          },
          a({ href, children }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {children}
              </a>
            );
          },
          hr() {
            return (
              <hr className="my-6 border-gray-300" />
            );
          }
        }}
      >
        {content}
      </MemoizedReactMarkdown>
    </div>
  );
};
