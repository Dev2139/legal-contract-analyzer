import React from 'react';

interface FormattedAnswerProps {
  content: string;
  className?: string;
}

export const FormattedAnswer: React.FC<FormattedAnswerProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Clean raw artifacts like ^^ or ^
  const cleanedText = content.replace(/\^\^|\^/g, '').trim();

  // Split content into blocks by double newlines
  const rawBlocks = cleanedText.split(/\n\n+/);

  return (
    <div className={`space-y-3.5 font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 ${className}`}>
      {rawBlocks.map((block, bIdx) => {
        const trimmed = block.trim();

        // 1. Headings (### or ## or #)
        if (/^#{1,4}\s+/.test(trimmed)) {
          const headingText = trimmed.replace(/^#{1,4}\s+/, '');
          return (
            <h4
              key={bIdx}
              className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pt-2 border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center space-x-2"
            >
              <span className="w-1.5 h-3 bg-blue-600 dark:text-blue-400 rounded-xs inline-block"></span>
              <span>{renderInlineFormatting(headingText)}</span>
            </h4>
          );
        }

        // 2. Blockquotes (> quote)
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/, '').replace(/^"|"$/g, '');
          return (
            <blockquote
              key={bIdx}
              className="border-l-3 border-blue-500 pl-3.5 py-2 my-2 bg-blue-50/50 dark:bg-slate-950/80 rounded-r-xl italic text-slate-700 dark:text-slate-300 font-sans"
            >
              "{renderInlineFormatting(quoteText)}"
            </blockquote>
          );
        }

        // 3. Bullet lists (- item or * item or 1. item) or multiple lines starting with dash
        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
        const isListBlock = lines.length > 1 && lines.some((l) => /^[-*•]\s+|^\d+\.\s+/.test(l));

        if (isListBlock || /^[-*•]\s+|^\d+\.\s+/.test(trimmed)) {
          return (
            <div key={bIdx} className="space-y-2 my-2">
              {lines.map((line, lIdx) => {
                const isItem = /^[-*•]\s+|^\d+\.\s+/.test(line);
                const itemText = line.replace(/^[-*•]\s+|^\d+\.\s+/, '');

                if (!isItem) {
                  return (
                    <p key={lIdx} className="text-slate-800 dark:text-slate-200">
                      {renderInlineFormatting(line)}
                    </p>
                  );
                }

                return (
                  <div
                    key={lIdx}
                    className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0 mt-1.5"></div>
                    <div className="flex-1 min-w-0 text-slate-800 dark:text-slate-200">
                      {renderInlineFormatting(itemText)}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // 4. Regular Paragraphs
        return (
          <p key={bIdx} className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Parses inline bold (**text**), italics (*text*), and highlighted values
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
