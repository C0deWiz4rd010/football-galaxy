import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'

export function BackButton() {
  const navigate = useNavigate()
  const { t } = useLocale()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-fit"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="h-4 w-4" />
      {t('back')}
    </Button>
  )
}
