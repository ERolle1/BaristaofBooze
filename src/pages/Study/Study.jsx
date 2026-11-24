import { useState } from "react";
import { Link } from "react-router";
import { studyDecks } from "../../data/studyDecks";
import styles from "./study.module.css";

export const Study = () => {
  const [deckId, setDeckId] = useState(studyDecks[0].id);
  const [cardIndex, setCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reviewIds, setReviewIds] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const selectedDeck = studyDecks.find((deck) => deck.id === deckId);
  const activeCards = isReviewing
    ? reviewCards
    : selectedDeck.cards;
  const card = activeCards[cardIndex];

  const selectDeck = (event) => {
    setDeckId(event.target.value);
    setCardIndex(0);
    setIsRevealed(false);
    setReviewIds([]);
    setReviewCards([]);
    setIsReviewing(false);
    setIsComplete(false);
  };

  const gradeCard = (gotIt) => {
    setReviewIds((current) =>
      gotIt
        ? current.filter((id) => id !== card.id)
        : current.includes(card.id)
          ? current
          : [...current, card.id],
    );
    setIsRevealed(false);
    if (cardIndex + 1 >= activeCards.length) {
      setIsComplete(true);
    } else {
      setCardIndex((current) => current + 1);
    }
  };

  const startReview = () => {
    setReviewCards(
      selectedDeck.cards.filter((card) => reviewIds.includes(card.id)),
    );
    setIsReviewing(true);
    setCardIndex(0);
    setIsRevealed(false);
    setIsComplete(false);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Barista of Booze · Training Room</p>
        <h1>Specs from memory.</h1>
        <p className={styles.intro}>
          Recall the pour, glassware, and garnish before flipping the card.
        </p>
        <Link to="/" className={styles.homeLink}>
          ← Back to homepage
        </Link>
      </header>

      <section className={styles.studyPanel} aria-label="Flashcard study session">
        <label className={styles.deckPicker}>
          Choose a study list
          <select value={deckId} onChange={selectDeck}>
            {studyDecks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name} · {deck.cards.length} cards
              </option>
            ))}
          </select>
        </label>

        {isComplete ? (
          <div className={styles.complete}>
            <p className={styles.eyebrow}>Session complete</p>
            <h2>{isReviewing ? "Review round finished" : "Nice work, bartender."}</h2>
            <p>
              {reviewIds.length
                ? `${reviewIds.length} ${reviewIds.length === 1 ? "card needs" : "cards need"} another look.`
                : "All cards are marked Got it. Keep practicing to lock in the specs."}
            </p>
            <div className={styles.sessionActions}>
              {reviewIds.length > 0 && (
                <button type="button" onClick={startReview}>
                  Review again ({reviewIds.length})
                </button>
              )}
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setCardIndex(0);
                  setIsRevealed(false);
                  setIsReviewing(false);
                  setReviewCards([]);
                  setIsComplete(false);
                }}
              >
                Study the list again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.cardMeta}>
              <span>{isReviewing ? "Review round" : selectedDeck.name}</span>
              <span>
                Card {cardIndex + 1} of {activeCards.length}
              </span>
            </div>
            <article className={styles.flashcard}>
              <p className={styles.cardPrompt}>Blind spec · recall before reveal</p>
              <h2>{card.name}</h2>
              {!isRevealed ? (
                <p className={styles.recallHint}>
                  What are the specs, glass, and garnish?
                </p>
              ) : (
                <div className={styles.answer}>
                  <section>
                    <h3>Specs</h3>
                    <ul>
                      {card.ingredients.map((ingredient) => (
                        <li key={ingredient}>{ingredient}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3>Glassware</h3>
                    <p>{card.glass}</p>
                  </section>
                  <section>
                    <h3>Garnish</h3>
                    <p>{card.garnish}</p>
                  </section>
                </div>
              )}
            </article>
            {!isRevealed ? (
              <button
                type="button"
                className={styles.revealButton}
                onClick={() => setIsRevealed(true)}
              >
                Reveal answer
              </button>
            ) : (
              <div className={styles.gradeActions}>
                <button type="button" onClick={() => gradeCard(true)}>
                  Got it
                </button>
                <button
                  type="button"
                  className={styles.reviewButton}
                  onClick={() => gradeCard(false)}
                >
                  Review again
                </button>
              </div>
            )}
            <p className={styles.specNote}>
              Study specs are a starting point; follow your bar&apos;s house
              recipe and service standards.
            </p>
          </>
        )}
      </section>
    </main>
  );
};
