interface QualificationTagProps {
  label: string;
  isValid: boolean;
}

const QualificationTag: React.FC<QualificationTagProps> = ({ label, isValid }) => {
  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
        isValid
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'bg-red-500/10 text-red-500 border-red-500/20'
      }`}
    >
      {label}
    </span>
  );
};

export default QualificationTag;
