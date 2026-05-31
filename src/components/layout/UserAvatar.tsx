import { clsx } from "clsx";

/** Shared default avatar for every user (no custom photos). */
export function UserAvatar({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-16 w-16" : "h-10 w-10";
  const iconClass =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 ring-2 ring-white",
        sizeClass,
        className,
      )}
      aria-hidden
    >
      <svg
        className={iconClass}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </span>
  );
}
