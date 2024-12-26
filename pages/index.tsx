import { useState } from "react";
import React from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/getAdvice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get advice');
      }

      const data = await response.json();
      if (!data.advice || !Array.isArray(data.advice)) {
        throw new Error('Invalid response format');
      }

      setAdvice(data.advice);
      setCurrentStep(questions.length + 1); // Move to results display
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to get advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAdvice([]);
    setFormData({
      age: "",
      income: "",
      savings: "",
      debt: "",
      expenses: "",
      investmentRisk: "",
      financialGoals: "",
      dependents: "",
    });
    setError("");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Analyzing your financial data...</h1>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: '50%' }} />
        </div>
      </div>
    );
  }

  if (currentStep > questions.length) {
    return (
      <div className={styles.container}>
        <h1>Your Personalized Financial Advice</h1>
        <div className={styles.adviceContainer}>
          {advice.map((item, index) => (
            <div key={index} className={styles.adviceCard}>
              <h3>Recommendation {index + 1}</h3>
              <p>{item}</p>
            </div>
          ))}
        </div>
        <button onClick={resetQuiz} className={styles.button}>
          Take Quiz Again
        </button>
      </div>
    );
  }

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
          {currentStep < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className={styles.button}
              disabled={!validateInput(formData[questions[currentStep].key])}
            >
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className={styles.submitButton}>
              Get Financial Advice
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
