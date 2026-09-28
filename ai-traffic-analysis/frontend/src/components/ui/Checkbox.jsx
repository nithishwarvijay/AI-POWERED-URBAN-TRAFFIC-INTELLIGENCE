import { forwardRef, useId } from 'react';

const Checkbox = forwardRef(({
  label,
  className = '',
  id: providedId,
  ...props
}, ref) => {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <div className="flex items-start gap-3">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 dark:border-gray-600 dark:bg-navy-800 dark:focus:ring-offset-navy-950"
        {...props}
      />
      {label && (
        <label htmlFor={id} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;