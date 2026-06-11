/**
 * Shared Tailwind class strings for auth forms.
 * Single source so inputs and buttons stay identical across views.
 */
export const inputClass =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint transition hover:border-faint focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-ink/10";

export const labelClass = "text-[13px] font-semibold text-ink";

export const primaryButtonClass =
  "mt-1 w-full cursor-pointer rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-progress disabled:opacity-55";

export const errorClass =
  "rounded-lg border border-danger-line bg-danger-soft px-3.5 py-2.5 text-sm text-danger";

export const linkClass =
  "text-ink underline decoration-faint underline-offset-2 hover:decoration-ink";
