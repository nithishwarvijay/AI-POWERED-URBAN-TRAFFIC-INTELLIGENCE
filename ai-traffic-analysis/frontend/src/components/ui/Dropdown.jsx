import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

const Dropdown = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (triggerRef.current && !triggerRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item, event) => {
    if (item.onClick) {
      item.onClick(event);
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div ref={triggerRef} className="relative inline-block">
        {typeof trigger === 'function' ? trigger({ onClick: () => setIsOpen(true), isOpen }) : trigger}
      </div>
    );
  }

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={`dropdown ${align === 'right' ? 'right-0' : 'left-0'} ${className}`}
      role="menu"
    >
      {items.map((item, index) => (
        item.type === 'divider' ? (
          <div key={`divider-${index}`} className="border-t border-gray-200 dark:border-gray-700 my-1" />
        ) : (
          <button
            key={item.key || index}
            onClick={(e) => handleItemClick(item, e)}
            className={`dropdown-item ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${item.variant === 'danger' ? 'text-danger-600 dark:text-danger-400' : ''}`}
            disabled={item.disabled}
            role="menuitem"
          >
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && <span className="text-xs text-gray-400">{item.shortcut}</span>}
            {item.selected && <Check size={16} className="text-primary-600" />}
          </button>
        )
      ))}
    </div>
  );

  return (
    <div ref={triggerRef} className="relative inline-block">
      {typeof trigger === 'function' ? trigger({ onClick: () => setIsOpen(true), isOpen }) : trigger}
      {createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default Dropdown;