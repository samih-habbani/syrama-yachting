// Renders a BlogPost's `content` (an ordered BlogBlock[] — see lib/blog.ts)
// with the same typographic language as the rest of the site: cormorant for
// headings, tenor for body, the gold/off-white/muted palette. No markdown
// library — `text` fields support just two inline forms, [label](/path) and
// **bold**, parsed by renderInline below. Server component (no interactivity).
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { BlogBlock } from '@/lib/blog'

const paragraphStyle = {
  fontFamily: 'var(--font-tenor)',
  fontSize: 15,
  lineHeight: 2,
  color: '#8f8f7f',
  margin: '0 0 24px',
} as const

const linkStyle = {
  color: '#b8974a',
  textDecoration: 'none',
  borderBottom: '1px solid rgba(184,151,74,0.35)',
} as const

// Splits a string on [label](href) and **bold** and returns React nodes.
// Internal links (href starting with "/") go through next/link; anything
// else is a plain <a target=_blank>. Deliberately tiny — this is editorial
// body copy, not a CMS rich-text field.
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined && m[2] !== undefined) {
      const label = m[1]
      const href = m[2]
      nodes.push(
        href.startsWith('/') ? (
          <Link key={key++} href={href} style={linkStyle}>{label}</Link>
        ) : (
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>{label}</a>
        ),
      )
    } else if (m[3] !== undefined) {
      nodes.push(<strong key={key++} style={{ color: '#d8d8cc', fontWeight: 400 }}>{m[3]}</strong>)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export default function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2
                key={i}
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  fontWeight: 300,
                  color: '#f5eedd',
                  margin: '48px 0 20px',
                }}
              >
                {block.text}
              </h2>
            )
          case 'paragraph':
            return (
              <p key={i} style={paragraphStyle}>
                {renderInline(block.text)}
              </p>
            )
          case 'list':
            return (
              <ul
                key={i}
                style={{
                  margin: '0 0 24px',
                  paddingLeft: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    style={{
                      fontFamily: 'var(--font-tenor)',
                      fontSize: 15,
                      lineHeight: 1.9,
                      color: '#8f8f7f',
                      paddingLeft: 22,
                      position: 'relative',
                    }}
                  >
                    <span style={{ position: 'absolute', left: 0, color: '#b8974a' }}>—</span>
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            )
          case 'quote':
            return (
              <blockquote
                key={i}
                style={{
                  margin: '36px 0',
                  paddingLeft: 24,
                  borderLeft: '2px solid #b8974a',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(19px, 2.4vw, 24px)',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    color: '#d8d8cc',
                    margin: 0,
                  }}
                >
                  {renderInline(block.text)}
                </p>
                {block.attribution && (
                  <cite
                    style={{
                      display: 'block',
                      marginTop: 12,
                      fontFamily: 'var(--font-tenor)',
                      fontSize: 11,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontStyle: 'normal',
                      color: '#8f8f7f',
                    }}
                  >
                    {block.attribution}
                  </cite>
                )}
              </blockquote>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
