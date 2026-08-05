import { useState } from 'react';
import type { DayPlan, Wind } from '../types';

const DAY_PLANS_KEY = 'p26-day-plans';

const tripDates = [
  '2026-08-09',
  '2026-08-10',
  '2026-08-11',
  '2026-08-12',
  '2026-08-13',
];

function createDefaultPlans(): DayPlan[] {
  return tripDates.map((date) => ({
    date,
    selectedWind: 'variabile',
    activityIds: [],
  }));
}

function readDayPlans(): DayPlan[] {
  try {
    const savedValue = localStorage.getItem(DAY_PLANS_KEY);

    if (!savedValue) {
      return createDefaultPlans();
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (!Array.isArray(parsedValue)) {
      return createDefaultPlans();
    }

    const savedPlans = parsedValue as DayPlan[];

    return tripDates.map((date) => {
      const savedPlan = savedPlans.find((plan) => plan.date === date);

      return (
        savedPlan ?? {
          date,
          selectedWind: 'variabile',
          activityIds: [],
        }
      );
    });
  } catch {
    return createDefaultPlans();
  }
}

export function useDayPlans() {
  const [dayPlans, setDayPlans] = useState<DayPlan[]>(readDayPlans);

  function savePlans(updatedPlans: DayPlan[]) {
    setDayPlans(updatedPlans);
    localStorage.setItem(DAY_PLANS_KEY, JSON.stringify(updatedPlans));
  }

  function updateWind(date: string, wind: Wind) {
    const updatedPlans = dayPlans.map((plan) =>
      plan.date === date
        ? {
            ...plan,
            selectedWind: wind,
          }
        : plan,
    );

    savePlans(updatedPlans);
  }

  function addActivityToDay(date: string, activityId: string) {
    const updatedPlans = dayPlans.map((plan) => {
      if (plan.date !== date) {
        return plan;
      }

      if (plan.activityIds.includes(activityId)) {
        return plan;
      }

      return {
        ...plan,
        activityIds: [...plan.activityIds, activityId],
      };
    });

    savePlans(updatedPlans);
  }

  function removeActivityFromDay(date: string, activityId: string) {
    const updatedPlans = dayPlans.map((plan) =>
      plan.date === date
        ? {
            ...plan,
            activityIds: plan.activityIds.filter(
              (id) => id !== activityId,
            ),
          }
        : plan,
    );

    savePlans(updatedPlans);
  }

  function moveActivity(
    date: string,
    activityId: string,
    direction: 'up' | 'down',
  ) {
    const updatedPlans = dayPlans.map((plan) => {
      if (plan.date !== date) {
        return plan;
      }

      const currentIndex = plan.activityIds.indexOf(activityId);

      if (currentIndex === -1) {
        return plan;
      }

      const nextIndex =
        direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (nextIndex < 0 || nextIndex >= plan.activityIds.length) {
        return plan;
      }

      const updatedActivityIds = [...plan.activityIds];

      [
        updatedActivityIds[currentIndex],
        updatedActivityIds[nextIndex],
      ] = [
        updatedActivityIds[nextIndex],
        updatedActivityIds[currentIndex],
      ];

      return {
        ...plan,
        activityIds: updatedActivityIds,
      };
    });

    savePlans(updatedPlans);
  }

  function copySuggestedItinerary(
    date: string,
    activityIds: string[],
  ) {
    const updatedPlans = dayPlans.map((plan) =>
      plan.date === date
        ? {
            ...plan,
            activityIds: [...activityIds],
          }
        : plan,
    );

    savePlans(updatedPlans);
  }

  return {
    dayPlans,
    updateWind,
    addActivityToDay,
    removeActivityFromDay,
    moveActivity,
    copySuggestedItinerary,
  };
}