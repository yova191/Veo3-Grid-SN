
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        <input 58c996c49c45652a3c521ccfbe57829f10247336
          type={type}
          className={`w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2 ${icon ? 'pl-10' : 'px-3'} ${className}`}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';bocina de Android 
