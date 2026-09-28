const Badge = ({
  children,
  variant = 'neutral',
  className = '',
  dot = false,
  dotColor,
  ...props
}) => {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral',
  };

  return (
    <span className={`${variants[variant]} ${className}`} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor || ''}`} />}
      {children}
    </span>
  );
};

export default Badge;