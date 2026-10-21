import { PageReplacementResult, PageReplacementStep } from '../types';

/**
 * Simulates FIFO (First-In, First-Out) Page Replacement Algorithm
 * @param referenceString Array of referenced page numbers
 * @param frameCount Number of physical memory frames available
 */
export function simulateFifoPageReplacement(
  referenceString: number[],
  frameCount: number
): PageReplacementResult {
  if (referenceString.length === 0 || frameCount <= 0) {
    return {
      steps: [],
      referenceString: [],
      frameCount: Math.max(1, frameCount),
      totalHits: 0,
      totalFaults: 0,
      hitRatio: 0,
      faultRatio: 0,
    };
  }

  const frames: (number | null)[] = new Array(frameCount).fill(null);
  const fifoQueue: number[] = []; // Tracks index of oldest frame or frame slot insertion order
  const steps: PageReplacementStep[] = [];

  let totalHits = 0;
  let totalFaults = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const hitIndex = frames.indexOf(page);

    if (hitIndex !== -1) {
      // PAGE HIT
      totalHits++;
      steps.push({
        step: i + 1,
        page,
        frames: [...frames],
        isHit: true,
        evictedPage: null,
        explanation: `Page ${page} is already present in Frame ${hitIndex + 1} (Cache HIT). No page fault occurs.`,
      });
    } else {
      // PAGE FAULT
      totalFaults++;
      const emptySlot = frames.indexOf(null);

      if (emptySlot !== -1) {
        // Empty frame available
        frames[emptySlot] = page;
        fifoQueue.push(emptySlot);
        steps.push({
          step: i + 1,
          page,
          frames: [...frames],
          isHit: false,
          evictedPage: null,
          explanation: `Page ${page} caused a PAGE FAULT. Loaded into empty Frame ${emptySlot + 1}.`,
        });
      } else {
        // All frames full: Replace oldest entered frame according to FIFO
        const oldestSlot = fifoQueue.shift()!;
        const evicted = frames[oldestSlot];
        frames[oldestSlot] = page;
        fifoQueue.push(oldestSlot);

        steps.push({
          step: i + 1,
          page,
          frames: [...frames],
          isHit: false,
          evictedPage: evicted,
          explanation: `Page ${page} caused a PAGE FAULT. Frames full. Evicted oldest Page ${evicted} from Frame ${oldestSlot + 1} using FIFO replacement.`,
        });
      }
    }
  }

  const total = referenceString.length;
  const hitRatio = Number(((totalHits / total) * 100).toFixed(2));
  const faultRatio = Number(((totalFaults / total) * 100).toFixed(2));

  return {
    steps,
    referenceString,
    frameCount,
    totalHits,
    totalFaults,
    hitRatio,
    faultRatio,
  };
}
