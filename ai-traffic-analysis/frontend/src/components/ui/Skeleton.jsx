const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`skeleton ${className}`}
      {...props}
    />
  );
};

const SkeletonText = ({ lines = 3, className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4 rounded" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
};

const SkeletonCard = ({ className = '', ...props }) => {
  return (
    <div className={`card p-6 space-y-4 ${className}`} {...props}>
      <div className="flex items-center justify-between">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
      <div className="skeleton h-8 w-24 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
    </div>
  );
};

const SkeletonTable = ({ rows = 5, columns = 4, className = '', ...props }) => {
  return (
    <div className={`table-container ${className}`} {...props}>
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="skeleton h-4 w-20 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div className="skeleton h-4 w-24 rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SkeletonKPICard = ({ className = '', ...props }) => {
  return (
    <div className={`card p-6 ${className}`} {...props}>
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-24 rounded" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
      <div className="skeleton h-10 w-20 rounded mt-2" />
      <div className="skeleton h-4 w-16 rounded mt-1" />
    </div>
  );
};

const SkeletonChart = ({ className = '', height = 256, ...props }) => {
  return (
    <div className={className} {...props}>
      <div className="skeleton w-full rounded-lg" style={{ height }} />
    </div>
  );
};

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonKPICard, SkeletonChart };