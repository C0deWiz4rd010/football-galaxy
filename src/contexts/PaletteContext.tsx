import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

export type PaletteId =
  | 'galaxy'
  | 'midnight'
  | 'aurora'
  | 'stadium'
  | 'crimson'
  | 'mono'

export interface PaletteMeta {
  id: PaletteId
  name: string
  description: string
  /** Representative swatch colours for the picker (light, dark). */
  swatch: { light: string; dark: string }
}

export const PALETTES: PaletteMeta[] = [
  {
    id: 'galaxy',
    name: 'Galaxy',
    description: 'Signature deep green & gold',
    swatch: { light: '#16633f', dark: '#f5c451' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Indigo & electric blue',
    swatch: { light: '#2b4bb0', dark: '#5b8cff' },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Teal & cyan glow',
    swatch: { light: '#159a96', dark: '#5eead4' },
  },
  {
    id: 'stadium',
    name: 'Stadium',
    description: 'Floodlit pitch green',
    swatch: { light: '#1c8043', dark: '#4ade80' },
  },
  {
    id: 'crimson',
    name: 'Crimson',
    description: 'Matchday red & burgundy',
    swatch: { light: '#bd1f43', dark: '#fb7185' },
  },
  {
    id: 'mono',
    name: 'Mono',
    description: 'Neutral high-contrast',
    swatch: { light: '#353b46', dark: '#e2e8f0' },
  },
]

const PALETTE_IDS = PALETTES.map((palette) => palette.id)
const STORAGE_KEY = 'fg-palette'
const DEFAULT_PALETTE: PaletteId = 'galaxy'

function isPaletteId(value: string | null): value is PaletteId {
  return value != null && (PALETTE_IDS as string[]).includes(value)
}

interface PaletteContextValue {
  palette: PaletteId
  setPalette: (palette: PaletteId) => void
  palettes: PaletteMeta[]
}

const PaletteContext = createContext<PaletteContextValue | undefined>(undefined)

export function PaletteProvider({ children }: PropsWithChildren) {
  const [palette, setPaletteState] = useState<PaletteId>(() => {
    if (typeof window === 'undefined') return DEFAULT_PALETTE
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isPaletteId(stored) ? stored : DEFAULT_PALETTE
  })

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-palette', palette)
    try {
      window.localStorage.setItem(STORAGE_KEY, palette)
    } catch {
      /* ignore storage failures (private mode) */
    }
  }, [palette])

  const setPalette = useCallback((next: PaletteId) => setPaletteState(next), [])

  const value = useMemo<PaletteContextValue>(
    () => ({ palette, setPalette, palettes: PALETTES }),
    [palette, setPalette],
  )

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
}

export function usePalette() {
  const context = useContext(PaletteContext)
  if (!context) {
    throw new Error('usePalette must be used within a PaletteProvider')
  }
  return context
}
