import { useRouter } from "next/router";
import React from "react";
import styles from "../styles/Home.module.css";

export default function Results() {
  const router = useRouter();
  const { advice } = router.query;

  // Parse the advice string and handle potential errors
  const adviceList = React.useMemo(() => {
    try {
      if (!advice) return [];
      let parsed = JSON.parse(advice as string);
      // Ensure we have exactly 5 items
      if (Array.isArray(parsed)) {
        if (parsed.length < 5) {
          parsed = [
            ...parsed,
            ...Array(5 - parsed.length).fill("Consider consulting with a financial advisor for more personalized advice.")
          ];
        }
        return parsed.slice(0, 5); // Take only first 5 items if more
      }
      return [];
    } catch (e) {
      console.error('Error parsing advice:', e);
      return [];
    }
  }, [advice]);

  if (!adviceList.length) {
    return (
      <div className={styles.container}>
        <h1>No advice available</h1>
        <button onClick={() => router.push("/")} className={styles.button}>
          Take Quiz Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Your Personalized Financial Advice</h1>
      <div className={styles.adviceContainer}>
        {adviceList.map((item: string, index: number) => (
          <div key={index} className={styles.adviceCard}>
            <h3>Recommendation {index + 1}</h3>
            <p>{item}</p>
          </div>
        ))}
      </div>
      <button onClick={() => router.push("/")} className={styles.button}>
        Take Quiz Again
      </button>
    </div>
  );
}
