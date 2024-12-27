import sys
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import openai
import os

# Initialize OpenAI with API key directly from environment
openai.api_key = os.environ.get('OPENAI_API_KEY')
if not openai.api_key:
    print("Warning: OpenAI API key not found in environment variables", file=sys.stderr)

# Generate synthetic training data
def generate_training_data(n_samples=500):  # Reduced sample size
    np.random.seed(42)
    X = np.random.rand(n_samples, 7)  # 7 features
    X[:, 0] *= 80  # age: 0-80
    X[:, 1] *= 15000  # income: 0-15000
    X[:, 2] *= 100000  # savings: 0-100000
    X[:, 3] *= 100000  # debt: 0-100000
    X[:, 4] *= 5000  # expenses: 0-5000
    X[:, 5] *= 10  # investment_risk: 0-10
    X[:, 6] *= 5  # dependents: 0-5
    
    # Create labels based on financial scenarios
    y = np.zeros(n_samples)
    for i in range(n_samples):
        if X[i, 2] > X[i, 3] and X[i, 1] > X[i, 4] * 2:
            y[i] = 0  # Good financial health
        elif X[i, 3] > X[i, 2] * 2:
            y[i] = 1  # High debt
        elif X[i, 4] / X[i, 1] > 0.5:
            y[i] = 2  # High expenses
        else:
            y[i] = 3  # Moderate financial health
    
    return X, y

def generate_basic_advice(prediction, user_data):
    advice_map = {
        0: [
            "Your financial health appears good! Consider increasing your investments.",
            f"With your risk tolerance of {user_data['investmentRisk']}/10, consider diversified investment options.",
            "Set up or increase your emergency fund to cover 6 months of expenses.",
            "Look into tax-advantaged retirement accounts like 401(k) or IRA.",
            "Consider long-term investment strategies based on your age of {user_data['age']}."
        ],
        1: [
            "Focus on debt reduction as your primary financial goal.",
            "Consider debt consolidation or refinancing for better interest rates.",
            "Create a strict budget allocating extra funds to debt payments.",
            f"With your monthly income of ${user_data['income']}, aim to pay off high-interest debt first.",
            "Set up automatic payments to avoid late fees and improve credit score."
        ],
        2: [
            "Your expenses are high relative to your income.",
            "Review and categorize your monthly expenses to identify areas to cut back.",
            "Consider ways to increase your income through side hustles.",
            "Negotiate bills and subscriptions for better rates.",
            "Create a zero-based budget to track every dollar spent."
        ],
        3: [
            "Your financial health is moderate - focus on improvement.",
            "Build an emergency fund of 3-6 months of expenses.",
            "Increase retirement contributions if possible.",
            "Look for ways to reduce monthly expenses by 10-15%.",
            "Consider additional income sources or career advancement opportunities."
        ]
    }
    return advice_map[prediction]

def validate_input(user_data):
    required_fields = ['age', 'income', 'savings', 'debt', 'expenses', 'investmentRisk', 'dependents']
    for field in required_fields:
        if field not in user_data or user_data[field] == '' or user_data[field] is None:
            raise ValueError(f"Missing or empty value for {field}")
        try:
            float_value = float(user_data[field])
            if float_value < 0:
                raise ValueError(f"Negative value not allowed for {field}")
        except ValueError:
            raise ValueError(f"Invalid numeric value for {field}")

def main():
    try:
        user_data = json.loads(sys.argv[1])
        
        # Simplified validation
        required_fields = ['age', 'income', 'savings', 'debt', 'expenses', 'investmentRisk', 'dependents']
        if not all(field in user_data and str(user_data[field]).strip() for field in required_fields):
            raise ValueError("Missing required fields")

        user_input = np.array([[float(user_data[field]) for field in required_fields]])
        
        X_train, y_train = generate_training_data()
        model = RandomForestClassifier(n_estimators=50, max_depth=10)  # Reduced complexity
        scaler = StandardScaler()
        
        X_train_scaled = scaler.fit_transform(X_train)
        model.fit(X_train_scaled, y_train)
        
        prediction = model.predict(scaler.transform(user_input))[0]
        
        advice = generate_basic_advice(prediction, user_data)  # Remove dynamic advice for now
        print(json.dumps(advice))
        
    except Exception as e:
        print(json.dumps(["Error generating advice. Please try again."]))
        sys.exit(1)

if __name__ == "__main__":
    main()
