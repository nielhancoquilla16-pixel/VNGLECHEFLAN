// simple className combiner used across UI components
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
