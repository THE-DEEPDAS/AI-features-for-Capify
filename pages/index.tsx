import { useState } from "react";
import { useRouter } from "next/router";
import React from "react";
import styles from "../styles/Home.module.css";
import { getBaseUrl, routes } from '../utils/config';

export default function Home() {
  const router = useRouter();
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
    const requiredFields = ['age', 'income', 'savings', 'debt', 'expenses', 'investmentRisk', 'dependents'];
    
    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || value.toString().trim() === '') {
        setError(`Please fill in ${field}`);
        return false;
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        setError(`Please enter a valid number for ${field}`);
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
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}${routes.api.getAdvice}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parseFloat(formData.age),
          income: parseFloat(formData.income),
          savings: parseFloat(formData.savings),
          debt: parseFloat(formData.debt),
          expenses: parseFloat(formData.expenses),
          investmentRisk: parseFloat(formData.investmentRisk),
          dependents: parseFloat(formData.dependents),
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get financial advice');
      }

      const result = await response.json();
      
      if (!result.advice || !Array.isArray(result.advice)) {
        throw new Error('Invalid response format');
      }

      sessionStorage.setItem('financialAdvice', JSON.stringify(result.advice));
      router.push(routes.results);
    } catch (error) {
      setError("Failed to get advice. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Analyzing your financial situation...</h1>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: '80%' }} />
        </div>
      </div>
    );
  }

  // Show results
  if (currentStep > questions.length && advice.length > 0) {
    return (
      <div className={styles.container}>
        <h1>Your Financial Recommendations</h1>
        <div className={styles.adviceContainer}>
          {advice.map((item, index) => (
            <div key={index} className={styles.adviceCard}>
              <h3>Recommendation {index + 1}</h3>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show quiz
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
