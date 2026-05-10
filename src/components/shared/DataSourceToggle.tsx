import { RadioTower } from 'lucide-react'

export function DataSourceToggle() {
  return (
    <div className="app-pill hidden items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground xl:flex">
      <RadioTower className="h-3.5 w-3.5" />
      <span className="font-medium text-foreground">Live 2025/26</span>
    </div>
  )
}
