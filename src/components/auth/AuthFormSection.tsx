import type { LucideIcon } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: LucideIcon;
  labelExtra?: ReactNode;
}

export function AuthField({ id, label, icon: Icon, labelExtra, className = '', ...inputProps }: AuthFieldProps) {
  return (
    <div className="auth-field-group">
      <div className="auth-field-label-row">
        <label htmlFor={id} className="auth-field-label">
          {label}
        </label>
        {labelExtra}
      </div>
      <div className="auth-field-control">
        <Icon className="auth-field-icon" aria-hidden />
        <input id={id} className={`auth-field-input auth-field-input-with-icon ${className}`} {...inputProps} />
      </div>
    </div>
  );
}

interface AuthPlainFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  labelExtra?: ReactNode;
  /** Visible label; omit to use placeholder-only fields like the centered auth layout. */
  label?: string;
}

export function AuthPlainField({
  id,
  label,
  labelExtra,
  className = '',
  ...inputProps
}: AuthPlainFieldProps) {
  return (
    <div className="auth-plain-field">
      {label ? (
        <div className="auth-field-label-row">
          <label htmlFor={id} className="auth-plain-label">
            {label}
          </label>
          {labelExtra}
        </div>
      ) : null}
      <input id={id} className={`auth-plain-input ${className}`} {...inputProps} />
    </div>
  );
}
