import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'
import { X } from 'lucide-react'

import { useOptionalLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogPortal = DialogPrimitive.Portal

/**
 * Centred dialog that never outgrows the viewport: capped at 90dvh with its
 * own scroll, nearly full-width on phones, 44px close target.
 */
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => {
  const closeLabel = useOptionalLocale()?.t('close') ?? 'Close'
  return (
    <DialogPortal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-background/80 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-modal grid max-h-[90dvh] w-[calc(100%-1rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto overscroll-contain rounded-lg border bg-background p-6 shadow-fg-5 duration-200 sm:w-[calc(100%-2rem)]',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <X className="h-4 w-4" aria-hidden />
          <span className="sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description
