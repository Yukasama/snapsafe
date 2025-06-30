import { useEffect } from "react";

export function useMessagePolling(fetchMessages: () => void) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [fetchMessages]);
}
