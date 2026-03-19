import * as React from "react";

import { cn } from "./utils";

function Button({ className, children, ...props }) {
  const hasChildren = React.Children.count(children) > 0;
  const content = hasChildren ? children : 'Log In';

  return (
    <button
      data-slot="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {content}
    </button>
  );
}

export { Button };