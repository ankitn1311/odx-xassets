import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center relative justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 group overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-primary/70 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%]',
        destructive:
          'bg-gradient-to-r from-destructive via-destructive/90 to-destructive/80 text-destructive-foreground shadow-lg hover:shadow-xl hover:from-destructive/90 hover:to-destructive/70 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%]',
        outline:
          'border border-input bg-transparent shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-lg transition-all duration-300 relative overflow-hidden before:absolute before:inset-0 before:bg-primary before:scale-x-0 before:origin-left before:transition-transform before:duration-300 hover:before:scale-x-100 before:-z-10',
        secondary:
          'bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 text-secondary-foreground shadow-lg hover:shadow-xl hover:from-secondary/90 hover:to-secondary/70 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%]',
        warning:
          'bg-gradient-to-r from-warning via-warning/90 to-warning/80 text-warning-foreground shadow-lg hover:shadow-xl hover:from-warning/90 hover:to-warning/70 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%]',
        success:
          'bg-gradient-to-r from-success via-success/90 to-success/80 text-success-foreground shadow-lg hover:shadow-xl hover:from-success/90 hover:to-success/70 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%]',
        accent:
          'bg-gradient-to-r from-accent via-accent/90 to-accent/80 text-accent-foreground shadow-lg hover:shadow-xl hover:from-accent/90 hover:to-accent/70 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%]',
        ghost:
          'hover:bg-secondary hover:text-secondary-foreground hover:shadow-md transition-all duration-300',
        link: 'text-primary underline-offset-4 hover:underline transition-all duration-300',
        gradient:
          'bg-gradient-to-r from-primary via-accent to-warning text-white shadow-lg hover:shadow-xl hover:from-primary/90 hover:via-accent/90 hover:to-warning/90 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%]',
        glass:
          'bg-white/10 backdrop-blur-md border border-white/20 text-foreground shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300',
        neon: 'bg-transparent border-2 border-primary text-primary shadow-lg hover:shadow-primary/50 hover:shadow-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 relative overflow-hidden before:absolute before:inset-0 before:bg-primary before:scale-x-0 before:origin-left before:transition-transform before:duration-300 hover:before:scale-x-100 before:-z-10',
      },
      size: {
        default: 'h-10 px-6 py-2.5',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-10 text-base',
        xl: 'h-14 rounded-xl px-12 text-lg',
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
  isLoading?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = '', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-md bg-inherit">
            <Loader className="size-4 animate-spin" />
            <span className="text-sm">{isLoading}</span>
          </div>
        )}
        <span className={isLoading ? 'invisible' : 'relative z-10'}>{props.children}</span>
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
