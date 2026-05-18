import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("badge", {
  variants: {
    tone: {
      cyan: "border-cyanx/30 bg-cyanx/10 text-cyan-100",
      blue: "border-electric/30 bg-electric/10 text-blue-100",
      green: "border-success/30 bg-success/10 text-emerald-100",
      amber: "border-amber-400/30 bg-amber-400/10 text-amber-100",
      red: "border-red-400/30 bg-red-500/10 text-red-100",
      muted: "border-border bg-white/5 text-muted",
    },
  },
  defaultVariants: {
    tone: "muted",
  },
});

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
