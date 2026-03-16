// simple className combiner used across UI components
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
