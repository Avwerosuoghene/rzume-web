import { StatHighlight } from '../models/interface/dashboard.models';

type AnimatableStat = StatHighlight & { displayValue?: number };

export function animateCountUp(
  stat: AnimatableStat,
  startValue: number,
  duration: number,
  onUpdate: () => void
): () => void { 
  let startTime: number | null = null;
  let animationFrameId: number;

  const step = (timestamp: number) => {
    if (!startTime) {
      startTime = timestamp;
    }

    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    const endValue = stat.value;
    stat.displayValue = Math.round(startValue + (endValue - startValue) * easedProgress);
    onUpdate();

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      stat.displayValue = stat.value;
      onUpdate();
    }
  };

  animationFrameId = requestAnimationFrame(step);

  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}
