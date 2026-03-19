/* eslint-disable react-refresh/only-export-components */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "./utils";

const badgeVariantClasses = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-input bg-background text-foreground",
};

function Badge({ className, variant = "default", asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1",
        badgeVariantClasses[variant] ?? badgeVariantClasses.default,
        className,
      )}
      {...props}
    />
  );
}

export { Badge };