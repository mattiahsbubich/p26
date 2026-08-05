import { useState } from 'react';
import { defaultActivities } from '../data/activities';
import type { Activity } from '../types';

const CUSTOM_ACTIVITIES_KEY = 'p26-custom-activities';
const COMPLETED_ACTIVITIES_KEY = 'p26-completed-activities';

function readCustomActivities(): Activity[] {
  try {
    const value = localStorage.getItem(CUSTOM_ACTIVITIES_KEY);

    if (!value) {
      return [];
    }

    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed) ? (parsed as Activity[]) : [];
  } catch {
    return [];
  }
}

function readCompletedActivities(): string[] {
  try {
    const value = localStorage.getItem(COMPLETED_ACTIVITIES_KEY);

    if (!value) {
      return [];
    }

    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function useActivities() {
  const [customActivities, setCustomActivities] =
    useState<Activity[]>(readCustomActivities);

  const [completedActivityIds, setCompletedActivityIds] =
    useState<string[]>(readCompletedActivities);

  const activities = [...defaultActivities, ...customActivities];

  function addActivity(activity: Activity) {
    setCustomActivities((current) => {
      const updated = [...current, activity];

      localStorage.setItem(
        CUSTOM_ACTIVITIES_KEY,
        JSON.stringify(updated),
      );

      return updated;
    });
  }

  function toggleCompleted(activityId: string) {
    setCompletedActivityIds((current) => {
      const updated = current.includes(activityId)
        ? current.filter((id) => id !== activityId)
        : [...current, activityId];

      localStorage.setItem(
        COMPLETED_ACTIVITIES_KEY,
        JSON.stringify(updated),
      );

      return updated;
    });
  }

  function removeCustomActivity(activityId: string) {
    setCustomActivities((current) => {
      const updated = current.filter(
        (activity) => activity.id !== activityId,
      );

      localStorage.setItem(
        CUSTOM_ACTIVITIES_KEY,
        JSON.stringify(updated),
      );

      return updated;
    });

    setCompletedActivityIds((current) => {
      const updated = current.filter((id) => id !== activityId);

      localStorage.setItem(
        COMPLETED_ACTIVITIES_KEY,
        JSON.stringify(updated),
      );

      return updated;
    });
  }

  return {
    activities,
    completedActivityIds,
    addActivity,
    toggleCompleted,
    removeCustomActivity,
  };
}