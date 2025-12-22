const SaveMyExamsLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* SaveMyExams blue arrow logo */}
      <circle cx="50" cy="50" r="48" fill="#0066CC" />
      <path
        d="M30 50L50 30L70 50M50 30V70"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SaveMyExamsLogo;
