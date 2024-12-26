import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Results.module.css';
import { routes } from '../utils/config';

export default function Results() {
  const router = useRouter();
  const [advice, setAdvice] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdvice = () => {
      try {
        const storedAdvice = sessionStorage.getItem('financialAdvice');
        if (!storedAdvice) {
          router.replace('/');
          return;
        }

        const parsedAdvice = JSON.parse(storedAdvice);
        if (!Array.isArray(parsedAdvice) || parsedAdvice.length === 0) {
          router.replace('/');
          return;
        }

        setAdvice(parsedAdvice);
        setRevealed(new Array(parsedAdvice.length).fill(false));
      } catch (error) {
        console.error('Error loading advice:', error);
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      loadAdvice();
    }
  }, [router]);

  // Prevent flash of empty content
  if (typeof window === 'undefined' || loading) {
    return (
      <div className={styles.container}>
        <h1>Preparing Your Financial Roadmap...</h1>
        <div className={styles.loader}></div>
      </div>
    );
  }

  // If no advice is available, redirect
  if (!advice.length) {
    return null;
  }

  const handleReveal = (index: number) => {
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
  };

  return (
    <div className={styles.container}>
      <h1>Your Financial Roadmap</h1>
      <div className={styles.adviceGrid}>
        {advice.map((item, index) => (
          <div 
            key={index}
            className={`${styles.adviceCard} ${revealed[index] ? styles.revealed : ''}`}
            onClick={() => handleReveal(index)}
          >
            {revealed[index] ? (
              <>
                <h3>Strategy {index + 1}</h3>
                <p>{item}</p>
              </>
            ) : (
              <div className={styles.cardFront}>
                <h3>Tap to Reveal</h3>
                <p>Strategy {index + 1}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <button 
        onClick={() => {
          sessionStorage.clear();
          router.push(routes.home);
        }} 
        className={styles.resetButton}
      >
        Take Quiz Again
      </button>
    </div>
  );
}
