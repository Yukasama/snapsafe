import { useEffect } from "react";

export function useMessagePolling(fetchMessages: () => void) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [fetchMessages]);
}
