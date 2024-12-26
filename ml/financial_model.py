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
def generate_training_data(n_samples=1000):
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

def generate_dynamic_advice(user_data, prediction, model_confidence):
    try:
        # First get basic advice
        basic_advice = generate_basic_advice(prediction, user_data)
        
        # If OpenAI is not configured or fails, return basic advice
        if not openai.api_key or openai.api_key == 'your-api-key-here':
            return basic_advice
            
        # Create a detailed prompt for GPT
        financial_status = ["good", "concerning due to high debt", "concerning due to high expenses", "moderate"][int(prediction)]
        
        prompt = f"""
        As a financial advisor, generate personalized financial advice for someone with the following profile:
        - Age: {user_data['age']}
        - Monthly Income: ${user_data['income']}
        - Total Savings: ${user_data['savings']}
        - Total Debt: ${user_data['debt']}
        - Monthly Expenses: ${user_data['expenses']}
        - Risk Tolerance: {user_data['investmentRisk']}/10
        - Number of Dependents: {user_data['dependents']}

        Their financial health is {financial_status}.
        
        Provide 3 specific, actionable pieces of financial advice tailored to their situation.
        Focus on practical steps they can take to improve their financial well-being.
        """

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional financial advisor providing specific, personalized advice."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            # Parse the response and split into list of advice
            advice = response.choices[0].message.content.strip().split('\n')
            # Filter out empty strings and clean up numbering
            advice = [a.strip().lstrip('123.-) ') for a in advice if a.strip()]
            return advice[:3]  # Return top 3 pieces of advice
            
        except Exception as e:
            # Fallback to basic advice if API fails
            return generate_basic_advice(prediction, user_data)
    except Exception as e:
        print(f"Error in dynamic advice: {e}", file=sys.stderr)
        return generate_basic_advice(prediction, user_data)

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
        # Get and validate user data
        user_data = json.loads(sys.argv[1])
        validate_input(user_data)
        
        # Prepare user input
        user_input = np.array([[
            float(user_data['age']),
            float(user_data['income']),
            float(user_data['savings']),
            float(user_data['debt']),
            float(user_data['expenses']),
            float(user_data['investmentRisk']),
            float(user_data['dependents'])
        ]])
        
        # Generate and prepare training data
        X_train, y_train = generate_training_data()
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        
        # Train the model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train_scaled, y_train)
        
        # Make prediction
        user_input_scaled = scaler.transform(user_input)
        prediction = model.predict(user_input_scaled)[0]
        probabilities = model.predict_proba(user_input_scaled)[0]
        confidence = np.max(probabilities)
        
        # Generate dynamic advice
        advice = generate_dynamic_advice(user_data, prediction, confidence)
        print(json.dumps(advice))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "status": "error"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
