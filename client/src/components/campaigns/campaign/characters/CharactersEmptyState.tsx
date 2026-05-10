type CharactersEmptyStateProps = {
  message: string;
};

function CharactersEmptyState({ message }: CharactersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 text-gray-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10 mb-3 text-gray-600"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 11h-6" />
        <path d="M19 8v6" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default CharactersEmptyState;
