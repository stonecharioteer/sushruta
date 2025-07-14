import React, { useState, useRef } from 'react';
import { cn } from '@/utils/cn';

interface DateInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  value = '',
  onChange,
  placeholder = 'YYYY-MM-DD',
  disabled = false,
  required = false,
  name,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format as YYYY-MM-DD
    if (inputValue.length >= 4) {
      inputValue = inputValue.slice(0, 4) + '-' + inputValue.slice(4);
    }
    if (inputValue.length >= 7) {
      inputValue = inputValue.slice(0, 7) + '-' + inputValue.slice(7, 9);
    }
    if (inputValue.length > 10) {
      inputValue = inputValue.slice(0, 10);
    }

    // Create a synthetic event with the formatted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: inputValue,
        name: name || e.target.name,
      }
    };

    onChange?.(syntheticEvent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter, and arrow keys
    if ([8, 9, 27, 13, 37, 38, 39, 40, 46].includes(e.keyCode)) {
      return;
    }
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if (e.ctrlKey && [65, 67, 86, 88, 90].includes(e.keyCode)) {
      return;
    }
    // Only allow numbers
    if (e.keyCode < 48 || e.keyCode > 57) {
      e.preventDefault();
    }
  };

  // Removed unused isValidDate function

  const displayValue = value;
  const showPlaceholder = !focused && !value;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={showPlaceholder ? placeholder : ''}
          disabled={disabled}
          maxLength={10}
          className={cn(
            'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors',
            'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
            'placeholder:text-gray-400',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            disabled && 'cursor-not-allowed bg-gray-50 text-gray-500',
            className
          )}
          {...props}
        />
        {!focused && !value && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <span className="text-xs text-gray-400">YYYY-MM-DD</span>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
      {!helperText && !error && (
        <p className="text-xs text-gray-400">Format: YYYY-MM-DD (e.g., 2023-12-25)</p>
      )}
    </div>
  );
};

export default DateInput;