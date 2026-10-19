import { cn } from "@/lib/utils";

type RutaCoMarkProps = {
  className?: string;
  title?: string;
};

/** Inline brand mark — route arc between two hubs (matches favicon). */
export function RutaCoMark({ className, title = "RutaCO" }: RutaCoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={cn("size-9 shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <rect width="32" height="32" rx="8" className="fill-emerald-600" />
      <path
        d="M7 17.5c4.2-1.2 8.6-2.2 13.2-2.6l3.8-5.2c.35-.48 1.05-.35 1.2.22l.9 3.4c.12.45-.2.9-.66.98l-3.35.55c-3.9.65-7.55 1.85-10.9 3.5l-3.05 1.5c-.55.27-1.15-.2-1-.8l.86-1.95z"
        fill="#fff"
      />
      <circle cx="10.5" cy="21.5" r="1.6" fill="#A7F3D0" />
      <circle cx="22.5" cy="12.5" r="1.6" fill="#A7F3D0" />
      <path
        d="M10.5 21.5c3.2-2.4 7.1-4.3 12-5.5"
        stroke="#A7F3D0"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="1.5 2.2"
      />
    </svg>
  );
}
