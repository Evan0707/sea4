import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
 checked?: boolean;
 onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
 ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  return (
   <label
    className={cn(
     'relative inline-flex cursor-pointer items-center',
     disabled && 'cursor-not-allowed opacity-50',
     className
    )}
   >
    <input
     type="checkbox"
     className="peer sr-only"
     checked={checked}
     onChange={(e) => onCheckedChange?.(e.target.checked)}
     disabled={disabled}
     ref={ref}
     {...props}
    />
    <div
     className={cn(
      "h-6 w-11 rounded-full border-2 border-transparent bg-border/50 transition-colors duration-200 ease-in-out",
      "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-primary",
      "peer-checked:bg-primary"
     )}
    >
     <div
      className={cn(
       "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
       checked ? "translate-x-5" : "translate-x-0"
      )}
     />
    </div>
   </label>
  );
 }
);
Switch.displayName = 'Switch';

export { Switch };
