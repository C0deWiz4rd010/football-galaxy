import { GalaxyMapPage } from './GalaxyMapPage'
import { GalaxyProvider } from './context'

/** Route entry: the Galaxy progress state only loads with the Galaxy page. */
export default function GalaxyRoute() {
  return (
    <GalaxyProvider>
      <GalaxyMapPage />
    </GalaxyProvider>
  )
}
