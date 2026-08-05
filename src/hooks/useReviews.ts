import { useState } from 'react';
import type { ActivityReview } from '../types';

const REVIEWS_KEY = 'p26-activity-reviews';

function readReviews(): ActivityReview[] {
  try {
    const savedValue = localStorage.getItem(REVIEWS_KEY);

    if (!savedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    return Array.isArray(parsedValue)
      ? (parsedValue as ActivityReview[])
      : [];
  } catch {
    return [];
  }
}

export function useReviews() {
  const [reviews, setReviews] =
    useState<ActivityReview[]>(readReviews);

  function saveReviews(updatedReviews: ActivityReview[]) {
    setReviews(updatedReviews);

    localStorage.setItem(
      REVIEWS_KEY,
      JSON.stringify(updatedReviews),
    );
  }

  function saveReview(review: ActivityReview) {
    const existingIndex = reviews.findIndex(
      (item) => item.activityId === review.activityId,
    );

    if (existingIndex === -1) {
      saveReviews([...reviews, review]);
      return;
    }

    const updatedReviews = reviews.map((item) =>
      item.activityId === review.activityId
        ? review
        : item,
    );

    saveReviews(updatedReviews);
  }

  function removeReview(activityId: string) {
    const updatedReviews = reviews.filter(
      (review) => review.activityId !== activityId,
    );

    saveReviews(updatedReviews);
  }

  function getReview(activityId: string) {
    return reviews.find(
      (review) => review.activityId === activityId,
    );
  }

  return {
    reviews,
    saveReview,
    removeReview,
    getReview,
  };
}