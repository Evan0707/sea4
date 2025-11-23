import { type ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode;
  variant: 'Primary' | 'Secondary' | 'Destructive';
  classname?: string;
  onClick?: () => void;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({
  children,
  variant,
  classname,
  onClick,
  loading = false,
  type = 'button',
}: ButtonProps) => {
  const base = `${classname ?? ''} flex items-center justify-center py-[8px] font-bold min-w-[100px] rounded-[6px] text-[14] cursor-pointer transition-colors`;
  const variants =
    (variant=='Primary' && 'bg-primary border-[1.5px] border-[#341FCE] text-white h-[42px] hover:bg-[#281FD1]')
    || (variant=='Secondary' && 'border-[1.5px] border-border bg-secondary text-text-primary h-[42px] hover:bg-border')
    || (variant=='Destructive' && 'bg-red/8 text-red h-[42px] hover:bg-red/15')
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
          disabled={loading}
          aria-busy={loading}
          className={`${variants} ${base} ${loadingStyles}`}
        >
          <div className="inline-flex items-center gap-2">
            {loading ? <Spinner /> : children}
          </div>
        </button>
  )
}

export default Button