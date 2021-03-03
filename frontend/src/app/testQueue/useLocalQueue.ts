import { useEffect, useState } from "react";
import { QueueItemData } from "./TestQueue";

export function useLocalQueue(
  remoteQueue: QueueItemData[],
  refreshTime: number
) {
  const [localQueue, setLocalQueue] = useState<QueueItemData[]>();
  const [toRemove, setToRemove] = useState(new Set<string>());

  useEffect(() => {
    if (!remoteQueue) {
      return;
    }
    // Immediately set local queue if nonexistent
    if (localQueue === undefined) {
      setLocalQueue(remoteQueue);
      return;
    }
    // Get discrepancies
    const newIds = new Set(
      remoteQueue.map(({ internalId }: QueueItemData) => internalId)
    );
    const removed = localQueue
      .filter(({ internalId }) => !newIds.has(internalId))
      .map(({ internalId }) => internalId);
    setToRemove(new Set(removed));

    // Only requires animation on remove
    if (removed.length === 0) {
      setLocalQueue(remoteQueue);
      return;
    }
    // Catch local queue up after small delay
    const timeout = setTimeout(() => {
      setToRemove(new Set());
      setLocalQueue(remoteQueue);
    }, refreshTime);
    // cleanup the timeout on unmount
    return () => {
      clearTimeout(timeout);
    };
  }, [remoteQueue, localQueue, refreshTime]);

  return { localQueue, toRemove, setToRemove };
}
