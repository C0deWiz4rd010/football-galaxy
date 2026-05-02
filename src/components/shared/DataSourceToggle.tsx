import { motion } from 'framer-motion'
import { useDataSource } from '@/contexts/DataSourceContext'
import { Button } from '@/components/ui/button'

export function DataSourceToggle() {
  const { source, season, availableSeasons, setSource, setSeason } = useDataSource()
  return (
    <div className="flex items-center gap-2">
      <div className="grid grid-cols-2 rounded-md border bg-muted p-1">
        {(['live', 'historical'] as const).map((item) => (
          <Button key={item} type="button" size="sm" variant={source === item ? 'default' : 'ghost'} onClick={() => setSource(item)} className="h-8 capitalize">
            {item === 'live' ? 'Live' : 'Historical'}
          </Button>
        ))}
      </div>
      {source === 'historical' ? (
        <motion.select
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          className="h-9 rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={season}
          onChange={(event) => setSeason(event.target.value)}
          aria-label="Historical season"
        >
          {availableSeasons.filter((item) => item !== '2024-25').map((item) => <option key={item}>{item}</option>)}
        </motion.select>
      ) : null}
    </div>
  )
}
