"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h3: ({ children }) => <h3 className="text-base font-bold text-white mt-5 mb-2">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-bold text-red-400 mt-4 mb-1.5">{children}</h4>,
  p: ({ children }) => <p className="text-sm text-gray-300 leading-relaxed mb-3">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-400">{children}</em>,
  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 mb-3 ml-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300 mb-3 ml-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-red-500/50 bg-white/[0.03] pl-4 py-2 my-3 text-sm text-gray-300 italic">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-white/[0.08]">
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-white/[0.05]">{children}</thead>,
  th: ({ children }) => <th className="px-3 py-2 text-left font-bold text-gray-200 border-b border-white/[0.08]">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 text-gray-300 border-b border-white/[0.04] align-top">{children}</td>,
  hr: () => <hr className="border-white/[0.08] my-4" />,
};

export function ConteudoMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
