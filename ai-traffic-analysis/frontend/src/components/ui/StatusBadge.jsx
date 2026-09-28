/**
 * Professional Status Badge Component
 * For traffic levels, signal status, etc.
 */
export default function StatusBadge({ 
  status, 
  variant = 'default', // default | dot | pill
  size = 'md', // sm | md | lg
  className = '' 
}) {
  const variants = {
    // Traffic Density Levels
    Low: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      dot: 'bg-green-500',
    },
    Moderate: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      dot: 'bg-yellow-500',
    },
    High: {
      bg: 'bg-orange-50 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      dot: 'bg-orange-500',
    },
    Critical: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500',
    },
    // Signal Status
    Active: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      dot: 'bg-green-500',
    },
    Inactive: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      dot: 'bg-gray-500',
    },
    // Emergency Status
    Emergency: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500 animate-pulse',
    },
    // Alert Levels
    Info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      dot: 'bg-blue-500',
    },
    Warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      dot: 'bg-yellow-500',
    },
    Success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      dot: 'bg-green-500',
    },
    Danger: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500',
    },
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const colors = variants[status] || variants.Info;

  if (variant === 'dot') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className={`${dotSizes[size]} rounded-full ${colors.dot}`}></span>
        <span className={`${sizes[size].split(' ')[0]} font-medium ${colors.text}`}>
          {status}
        </span>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center ${sizes[size]} font-medium rounded-full ${colors.bg} ${colors.text} ${className}`}
      >
        <span className={`${dotSizes[size]} rounded-full ${colors.dot} mr-1.5`}></span>
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center ${sizes[size]} font-medium rounded-md border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      {status}
    </span>
  );
}
