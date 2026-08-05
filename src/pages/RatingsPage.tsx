import { useMemo, useState } from 'react';
import { createRatingCategories } from '../data/ratingCategories';
import type {
  Activity,
  ActivityReview,
  RatingCategory,
} from '../types';

interface RatingsPageProps {
  activities: Activity[];
  reviews: ActivityReview[];
  onSaveReview: (review: ActivityReview) => void;
  onRemoveReview: (activityId: string) => void;
}

function calculateAverage(
  categories: RatingCategory[],
): number {
  if (categories.length === 0) {
    return 0;
  }

  const total = categories.reduce(
    (sum, category) => sum + category.score,
    0,
  );

  return total / categories.length;
}

function getTypeLabel(activity: Activity): string {
  switch (activity.type) {
    case 'beach':
      return 'Spiaggia';

    case 'restaurant':
      return 'Ristorante';

    case 'city':
      return 'Città';

    case 'visit':
      return 'Visita';

    case 'walk':
      return 'Passeggiata';

    case 'parking':
      return 'Parcheggio';

    case 'custom':
    default:
      return 'Attività';
  }
}

function getTypeEmoji(activity: Activity): string {
  switch (activity.type) {
    case 'beach':
      return '🏖️';

    case 'restaurant':
      return '🍽️';

    case 'city':
      return '🏛️';

    case 'visit':
      return '🎟️';

    case 'walk':
      return '🚶';

    case 'parking':
      return '🅿️';

    case 'custom':
    default:
      return '📍';
  }
}

export function RatingsPage({
  activities,
  reviews,
  onSaveReview,
  onRemoveReview,
}: RatingsPageProps) {
  const [selectedActivityId, setSelectedActivityId] =
    useState<string | null>(null);

  const [draftCategories, setDraftCategories] =
    useState<RatingCategory[]>([]);

  const [draftNote, setDraftNote] = useState('');

  const selectedActivity = useMemo(
    () =>
      activities.find(
        (activity) => activity.id === selectedActivityId,
      ),
    [activities, selectedActivityId],
  );

  const reviewableActivities = useMemo(
    () =>
      activities.filter((activity) =>
        ['beach', 'restaurant', 'city', 'visit', 'walk', 'custom']
          .includes(activity.type),
      ),
    [activities],
  );

  const rankedReviews = useMemo(() => {
    return reviews
      .map((review) => {
        const activity = activities.find(
          (item) => item.id === review.activityId,
        );

        return {
          review,
          activity,
          average: calculateAverage(review.categories),
        };
      })
      .filter(
        (
          item,
        ): item is {
          review: ActivityReview;
          activity: Activity;
          average: number;
        } => item.activity !== undefined,
      )
      .sort((first, second) => second.average - first.average);
  }, [reviews, activities]);

  function openReview(activity: Activity) {
    const existingReview = reviews.find(
      (review) => review.activityId === activity.id,
    );

    setSelectedActivityId(activity.id);

    setDraftCategories(
      existingReview
        ? existingReview.categories.map((category) => ({
            ...category,
          }))
        : createRatingCategories(activity.type),
    );

    setDraftNote(existingReview?.note ?? '');
  }

  function closeReview() {
    setSelectedActivityId(null);
    setDraftCategories([]);
    setDraftNote('');
  }

  function updateScore(categoryId: string, score: number) {
    setDraftCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              score,
            }
          : category,
      ),
    );
  }

  function handleSaveReview() {
    if (!selectedActivity) {
      return;
    }

    const existingReview = reviews.find(
      (review) =>
        review.activityId === selectedActivity.id,
    );

    onSaveReview({
      id: existingReview?.id ?? crypto.randomUUID(),
      activityId: selectedActivity.id,
      visitedAt:
        existingReview?.visitedAt ??
        new Date().toISOString(),
      categories: draftCategories,
      note: draftNote.trim(),
    });

    closeReview();
  }

  function handleRemoveReview(activity: Activity) {
    const confirmed = window.confirm(
      `Vuoi eliminare la pagella di "${activity.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    onRemoveReview(activity.id);
  }

  if (selectedActivity) {
    const draftAverage =
      calculateAverage(draftCategories);

    return (
      <main className="page">
        <header className="review-editor-header">
          <button
            type="button"
            className="back-button"
            onClick={closeReview}
          >
            ‹ Indietro
          </button>

          <div>
            <p className="eyebrow">
              {getTypeLabel(selectedActivity)}
            </p>

            <h1>{selectedActivity.name}</h1>
          </div>
        </header>

        <section className="card review-score-card">
          <p className="section-label">Media provvisoria</p>

          <div className="large-average">
            {draftAverage.toFixed(1)}
          </div>

          <span>su 10</span>
        </section>

        <section className="card rating-editor-card">
          <h2>Le vostre valutazioni</h2>

          <div className="rating-categories">
            {draftCategories.map((category) => (
              <div
                className="rating-category"
                key={category.id}
              >
                <div className="rating-category-heading">
                  <label htmlFor={category.id}>
                    {category.label}
                  </label>

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
                    updateScore(
                      category.id,
                      Number(event.target.value),
                    )
                  }
                />

                <div className="rating-scale">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card review-note-card">
          <label htmlFor="review-note">
            Commento della giornata
          </label>

          <textarea
            id="review-note"
            rows={5}
            value={draftNote}
            onChange={(event) =>
              setDraftNote(event.target.value)
            }
            placeholder="Che cosa vi è piaciuto? Cosa avreste cambiato?"
          />
        </section>

        <button
          type="button"
          className="save-review-button"
          onClick={handleSaveReview}
        >
          Salva pagella
        </button>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">La vostra classifica</p>
        <h1>Pagelle</h1>

        <p className="page-subtitle">
          Date un voto alle esperienze e scoprite la vincitrice
          della vacanza.
        </p>
      </header>

      {rankedReviews.length > 0 && (
        <section className="card leaderboard-card">
          <p className="section-label">Classifica generale</p>
          <h2>Le migliori esperienze</h2>

          <div className="leaderboard">
            {rankedReviews.map(
              ({ review, activity, average }, index) => (
                <article
                  className="leaderboard-item"
                  key={review.id}
                >
                  <div className="leaderboard-position">
                    {index + 1}
                  </div>

                  <div className="leaderboard-content">
                    <strong>
                      {getTypeEmoji(activity)} {activity.name}
                    </strong>

                    <span>
                      {getTypeLabel(activity)}
                    </span>
                  </div>

                  <div className="leaderboard-score">
                    {average.toFixed(1)}
                  </div>

                  <button
                    type="button"
                    className="small-edit-button"
                    onClick={() => openReview(activity)}
                    aria-label={`Modifica la pagella di ${activity.name}`}
                  >
                    ✏️
                  </button>
                </article>
              ),
            )}
          </div>
        </section>
      )}

      <section className="ratings-section">
        <div className="ratings-section-heading">
          <div>
            <p className="section-label">Esperienze</p>
            <h2>Scegli cosa votare</h2>
          </div>

          <span>
            {rankedReviews.length}/{reviewableActivities.length}
            </span>
        </div>

        <div className="ratings-activity-list">
          {reviewableActivities.map((activity) => {
            const review = reviews.find(
              (item) => item.activityId === activity.id,
            );

            const average = review
              ? calculateAverage(review.categories)
              : null;

            return (
              <article
                className="card rating-activity-card"
                key={activity.id}
              >
                <button
                  type="button"
                  className="rating-activity-main"
                  onClick={() => openReview(activity)}
                >
                  <span className="rating-activity-icon">
                    {getTypeEmoji(activity)}
                  </span>

                  <span className="rating-activity-content">
                    <small>{getTypeLabel(activity)}</small>
                    <strong>{activity.name}</strong>
                  </span>

                  {average !== null ? (
                    <span className="activity-average">
                      {average.toFixed(1)}
                    </span>
                  ) : (
                    <span className="not-rated">
                      Vota
                    </span>
                  )}
                </button>

                {review && (
                  <button
                    type="button"
                    className="delete-review-button"
                    onClick={() =>
                      handleRemoveReview(activity)
                    }
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