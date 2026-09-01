import { useEffect } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';

export const useAuctionTimer = () => {
  const isTimerRunning = useAuctionStore((s) => s.isTimerRunning);
  const status = useAuctionStore((s) => s.status);
  const tickTimer = useAuctionStore((s) => s.tickTimer);

  useEffect(() => {
    if (!isTimerRunning || status !== 'LIVE') return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, status, tickTimer]);
};
