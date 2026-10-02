import React from 'react';

interface FormattedAnswerProps {
  content: string;
  className?: string;
}

export const FormattedAnswer: React.FC<FormattedAnswerProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Clean raw artifacts like ^^ or ^
  const cleanedText = content.replace(/\^\^|\^/g, '').trim();

  // Split content into double newline paragraphs or block elements
  const blocks = cleanedText.split(/\n\n+/);

  return (
    <div className={`space-y-3 font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 ${className}`}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();

        // 1. Headings (### or ## or #)
        if (/^#{1,4}\s+/.test(trimmed)) {
          const headingText = trimmed.replace(/^#{1,4}\s+/, '');
          return (
            <h4 key={bIdx} className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pt-1 border-b border-slate-100 dark:border-slate-800 pb-1">
              {renderInlineFormatting(headingText)}
            </h4>
          );
        }

        // 2. Blockquotes (> quote)
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/, '').replace(/^"|"$/g, '');
          return (
            <blockquote key={bIdx} className="border-l-2 border-blue-500 pl-3 py-1.5 my-2 bg-slate-50 dark:bg-slate-950/60 rounded-r-lg italic text-slate-700 dark:text-slate-300">
              "{renderInlineFormatting(quoteText)}"
            </blockquote>
          );
        }

        // 3. Bullet lists (- item or * item)
        if (/^[-*]\s+/m.test(trimmed)) {
          const listItems = trimmed.split(/\n(?=[-*]\s+)/);
          return (
            <ul key={bIdx} className="space-y-1.5 pl-1 my-1">
              {listItems.map((li, lIdx) => {
                const itemText = li.replace(/^[-*]\s+/, '');
                return (
                  <li key={lIdx} className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                    <span className="flex-1">{renderInlineFormatting(itemText)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 4. Regular Paragraphs
        return (
          <p key={bIdx} className="text-slate-800 dark:text-slate-200 leading-relaxed">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Parses inline bold (**text**), italics (*text*), and inline quotes
 */
function renderInlineFormatting(text: string): React.ReactNode {
  // Split by bold pattern **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {renderItalics(inner)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{renderItalics(part)}</React.Fragment>;
  });
}

function renderItalics(text: string): React.ReactNode {
  // Split by italic pattern *text*
  const parts = text.split(/(\*[^*]+\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      const inner = part.slice(1, -1);
      return (
        <em key={i} className="italic text-slate-600 dark:text-slate-400">
          {inner}
        </em>
      );
    }
    return part;
  });
}
