import { SplitSquareHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function CompareButton({ playerId }: { playerId: string }) {
  return (
    <Button asChild variant="outline" className="fab fixed bottom-20 right-5 z-40 h-14 w-14 rounded-full p-0 md:static md:h-10 md:w-auto md:px-4">
      <Link to={`/compare?p1=${playerId}`} aria-label="Compare player">
        <SplitSquareHorizontal className="h-5 w-5" />
        <span className="hidden md:inline">Compare</span>
      </Link>
    </Button>
  )
}
