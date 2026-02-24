const CODE_TOKEN_PREFIX = '__CODE_BLOCK_'

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
    )
}

function closeList(
  listMode: 'none' | 'ul' | 'ol',
  output: string[],
  nextMode: 'none' | 'ul' | 'ol'
): 'none' | 'ul' | 'ol' {
  if (listMode === 'ul') {
    output.push('</ul>')
  } else if (listMode === 'ol') {
    output.push('</ol>')
  }

  if (nextMode === 'ul') {
    output.push('<ul>')
  } else if (nextMode === 'ol') {
    output.push('<ol>')
  }

  return nextMode
}

export function renderMarkdown(markdown: string): string {
  const normalized = escapeHtml(markdown.replace(/\r\n/g, '\n'))
  const codeBlocks: string[] = []

  let prepared = normalized.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_raw, language, code) => {
    const lang = language ? ` class="language-${language}"` : ''
    const index = codeBlocks.push(`<pre><code${lang}>${code}</code></pre>`) - 1
    return `${CODE_TOKEN_PREFIX}${index}__`
  })

  const lines = prepared.split('\n')
  const output: string[] = []
  let listMode: 'none' | 'ul' | 'ol' = 'none'

  for (const line of lines) {
    const codeMatch = line.match(new RegExp(`^${CODE_TOKEN_PREFIX}(\\d+)__$`))
    if (codeMatch) {
      listMode = closeList(listMode, output, 'none')
      output.push(codeBlocks[Number(codeMatch[1])])
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      listMode = closeList(listMode, output, 'none')
      const level = headingMatch[1].length
      output.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`)
      continue
    }

    const bulletMatch = line.match(/^[-*]\s+(.*)$/)
    if (bulletMatch) {
      if (listMode !== 'ul') {
        listMode = closeList(listMode, output, 'ul')
      }
      output.push(`<li>${renderInline(bulletMatch[1])}</li>`)
      continue
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/)
    if (orderedMatch) {
      if (listMode !== 'ol') {
        listMode = closeList(listMode, output, 'ol')
      }
      output.push(`<li>${renderInline(orderedMatch[1])}</li>`)
      continue
    }

    const quoteMatch = line.match(/^&gt;\s?(.*)$/)
    if (quoteMatch) {
      listMode = closeList(listMode, output, 'none')
      output.push(`<blockquote>${renderInline(quoteMatch[1])}</blockquote>`)
      continue
    }

    if (!line.trim()) {
      listMode = closeList(listMode, output, 'none')
      continue
    }

    listMode = closeList(listMode, output, 'none')
    output.push(`<p>${renderInline(line)}</p>`)
  }

  closeList(listMode, output, 'none')
  prepared = output.join('\n')
  return prepared
}
