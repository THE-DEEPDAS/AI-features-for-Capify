import type { NextApiRequest, NextApiResponse } from 'next';
import { PythonShell } from 'python-shell';
import path from 'path';
import config from '../../config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', config.baseUrl);
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Add a small delay to ensure proper state transitions
    await new Promise(resolve => setTimeout(resolve, 500));

    const userData = req.body;
    
    // Validate data before sending to Python
    const requiredFields = ['age', 'income', 'savings', 'debt', 'expenses', 'investmentRisk', 'dependents'];
    for (const field of requiredFields) {
      if (!userData[field] || userData[field].trim() === '') {
        return res.status(400).json({ 
          message: `Missing or empty value for ${field}`,
          field 
        });
      }
    }

    const options = {
      mode: "text" as "text",
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(process.cwd(), 'ml'),
      args: [JSON.stringify(userData)]
    };

    const result = await new Promise((resolve, reject) => {
      PythonShell.run('financial_model.py', options, (err, results) => {
        if (err) reject(err);
        // Get the last output from Python
        const lastResult = results ? results[results.length - 1] : '[]';
        try {
          const parsed = JSON.parse(lastResult);
          // Ensure we have an array of advice
          if (!Array.isArray(parsed)) {
            throw new Error('Invalid advice format');
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error('Invalid response from Python script'));
        }
      });
    });

    // Ensure we have at least 5 items
    const advice = Array.isArray(result) ? result : [];
    if (advice.length < 5) {
      while (advice.length < 5) {
        advice.push("Consider consulting with a financial advisor for more personalized advice.");
      }
    }

    return res.status(200).json({ advice: advice.slice(0, 5) });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: String(error) 
    });
  }
}
