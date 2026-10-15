import type { ActivityReview } from '../types';
import { STORAGE_KEYS } from '../utils/storage';
import { usePersistentState } from './usePersistentState';

function parseReviews(raw: unknown): ActivityReview[] | undefined {
  return Array.isArray(raw) ? (raw as ActivityReview[]) : undefined;
}

export function useReviews() {
  const [reviews, setReviews] = usePersistentState<
    ActivityReview[]
  >(STORAGE_KEYS.reviews, () => [], parseReviews);

  function saveReview(review: ActivityReview) {
    setReviews((current) =>
      current.some((item) => item.activityId === review.activityId)
        ? current.map((item) =>
            item.activityId === review.activityId ? review : item,
          )
        : [...current, review],
    );
  }

  function removeReview(activityId: string) {
    setReviews((current) =>
      current.filter((review) => review.activityId !== activityId),
    );
  }

  return {
    reviews,
    saveReview,
    removeReview,
  };
}
