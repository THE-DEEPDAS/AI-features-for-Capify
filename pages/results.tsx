import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import StateManager from '../utils/stateManager';

export default function Results() {
  const router = useRouter();
  const [adviceList, setAdviceList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAdvice = () => {
      try {
        const advice = StateManager.getAdvice();
        if (!advice || advice.length === 0) {
          setError("No advice found. Please retake the quiz.");
          setTimeout(() => router.replace('/'), 2000);
          return;
        }
        
        setAdviceList(advice);
      } catch (error) {
        console.error('Error loading advice:', error);
        setError("Error loading advice. Please try again.");
        setTimeout(() => router.replace('/'), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadAdvice();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Loading your financial advice...</h1>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: '50%' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1>{error}</h1>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Your Personalized Financial Advice</h1>
      <div className={styles.adviceContainer}>
        {adviceList.map((item, index) => (
          <div key={index} className={styles.adviceCard}>
            <h3>Recommendation {index + 1}</h3>
            <p>{item}</p>
          </div>
        ))}
      </div>
      <button onClick={() => router.replace("/")} className={styles.button}>
        Take Quiz Again
      </button>
    </div>
  );
}
