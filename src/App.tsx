import { lazy, Suspense, useState } from 'react';
import {
  BottomNavigation,
  type PageId,
} from './components/BottomNavigation';
import { OfflineStatus } from './components/OfflineStatus';
import { isRateable } from './data/activityTypes';
import { tripDays } from './data/trip';
import { useActivities } from './hooks/useActivities';
import { useDayPlans } from './hooks/useDayPlans';
import { useReviews } from './hooks/useReviews';
import { ActivitiesPage } from './pages/ActivitiesPage';
import type { MapFilter } from './pages/MapPage';
import { ProgramPage } from './pages/ProgramPage';
import { RatingsPage } from './pages/RatingsPage';
import { SettingsPage } from './pages/SettingsPage';
import type { Activity, PlanItem } from './types';
import { createId } from './utils/id';
import './App.css';

/* La mappa (MapLibre) è pesante: la carichiamo solo quando serve. */
const MapPage = lazy(() =>
  import('./pages/MapPage').then((module) => ({
    default: module.MapPage,
  })),
);

function getLocalDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${now.getFullYear()}-${month}-${day}`;
}

function App() {
  const todayDate = getLocalDate();

  const [currentPage, setCurrentPage] = useState<PageId>('program');

  /*
   * Durante il viaggio si apre sul giorno di oggi,
   * altrimenti sul primo giorno.
   */
  const [selectedDate, setSelectedDate] = useState(
    tripDays.some((day) => day.date === todayDate)
      ? todayDate
      : tripDays[0].date,
  );

  const [mapFilter, setMapFilter] = useState<MapFilter>('all');

  const activitiesApi = useActivities();
  const plans = useDayPlans();
  const { reviews, saveReview, removeReview } = useReviews();

  const {
    activities,
    completedActivityIds,
    bookedActivityIds,
    toggleCompleted,
    toggleBooked,
    addActivity,
    updatePlace,
  } = activitiesApi;

  function removeCustomActivity(activityId: string) {
    activitiesApi.removeCustomActivity(activityId);
    plans.removeActivityEverywhere(activityId);
    removeReview(activityId);
  }

  function addActivityToDay(date: string, activityId: string) {
    plans.addItem(date, { id: createId(), activityId });
  }

  /*
   * Spuntare una tappa la segna come fatta nel programma e, per i luoghi
   * "veri", anche come visitata nell'elenco dei luoghi.
   */
  function toggleItemDone(
    date: string,
    item: PlanItem,
    activity?: Activity,
  ) {
    const wasDone =
      Boolean(item.done) ||
      (activity !== undefined &&
        isRateable(activity.type) &&
        completedActivityIds.includes(activity.id));

    plans.updateItem(date, item.id, { done: !wasDone });

    if (
      activity &&
      isRateable(activity.type) &&
      completedActivityIds.includes(activity.id) === wasDone
    ) {
      toggleCompleted(activity.id);
    }
  }

  function showDayOnMap(date: string) {
    setMapFilter(date);
    setCurrentPage('map');
  }

  function renderPage() {
    switch (currentPage) {
      case 'map':
        return (
          <Suspense
            fallback={
              <main className="page">
                <p className="muted">Carico la mappa…</p>
              </main>
            }
          >
          <MapPage
            activities={activities}
            dayPlans={plans.dayPlans}
            filter={mapFilter}
            onFilterChange={setMapFilter}
            onAddActivity={addActivity}
            onAddToDay={addActivityToDay}
            onRemoveCustomActivity={removeCustomActivity}
          />
          </Suspense>
        );

      case 'activities':
        return (
          <ActivitiesPage
            activities={activities}
            completedActivityIds={completedActivityIds}
            bookedActivityIds={bookedActivityIds}
            dayPlans={plans.dayPlans}
            onToggleCompleted={toggleCompleted}
            onToggleBooked={toggleBooked}
            onAddActivity={addActivity}
            onRemoveCustomActivity={removeCustomActivity}
            onAddToDay={addActivityToDay}
            onUpdatePlace={updatePlace}
          />
        );

      case 'ratings':
        return (
          <RatingsPage
            activities={activities}
            reviews={reviews}
            onSaveReview={saveReview}
            onRemoveReview={removeReview}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            activities={activities}
            dayPlans={plans.dayPlans}
            bookedActivityIds={bookedActivityIds}
            onToggleBooked={toggleBooked}
          />
        );

      case 'program':
      default:
        return (
          <ProgramPage
            activities={activities}
            completedActivityIds={completedActivityIds}
            bookedActivityIds={bookedActivityIds}
            plans={plans}
            selectedDate={selectedDate}
            todayDate={todayDate}
            onSelectDate={setSelectedDate}
            onToggleBooked={toggleBooked}
            onToggleItemDone={toggleItemDone}
            onAddActivity={addActivity}
            onShowOnMap={showDayOnMap}
          />
        );
    }
  }

  return (
    <div className="app-shell">
      <OfflineStatus />

      <div className="app-content">{renderPage()}</div>

      <BottomNavigation
        currentPage={currentPage}
        onChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0 });
        }}
      />
    </div>
  );
}

export default App;
