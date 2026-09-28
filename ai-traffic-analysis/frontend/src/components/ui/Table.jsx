import { forwardRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const Table = forwardRef(({
  columns = [],
  data = [],
  keyField = 'id',
  sortable = true,
  onRowClick,
  className = '',
  emptyMessage = 'No data available',
  loading = false,
  ...props
}, ref) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, sortable]);

  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown className="w-4 h-4 text-gray-300" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary-600" />
    );
  };

  return (
    <div ref={ref} className={`table-container ${className}`} {...props}>
      {loading ? (
        <div className="p-8 text-center">
          <div className="skeleton h-8 w-32 mx-auto mb-4 rounded" />
          <div className="skeleton h-8 w-48 mx-auto mb-4 rounded" />
          <div className="skeleton h-8 w-40 mx-auto rounded" />
        </div>
      ) : sortedData.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <table className="table" role="grid">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={column.className}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {sortable && column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-navy-700 rounded"
                        aria-label={`Sort by ${column.header}`}
                      >
                        {renderSortIcon(column.key)}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
});

Table.displayName = 'Table';
export default Table;