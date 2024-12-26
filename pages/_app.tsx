import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

export default function Home() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    age: "",
    income: "",
    savings: "",
    debt: "",
    expenses: "",
    investmentRisk: "",
    financialGoals: "",
    dependents: "",
  });

  const questions = [
    { key: "age", label: "What is your age?", type: "number" },
    { key: "income", label: "What is your monthly income?", type: "number" },
    {
      key: "savings",
      label: "How much do you have in savings?",
      type: "number",
    },
    { key: "debt", label: "What is your total debt?", type: "number" },
    {
      key: "expenses",
      label: "What are your monthly expenses?",
      type: "number",
    },
    {
      key: "investmentRisk",
      label:
        "On a scale of 1-10, how comfortable are you with investment risk?",
      type: "number",
    },
    {
      key: "dependents",
      label: "How many dependents do you have?",
      type: "number",
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/getAdvice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      router.push({
        pathname: "/results",
        query: { advice: JSON.stringify(data.advice) },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Financial Advisory Quiz</h1>
      {currentStep < questions.length ? (
        <div className={styles.questionCard}>
          <h2>{questions[currentStep].label}</h2>
          <input
            type={questions[currentStep].type}
            name={questions[currentStep].key}
            value={formData[questions[currentStep].key]}
            onChange={handleInputChange}
            className={styles.input}
          />
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className={styles.button}
          >
            Next
          </button>
        </div>
      ) : (
        <button onClick={handleSubmit} className={styles.submitButton}>
          Get Financial Advice
        </button>
      )}
    </div>
  );
}