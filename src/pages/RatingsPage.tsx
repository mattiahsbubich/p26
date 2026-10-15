import { useMemo, useState } from 'react';
import { TypeIcon } from '../components/Icons';
import { PageHeader } from '../components/PageHeader';
import {
  activityTypeLabels,
  isRateable,
} from '../data/activityTypes';
import { createRatingCategories } from '../data/ratingCategories';
import type {
  Activity,
  ActivityReview,
  RatingCategory,
} from '../types';
import { createId } from '../utils/id';

interface RatingsPageProps {
  activities: Activity[];
  reviews: ActivityReview[];
  onSaveReview: (review: ActivityReview) => void;
  onRemoveReview: (activityId: string) => void;
}

function calculateAverage(categories: RatingCategory[]): number {
  if (categories.length === 0) {
    return 0;
  }

  return (
    categories.reduce((sum, category) => sum + category.score, 0) /
    categories.length
  );
}

export function RatingsPage({
  activities,
  reviews,
  onSaveReview,
  onRemoveReview,
}: RatingsPageProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<
    string | null
  >(null);

  const [draftCategories, setDraftCategories] = useState<
    RatingCategory[]
  >([]);

  const [draftNote, setDraftNote] = useState('');

  const selectedActivity = activities.find(
    (activity) => activity.id === selectedActivityId,
  );

  const reviewableActivities = useMemo(
    () => activities.filter((activity) => isRateable(activity.type)),
    [activities],
  );

  const rankedReviews = useMemo(() => {
    return reviews
      .flatMap((review) => {
        const activity = activities.find(
          (item) => item.id === review.activityId,
        );

        return activity
          ? [
              {
                review,
                activity,
                average: calculateAverage(review.categories),
              },
            ]
          : [];
      })
      .sort((first, second) => second.average - first.average);
  }, [reviews, activities]);

  function openReview(activity: Activity) {
    const existing = reviews.find(
      (review) => review.activityId === activity.id,
    );

    setSelectedActivityId(activity.id);

    setDraftCategories(
      existing
        ? existing.categories.map((category) => ({ ...category }))
        : createRatingCategories(activity.type),
    );

    setDraftNote(existing?.note ?? '');
  }

  function closeReview() {
    setSelectedActivityId(null);
    setDraftCategories([]);
    setDraftNote('');
  }

  function updateScore(categoryId: string, score: number) {
    setDraftCategories((current) =>
      current.map((category) =>
        category.id === categoryId ? { ...category, score } : category,
      ),
    );
  }

  function handleSaveReview() {
    if (!selectedActivity) {
      return;
    }

    const existing = reviews.find(
      (review) => review.activityId === selectedActivity.id,
    );

    onSaveReview({
      id: existing?.id ?? createId(),
      activityId: selectedActivity.id,
      visitedAt: existing?.visitedAt ?? new Date().toISOString(),
      categories: draftCategories,
      note: draftNote.trim(),
    });

    closeReview();
  }

  function handleRemoveReview(activity: Activity) {
    if (
      window.confirm(
        `Vuoi eliminare la pagella di “${activity.name}”?`,
      )
    ) {
      onRemoveReview(activity.id);
    }
  }

  if (selectedActivity) {
    return (
      <main className="page">
        <button
          type="button"
          className="back-button"
          onClick={closeReview}
        >
          ‹ Indietro
        </button>

        <PageHeader
          eyebrow={activityTypeLabels[selectedActivity.type]}
          title={selectedActivity.name}
        />

        <section className="panel average-panel">
          <p className="section-label">Media provvisoria</p>

          <div className="large-average">
            {calculateAverage(draftCategories).toFixed(1)}
            <span>/10</span>
          </div>
        </section>

        <section className="panel">
          <h2>Le vostre valutazioni</h2>

          <div className="rating-categories">
            {draftCategories.map((category) => (
              <div className="rating-category" key={category.id}>
                <div className="rating-category-heading">
                  <label htmlFor={category.id}>{category.label}</label>
                  <strong>{category.score}</strong>
                </div>

                <input
                  id={category.id}
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={category.score}
                  onChange={(event) =>
                    updateScore(category.id, Number(event.target.value))
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <label htmlFor="review-note" className="field-label">
            Commento
          </label>

          <textarea
            id="review-note"
            rows={4}
            value={draftNote}
            onChange={(event) => setDraftNote(event.target.value)}
            placeholder="Che cosa vi è piaciuto? Cosa avreste cambiato?"
          />
        </section>

        <button
          type="button"
          className="button primary block"
          onClick={handleSaveReview}
        >
          Salva pagella
        </button>
      </main>
    );
  }

  return (
    <main className="page">
      <PageHeader
        eyebrow="La vostra classifica"
        title="Pagelle"
        subtitle="Date un voto ai luoghi visitati e scoprite il preferito del viaggio."
      />

      {rankedReviews.length > 0 && (
        <section className="panel">
          <p className="section-label">Classifica generale</p>
          <h2>I migliori di Parigi</h2>

          <ol className="leaderboard">
            {rankedReviews.map(({ review, activity, average }, index) => (
              <li key={review.id}>
                <button
                  type="button"
                  className="leaderboard-item"
                  onClick={() => openReview(activity)}
                  aria-label={`Modifica la pagella di ${activity.name}`}
                >
                  <span className="house-number">{index + 1}</span>

                  <span className="leaderboard-content">
                    <strong>{activity.name}</strong>
                    <small>{activityTypeLabels[activity.type]}</small>
                  </span>

                  <span className="score">{average.toFixed(1)}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <div className="section-row">
          <div>
            <p className="section-label">Esperienze</p>
            <h2>Scegli cosa votare</h2>
          </div>

          <span className="counter">
            {rankedReviews.length}/{reviewableActivities.length}
          </span>
        </div>

        <div className="rating-list">
          {reviewableActivities.map((activity) => {
            const review = reviews.find(
              (item) => item.activityId === activity.id,
            );

            return (
              <article className="rating-row" key={activity.id}>
                <button
                  type="button"
                  className="rating-row-main"
                  onClick={() => openReview(activity)}
                >
                  <span className="place-icon">
                    <TypeIcon type={activity.type} size={20} />
                  </span>

                  <span className="leaderboard-content">
                    <small>{activityTypeLabels[activity.type]}</small>
                    <strong>{activity.name}</strong>
                  </span>

                  {review ? (
                    <span className="score">
                      {calculateAverage(review.categories).toFixed(1)}
                    </span>
                  ) : (
                    <span className="vote-link">Vota</span>
                  )}
                </button>

                {review && (
                  <button
                    type="button"
                    className="link-button danger"
                    onClick={() => handleRemoveReview(activity)}
                  >
                    Elimina pagella
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
