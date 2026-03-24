import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { User } from '@mynaui/icons-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
 src?: string;
 alt?: string;
 fallback?: string;
 size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
 ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
   sm: 'h-8 w-8 text-xs',
   md: 'h-10 w-10 text-sm',
   lg: 'h-14 w-14 text-base',
   xl: 'h-24 w-24 text-2xl',
  };

  const fallbackName = fallback || alt;
  const computedSrc = src || (fallbackName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random` : undefined);

  return (
   <div
    ref={ref}
    className={cn(
     'relative flex shrink-0 overflow-hidden rounded-full bg-primary/10 text-primary',
     sizeClasses[size],
     className
    )}
    {...props}
   >
    {computedSrc && !hasError ? (
     <img
      src={computedSrc}
      alt={alt || 'Avatar'}
      className="aspect-square h-full w-full object-cover"
      onError={() => setHasError(true)}
     />
    ) : (
     <div className="flex h-full w-full items-center justify-center font-medium">
      <User className="h-1/2 w-1/2 opacity-50" />
     </div>
    )}
   </div>
  );
 }
);
Avatar.displayName = 'Avatar';

export { Avatar };
