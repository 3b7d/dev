import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyanx disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        premium:
          "min-h-12 border border-cyanx/30 bg-gradient-to-l from-electric to-cyanx px-5 text-white shadow-glow hover:-translate-y-0.5 hover:brightness-110",
        soft:
          "min-h-11 border border-border bg-slate-950/40 px-4 text-muted hover:-translate-y-0.5 hover:border-cyanx/35 hover:text-foreground",
        ghost: "min-h-10 px-3 text-muted hover:bg-white/5 hover:text-foreground",
      },
      size: {
        default: "",
        icon: "h-12 w-12 px-0",
      },
    },
    defaultVariants: {
      variant: "soft",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
