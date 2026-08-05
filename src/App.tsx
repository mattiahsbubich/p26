import { useState } from 'react';
import {
  BottomNavigation,
  type PageId,
} from './components/BottomNavigation';
import { useActivities } from './hooks/useActivities';
import { useDayPlans } from './hooks/useDayPlans';
import { useReviews } from './hooks/useReviews';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { MapPage } from './pages/MapPage';
import { ProgramPage } from './pages/ProgramPage';
import { RatingsPage } from './pages/RatingsPage';
import { SettingsPage } from './pages/SettingsPage';
import { OfflineStatus } from './components/OfflineStatus';
import './App.css';


function App() {
  const [currentPage, setCurrentPage] =
    useState<PageId>('program');

  const {
    activities,
    completedActivityIds,
    addActivity,
    toggleCompleted,
    removeCustomActivity,
  } = useActivities();

  const {
    dayPlans,
    updateWind,
    addActivityToDay,
    removeActivityFromDay,
    moveActivity,
    copySuggestedItinerary,
  } = useDayPlans();

  const {
    reviews,
    saveReview,
    removeReview,
  } = useReviews();

  function renderPage() {
    switch (currentPage) {
      case 'map':
        return (
          <MapPage
            activities={activities}
            onAddActivity={addActivity}
            onRemoveCustomActivity={removeCustomActivity}
          />
        );

      case 'activities':
        return (
          <ActivitiesPage
            activities={activities}
            completedActivityIds={completedActivityIds}
            onToggleCompleted={toggleCompleted}
            onAddActivity={addActivity}
            onRemoveCustomActivity={removeCustomActivity}
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
        return <SettingsPage />;

      case 'program':
      default:
        return (
          <ProgramPage
            activities={activities}
            completedActivityIds={completedActivityIds}
            dayPlans={dayPlans}
            onUpdateWind={updateWind}
            onAddActivity={addActivityToDay}
            onRemoveActivity={removeActivityFromDay}
            onMoveActivity={moveActivity}
            onCopySuggested={copySuggestedItinerary}
          />
        );
    }
  }

  return (
  <div className="app-shell">
    <OfflineStatus />

    <div className="app-content">
      {renderPage()}
    </div>

    <BottomNavigation
      currentPage={currentPage}
      onChange={setCurrentPage}
    />
  </div>
);
}

export default App;