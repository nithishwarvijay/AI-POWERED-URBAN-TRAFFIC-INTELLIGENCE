import { forwardRef } from 'react';

const Card = forwardRef(({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`card ${hover ? 'card-hover' : ''} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <h3 ref={ref} className={`text-lg font-semibold text-navy-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <p ref={ref} className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };