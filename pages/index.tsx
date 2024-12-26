import { useState } from "react";
import React from "react";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

// Create a type for storing advice globally
declare global {
  interface Window {
    __FINANCIAL_ADVICE__?: string[];
  }
}

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
  const [error, setError] = useState<string>("");

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

  const validateForm = () => {
    for (const key in formData) {
      if (!formData[key] || formData[key].trim() === '') {
        setError(`Please fill in all fields before proceeding`);
        return false;
      }
      const value = parseFloat(formData[key]);
      if (isNaN(value)) {
        setError(`Please enter valid numbers`);
        return false;
      }
    }
    setError("");
    return true;
  };

  const validateInput = (value: string) => {
    if (!value || value.trim() === '') return false;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      setFormData({ ...formData, [e.target.name]: value });
      setError("");
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentValue = formData[questions[currentStep].key];
    
    if (!validateInput(currentValue)) {
      setError("Please enter a valid number before proceeding");
      return;
    }

    setError("");
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("/api/getAdvice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to get advice');
      }

      const data = await response.json();
      if (!data.advice) {
        throw new Error('No advice received');
      }

      router.push({
        pathname: "/results",
        query: { advice: JSON.stringify(data.advice) }
      });
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to get advice. Please try again.");
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
            required
            min="0"
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button
            onClick={handleNext}
            className={styles.button}
            disabled={!validateInput(formData[questions[currentStep].key])}
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
