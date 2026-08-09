'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, children, href, ...props }) => {
          // Flatten children to a single string to check for the BUTTON: prefix
          const textContent = React.Children.toArray(children).join('');
          
          if (typeof textContent === 'string' && textContent.startsWith('BUTTON:')) {
            const btnText = textContent.replace('BUTTON:', '').trim();
            return (
              <a 
                href={href}
                className="mt-8 mb-4 flex items-center justify-center w-full md:w-auto bg-gold hover:bg-gold-light text-zinc-950 font-black font-serif text-lg py-5 px-10 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] hover:-translate-y-1 uppercase tracking-widest no-underline"
              >
                {btnText}
              </a>
            );
          }
          
          // Regular links
          return <a href={href} {...props}>{children}</a>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
