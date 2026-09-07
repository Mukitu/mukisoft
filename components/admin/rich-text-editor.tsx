'use client';

import { useRef } from 'react';

type Props = {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minHeight?: number;
};

/**
 * Minimal rich-text editor — emits sanitised Markdown-style text.
 *
 * The toolbar wraps selected text in lightweight Markdown brackets
 * (e.g. **bold**, *italic*, # heading). Stored content is plain text
 * and is NEVER rendered with dangerouslySetInnerHTML. The public
 * website renders paragraphs separated by blank lines.
 *
 * This avoids HTML sanitisation issues while still letting editors
 * add headings, lists, links and basic formatting.
 */
export function RichTextEditor({ id, value, onChange, placeholder, minHeight = 160 }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = value.slice(0, start) + before + value.slice(start, end) + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = end + before.length;
    });
  };

  const prefixLines = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || 'List item';
    const after = value.slice(end);
    const replaced = selected
      .split('\n')
      .map((line) => prefix + line)
      .join('\n');
    onChange(before + replaced + after);
  };

  const insertLink = () => {
    const url = window.prompt('Link URL');
    if (!url) return;
    wrap('[', `](${url})`);
  };

  return (
    <div className="admin-rich-editor">
      <div className="admin-rich-editor-toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" onClick={() => prefixLines('# ')} title="Heading">H1</button>
        <button type="button" onClick={() => prefixLines('## ')} title="Subheading">H2</button>
        <button type="button" onClick={() => wrap('**')} title="Bold"><strong>B</strong></button>
        <button type="button" onClick={() => wrap('*')} title="Italic"><em>I</em></button>
        <button type="button" onClick={() => prefixLines('- ')} title="List">• List</button>
        <button type="button" onClick={() => prefixLines('1. ')} title="Numbered">1. List</button>
        <button type="button" onClick={() => wrap('`')} title="Inline code">code</button>
        <button type="button" onClick={insertLink} title="Link">link</button>
        <button
          type="button"
          onClick={() => {
            const el = ref.current;
            if (!el) return;
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const next = value.slice(0, start) + value.slice(end);
            onChange(next);
            requestAnimationFrame(() => {
              el.focus();
              el.selectionStart = el.selectionEnd = start;
            });
          }}
          title="Clear"
          style={{ marginLeft: 'auto', color: 'var(--admin-text-dim)' }}
        >
          Clear
        </button>
      </div>
      <textarea
        id={id}
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight }}
      />
      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)', marginTop: '0.35rem' }}>
        Uses simple Markdown-style brackets (# for headings, **bold**, *italic*, - lists). Stored as plain text — never rendered as raw HTML.
      </div>
    </div>
  );
}

/**
 * Render Markdown-style content as plain paragraphs/lists/headings
 * without using dangerouslySetInnerHTML.
 */
export function RichTextRender({ value }: { value: string }) {
  if (!value) return null;
  const blocks = value.split(/\n{2,}/);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('# ')) {
          return <h3 key={idx} style={{ margin: 0 }}>{inlineFormat(trimmed.slice(2))}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h4 key={idx} style={{ margin: 0 }}>{inlineFormat(trimmed.slice(3))}</h4>;
        }
        const lines = trimmed.split('\n');
        if (lines.every((line) => line.startsWith('- ') || line.startsWith('* '))) {
          return (
            <ul key={idx} style={{ paddingLeft: '1.25rem', listStyle: 'disc', margin: 0 }}>
              {lines.map((line, i) => (
                <li key={i}>{inlineFormat(line.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((line) => /^\d+\.\s/.test(line))) {
          return (
            <ol key={idx} style={{ paddingLeft: '1.25rem', listStyle: 'decimal', margin: 0 }}>
              {lines.map((line, i) => (
                <li key={i}>{inlineFormat(line.replace(/^\d+\.\s+/, ''))}</li>
              ))}
            </ol>
          );
        }
        return <p key={idx} style={{ margin: 0 }}>{inlineFormat(trimmed)}</p>;
      })}
    </div>
  );
}

function inlineFormat(text: string): React.ReactNode {
  // Returns a React node that renders **bold**, *italic*, `code`, [text](url)
  // without using dangerouslySetInnerHTML.
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const push = (node: React.ReactNode) => nodes.push(<span key={key++}>{node}</span>);

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
      push(<code>{next.match[1]}</code>);
      remaining = remaining.slice(next.index + next.match[0].length);
    } else if (next.match === linkMatch) {
      const label = next.match[1];
      const href = next.match[2];
      push(
        <a key={key++} href={href} className="admin-link" target="_blank" rel="noreferrer noopener">
          {label}
        </a>,
      );
      remaining = remaining.slice(next.index + next.match[0].length);
    }
  }

  return <>{nodes}</>;
}