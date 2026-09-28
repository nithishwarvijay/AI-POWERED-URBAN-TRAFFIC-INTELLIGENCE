import { forwardRef, useId } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  className = '',
  id: providedId,
  type = 'text',
  ...props
}, ref) => {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger-600 dark:text-danger-400" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;