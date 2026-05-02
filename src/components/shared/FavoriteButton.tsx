import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FavoriteButton({ active, label, onToggle }: { active: boolean; label: string; onToggle: () => void }) {
  return (
    <motion.div animate={active ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 16 }}>
      <Button variant="ghost" size="icon" aria-label={label} onClick={onToggle}>
        <Star className={cn('h-5 w-5', active ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
      </Button>
    </motion.div>
  )
}
