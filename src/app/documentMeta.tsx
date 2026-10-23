import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'

const SITE_NAME = 'Football Galaxy'

const EntityTitleContext = createContext<(title: string | undefined) => void>(() => {})

/**
 * Sets `document.title` ("Erling Haaland · Player profile · Football Galaxy")
 * and the meta description for the current route. Detail pages contribute
 * the entity name through `useEntityTitle`.
 */
export function DocumentMeta({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const [entity, setEntity] = useState<string>()

  useEffect(() => {
    document.title = [entity, title, SITE_NAME].filter((part, index, parts) => part && parts.indexOf(part) === index).join(' · ')
  }, [entity, title])

  useEffect(() => {
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.name = 'description'
      document.head.appendChild(tag)
    }
    tag.content = description
  }, [description])

  const setter = useMemo(() => setEntity, [])
  return <EntityTitleContext.Provider value={setter}>{children}</EntityTitleContext.Provider>
}

/** A detail page's subject (team, player, match) in the browser tab; cleared when the page unmounts. */
export function useEntityTitle(title: string | undefined) {
  const setEntity = useContext(EntityTitleContext)
  useEffect(() => {
    setEntity(title)
    return () => setEntity(undefined)
  }, [setEntity, title])
}
