import { tripDays } from '../data/trip';
import { createDefaultPlan } from '../data/defaultPlans';
import type { DayPlan, PlanItem } from '../types';
import { STORAGE_KEYS } from '../utils/storage';
import { usePersistentState } from './usePersistentState';

function createDefaultPlans(): DayPlan[] {
  return tripDays.map((day) => createDefaultPlan(day.date));
}

function isPlanItem(value: unknown): value is PlanItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PlanItem).id === 'string'
  );
}

function parseDayPlans(raw: unknown): DayPlan[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }

  const saved = raw as Array<Partial<DayPlan>>;

  return tripDays.map((day) => {
    const savedPlan = saved.find((plan) => plan?.date === day.date);

    if (!savedPlan || !Array.isArray(savedPlan.items)) {
      return createDefaultPlan(day.date);
    }

    return {
      date: day.date,
      items: savedPlan.items.filter(isPlanItem),
    };
  });
}

export function useDayPlans() {
  const [dayPlans, setDayPlans] = usePersistentState<DayPlan[]>(
    STORAGE_KEYS.dayPlans,
    createDefaultPlans,
    parseDayPlans,
  );

  function updateDay(
    date: string,
    change: (items: PlanItem[]) => PlanItem[],
  ) {
    setDayPlans((current) =>
      current.map((plan) =>
        plan.date === date
          ? { ...plan, items: change(plan.items) }
          : plan,
      ),
    );
  }

  function addItem(date: string, item: PlanItem) {
    updateDay(date, (items) => [...items, item]);
  }

  function removeItem(date: string, itemId: string) {
    updateDay(date, (items) =>
      items.filter((item) => item.id !== itemId),
    );
  }

  function updateItem(
    date: string,
    itemId: string,
    patch: Partial<PlanItem>,
  ) {
    updateDay(date, (items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    );
  }

  function moveItem(
    date: string,
    itemId: string,
    direction: 'up' | 'down',
  ) {
    updateDay(date, (items) => {
      const index = items.findIndex((item) => item.id === itemId);
      const target = direction === 'up' ? index - 1 : index + 1;

      if (index === -1 || target < 0 || target >= items.length) {
        return items;
      }

      const next = [...items];

      [next[index], next[target]] = [next[target], next[index]];

      return next;
    });
  }

  function moveItemToDay(
    fromDate: string,
    itemId: string,
    toDate: string,
  ) {
    if (fromDate === toDate) {
      return;
    }

    setDayPlans((current) => {
      const item = current
        .find((plan) => plan.date === fromDate)
        ?.items.find((candidate) => candidate.id === itemId);

      if (!item) {
        return current;
      }

      return current.map((plan) => {
        if (plan.date === fromDate) {
          return {
            ...plan,
            items: plan.items.filter(
              (candidate) => candidate.id !== itemId,
            ),
          };
        }

        if (plan.date === toDate) {
          return { ...plan, items: [...plan.items, item] };
        }

        return plan;
      });
    });
  }

  function resetDay(date: string) {
    setDayPlans((current) =>
      current.map((plan) =>
        plan.date === date ? createDefaultPlan(date) : plan,
      ),
    );
  }

  function removeActivityEverywhere(activityId: string) {
    setDayPlans((current) =>
      current.map((plan) => ({
        ...plan,
        items: plan.items.filter(
          (item) => item.activityId !== activityId,
        ),
      })),
    );
  }

  return {
    dayPlans,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    moveItemToDay,
    resetDay,
    removeActivityEverywhere,
  };
}

export type DayPlansApi = ReturnType<typeof useDayPlans>;
