import React from 'react';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  tableOfContents: Heading[];
  showTableOfContents: boolean;
  toggleTableOfContents: () => void;
  contentRef: React.RefObject<HTMLDivElement>;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  tableOfContents,
  showTableOfContents,
  toggleTableOfContents,
  contentRef,
}) => {
  return (
    <div className="border-b bg-gray-50">
      <button
        onClick={toggleTableOfContents}
        className="w-full px-6 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between"
      >
        <span className="flex items-center space-x-2">
          <span>📋</span>
          <span>Table of Contents ({tableOfContents.length} sections)</span>
        </span>
        <span className={`transform transition-transform ${showTableOfContents ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {showTableOfContents && (
        <div className="px-6 pb-4 max-h-60 overflow-y-auto">
          <ul className="space-y-1">
            {tableOfContents.map((heading, index) => (
              <li key={index} style={{ marginLeft: `${(heading.level - 1) * 16}px` }}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (contentRef.current) {
                      const containerRect = contentRef.current.getBoundingClientRect();
                      const element = document.getElementById(heading.id);
                      if (element) {
                        const elementRect = element.getBoundingClientRect();
                        const scrollTop = contentRef.current.scrollTop;
                        const offsetTop = elementRect.top - containerRect.top + scrollTop - 20;
                        contentRef.current.scrollTo({
                          top: Math.max(0, offsetTop),
                          behavior: 'smooth'
                        });
                        window.history.replaceState(null, '', `#${heading.id}`);
                      }
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm hover:underline block py-1"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 