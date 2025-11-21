interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`rounded-lg bg-text-primary/20 animate-pulse ${className}`}></div>
  );
};

export default Skeleton;
