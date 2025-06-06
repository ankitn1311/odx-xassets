'use client';
import React, { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useDialogStore } from '@/stores/dialog-store';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[95vw]',
};

export const GlobalDialog = () => {
  const { isOpen, content, close } = useDialogStore();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !content?.preventClose) {
        close();
      }
    },
    [close, content?.preventClose]
  );

  if (!content) return null;

  const dialogSize = content.size || 'md';
  const maxWidthClass = content.maxWidth ? `max-w-[${content.maxWidth}]` : sizeClasses[dialogSize];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        preventClose={content.preventClose}
        className={cn(
          maxWidthClass,
          // Add height classes for full-screen variant
          dialogSize === 'full' && 'min-h-[95vh]'
        )}
      >
        <DialogHeader>
          <DialogTitle hidden={!content.title} className="text-center">
            {content.title}
          </DialogTitle>
          {content.message && <DialogDescription>{content.message}</DialogDescription>}
        </DialogHeader>

        {!content.preventClose && (
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        )}
        {content.component}
      </DialogContent>
    </Dialog>
  );
};
