import { app } from 'electron'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type {
  TemplateListResult,
  TemplateSaveRequest,
  TemplateSaveResult,
  TemplateDeleteRequest,
  TemplateDeleteResult,
  UserTemplate
} from '../shared'

const TEMPLATE_DIR = join(app.getPath('userData'), 'templates')

async function ensureTemplateDir(): Promise<void> {
  try {
    await fs.mkdir(TEMPLATE_DIR, { recursive: true })
  } catch {
    // Ignore if directory already exists
  }
}

function generateTemplateId(): string {
  return `tpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

async function loadTemplateFromFile(filePath: string): Promise<UserTemplate | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const template = JSON.parse(content) as UserTemplate
    return template
  } catch {
    return null
  }
}

export async function listTemplates(): Promise<TemplateListResult> {
  try {
    await ensureTemplateDir()
    const files = await fs.readdir(TEMPLATE_DIR)
    const templates: UserTemplate[] = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = join(TEMPLATE_DIR, file)
        const template = await loadTemplateFromFile(filePath)
        if (template) {
          templates.push(template)
        }
      }
    }

    templates.sort((a, b) => b.updatedAt - a.updatedAt)
    return { templates }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to list templates'
    return { templates: [], error: errorMessage }
  }
}

export async function saveTemplate(request: TemplateSaveRequest): Promise<TemplateSaveResult> {
  try {
    await ensureTemplateDir()

    const id = generateTemplateId()
    const now = Date.now()

    const template: UserTemplate = {
      id,
      name: request.name.trim(),
      markdown: request.markdown,
      createdAt: now,
      updatedAt: now
    }

    const filePath = join(TEMPLATE_DIR, `${id}.json`)
    await fs.writeFile(filePath, JSON.stringify(template, null, 2), 'utf-8')

    return { id }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save template'
    return { id: null, error: errorMessage }
  }
}

export async function deleteTemplate(
  request: TemplateDeleteRequest
): Promise<TemplateDeleteResult> {
  try {
    await ensureTemplateDir()

    const filePath = join(TEMPLATE_DIR, `${request.id}.json`)
    await fs.unlink(filePath)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete template'
    return { success: false, error: errorMessage }
  }
}
