import { clsx } from "clsx";

const styles: Record<string, string> = {
  booked: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-stone-100 text-stone-600",
  completed: "bg-sky-100 text-sky-800",
};

export function Badge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? "bg-stone-100 text-stone-700",
        className,
      )}
    >
      {status}
    </span>
  );
}
