/**
 * Public-site rich-text rendering.
 *
 * Editors enter plain text with simple Markdown-style brackets:
 *   # Heading
 *   ## Subheading
 *   - list item
 *   1. numbered item
 *   **bold**
 *   *italic*
 *   `inline code`
 *   [link label](https://example.com)
 *
 * The renderer walks the text and returns React nodes. It never uses
 * dangerouslySetInnerHTML, so unsanitised HTML in the CMS cannot be
 * executed on the public website.
 */
import { Fragment } from 'react';
import type { ReactNode } from 'react';

export function renderRichText(value: string | null | undefined): ReactNode {
  if (!value) return null;
  const blocks = value.split(/\n{2,}/);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('# ')) {
          return (
            <h3 key={idx} className="font-display tracking-tighter text-xl md:text-2xl text-balance mt-2">
              {inlineFormat(trimmed.slice(2))}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h4 key={idx} className="font-display tracking-tighter text-lg md:text-xl text-balance mt-2">
              {inlineFormat(trimmed.slice(3))}
            </h4>
          );
        }
        const lines = trimmed.split('\n');
        if (lines.every((line) => line.startsWith('- ') || line.startsWith('* '))) {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1">
              {lines.map((line, i) => (
                <li key={i}>{inlineFormat(line.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((line) => /^\d+\.\s/.test(line))) {
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1">
              {lines.map((line, i) => (
                <li key={i}>{inlineFormat(line.replace(/^\d+\.\s+/, ''))}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="text-base leading-relaxed text-ink-600">
            {inlineFormat(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function inlineFormat(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const push = (node: ReactNode) => nodes.push(<Fragment key={key++}>{node}</Fragment>);

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(^|[^*])\*(?!\*)([^*]+?)\*(?!\*)/);
    const codeMatch = remaining.match(/`([^`]+?)`/);
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const candidates = [boldMatch, italicMatch, codeMatch, linkMatch]
      .filter(Boolean)
      .map((m) => ({ match: m as RegExpMatchArray, index: (m as RegExpMatchArray).index ?? -1 }))
      .filter((c) => c.index >= 0)
      .sort((a, b) => a.index - b.index);

    const next = candidates[0];
    if (!next) {
      push(remaining);
      break;
    }

    if (next.index > 0) push(remaining.slice(0, next.index));

    if (next.match === boldMatch) {
      push(<strong>{next.match[1]}</strong>);
      remaining = remaining.slice(next.index + next.match[0].length);
    } else if (next.match === italicMatch) {
      const prefix = next.match[1];
      const body = next.match[2];
      push(prefix);
      push(<em>{body}</em>);
      remaining = remaining.slice(next.index + next.match[0].length);
    } else if (next.match === codeMatch) {
      push(<code className="rounded bg-ink-50 px-1 py-0.5 font-mono text-[0.85em]">{next.match[1]}</code>);
      remaining = remaining.slice(next.index + next.match[0].length);
    } else if (next.match === linkMatch) {
      const label = next.match[1];
      const href = next.match[2];
      const isExternal = /^https?:\/\//.test(href);
      push(
        <a
          key={key++}
          href={href}
          className="text-accent-600 hover:text-accent-700 underline-offset-4 hover:underline"
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer noopener' : undefined}
        >
          {label}
        </a>,
      );
      remaining = remaining.slice(next.index + next.match[0].length);
    }
  }

  return <>{nodes}</>;
}