import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

/**
 * Professional KPI Card Component
 * Displays metrics with trend indicators
 */
export default function KPICard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend = null, // { value: 5, direction: 'up' | 'down' | 'neutral' }
  subtitle = '',
  color = 'blue', // blue | cyan | green | orange | red
  loading = false,
  className = '',
}) {
  const colorClasses = {
    blue: {
      icon: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      trend: {
        up: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
        down: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
        neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
      },
    },
    cyan: {
      icon: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
      trend: {
        up: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
        down: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
        neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
      },
    },
    green: {
      icon: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      trend: {
        up: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
        down: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
        neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
      },
    },
    orange: {
      icon: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      trend: {
        up: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
        down: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
        neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
      },
    },
    red: {
      icon: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      trend: {
        up: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
        down: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
        neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
      },
    },
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up':
        return <ArrowUp className="w-3 h-3" />;
      case 'down':
        return <ArrowDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-24"></div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-navy-700 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-navy-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-navy-700 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-700 p-6 hover:shadow-md dark:hover:shadow-navy-950/50 transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colorClasses[color].icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
          {unit && (
            <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {trend && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              colorClasses[color].trend[trend.direction]
            }`}
          >
            {getTrendIcon(trend.direction)}
            <span>{trend.value}%</span>
          </div>
        )}
        {subtitle && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
