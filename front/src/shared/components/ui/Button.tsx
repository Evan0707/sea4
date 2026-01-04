import { type ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode;
  variant: 'Primary' | 'Secondary' | 'Destructive';
  classname?: string;
  onClick?: () => void;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
}

const Button = ({
  children,
  variant,
  classname,
  onClick,
  loading = false,
  type = 'button',
  disabled = false,
  size = 'md',
  icon: Icon,
}: ButtonProps) => {
  const base = `${classname ?? ''} flex items-center justify-center font-bold cursor-pointer transition-colors`;

  const sizeClasses =
    (size === 'sm' && 'py-1 px-2 text-sm min-w-[80px] rounded-[var(--radius-sm)]') ||
    (size === 'lg' && 'py-3 px-5 text-base min-w-[140px] rounded-[var(--radius-lg)]') ||
    'py-[8px] px-4 text-[14px] min-w-[100px] rounded-[var(--radius)]';

  const variants =
    (variant == 'Primary' && 'bg-primary border-[1.5px] border-[#341FCE] text-white hover:bg-[#281FD1]')
    || (variant == 'Secondary' && 'border-[1.5px] border-border bg-secondary text-text-primary hover:bg-border')
    || (variant == 'Destructive' && 'bg-red/8 text-red hover:bg-red/15')
    || '';
  const loadingStyles = loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : '';
  const handleClick = loading ? undefined : onClick;

  // CSS spinner
  const Spinner = () => (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
  );

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={loading || disabled}
      aria-busy={loading}
      className={`${variants} ${base} ${sizeClasses} ${loadingStyles} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <div className="inline-flex items-center gap-2">
        {loading ? <Spinner /> : (
          <>
            {Icon && <Icon className="w-4 h-4" />}
            {children}
          </>
        )}
      </div>
    </button>
  )
}

export default Button