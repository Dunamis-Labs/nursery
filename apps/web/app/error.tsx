'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DEBUG] error.tsx Error component rendered', JSON.stringify({message:error?.message,digest:error?.digest}));
  }, [error]);

  // #region agent log
  console.error('[DEBUG] error.tsx Error component rendering', JSON.stringify({errorMessage:error?.message}));
  // #endregion

  // Simplified error component - removed Button import to test
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground">{String(error?.message || 'An unexpected error occurred')}</p>
      <button onClick={reset} className="px-4 py-2 bg-blue-500 text-white rounded">Try again</button>
    </div>
  );
}

