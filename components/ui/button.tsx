import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

// Flat, Ondo-style buttons: black primary, grey secondary chips, hairline outline.
const buttonVariants = cva(
  'inline-flex items-center relative justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-[#313131]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border bg-card text-foreground hover:bg-muted',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-[#E6E6E6]',
        warning: 'bg-warning/15 text-warning-foreground hover:bg-warning/25',
        success: 'bg-success text-success-foreground hover:bg-success/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
        ghost: 'text-foreground hover:bg-muted',
        link: 'text-foreground underline-offset-4 hover:underline',
        gradient: 'bg-primary text-primary-foreground hover:bg-[#313131]',
        glass:
          'border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20',
        neon: 'border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base',
        xl: 'h-14 rounded-xl px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = '', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-inherit">
            <Loader className="size-4 animate-spin" />
          </div>
        )}
        <span className={isLoading ? 'invisible' : 'relative z-10'}>{props.children}</span>
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
