import { ReactNode } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

export function Field({ label, hint, required, children }: FieldProps) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {required ? <span className="text-rose-500">*</span> : null}
      </div>
      {children}
      {hint ? <div className="mt-2 text-xs leading-5 text-slate-500">{hint}</div> : null}
    </label>
  );
}
