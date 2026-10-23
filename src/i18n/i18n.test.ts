import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { de, type MessageKey } from './de'
import { en } from './en'

/** Keys built at runtime (`t(\`result${result}\`)`), so no literal reference exists. */
const DYNAMIC_PREFIXES = ['result']

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'i18n' ? [] : sourceFiles(path)
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()

describe('message catalogs', () => {
  const keys = Object.keys(de) as MessageKey[]

  it('has no empty strings and the same placeholders in both languages', () => {
    for (const key of keys) {
      expect(de[key].trim(), key).not.toBe('')
      expect(en[key].trim(), key).not.toBe('')
      expect(placeholders(en[key]), key).toEqual(placeholders(de[key]))
    }
  })

  it('only contains keys the app uses', () => {
    const corpus = sourceFiles(join(process.cwd(), 'src'))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n')
    const unused = keys.filter(
      (key) => !DYNAMIC_PREFIXES.some((prefix) => key.startsWith(prefix)) && !new RegExp(`['"\`]${key}['"\`]`).test(corpus),
    )
    expect(unused).toEqual([])
  })
})
