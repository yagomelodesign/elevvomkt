import { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm
      border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition ${className}`}
      {...props}
    />
  );
}
