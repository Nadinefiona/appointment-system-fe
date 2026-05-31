"use client";

import { mergeRefs } from "@/lib/utils";
import { clsx } from "clsx";
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Show eye icon to toggle visibility (for password fields). */
  showPasswordToggle?: boolean;
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    className,
    id,
    type,
    showPasswordToggle = false,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? (label ? `${autoId}-field` : undefined);
  const [visible, setVisible] = useState(false);
  const isPasswordField = type === "password" || showPasswordToggle;
  const resolvedType =
    isPasswordField && showPasswordToggle
      ? visible
        ? "text"
        : "password"
      : type;

  const inputClassName = clsx(
    "w-full border-0 border-b border-stone-300 bg-transparent px-0 py-2.5 text-stone-900 placeholder:text-stone-400 transition-colors",
    "focus:border-brand-600 focus:outline-none focus:ring-0",
    error && "border-red-500 focus:border-red-500",
    showPasswordToggle && "pr-10",
    className,
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-stone-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          id={inputId}
          ref={mergeRefs(ref)}
          type={resolvedType}
          className={inputClassName}
        />
        {isPasswordField && showPasswordToggle && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setVisible((v) => !v);
            }}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded p-1.5 text-stone-500 hover:text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});
