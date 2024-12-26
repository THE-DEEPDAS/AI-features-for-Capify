import type { NextApiRequest, NextApiResponse } from 'next';
import { PythonShell, Options } from 'python-shell';
import path from 'path';

const getFallbackAdvice = (userData: any) => {
  return [
    "Consider building an emergency fund of 3-6 months of expenses.",
    `With your monthly income of $${userData.income}, try to save at least ${Math.round(userData.income * 0.2)}`,
    "Look into debt consolidation options if you have high-interest debt.",
    "Review and optimize your monthly expenses.",
    "Consider consulting with a financial advisor for personalized guidance."
  ];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userData = req.body;
    
    const options: Options = {
      mode: "text",
      pythonPath: process.env.VERCEL ? '/var/lang/bin/python3' : 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(process.cwd(), 'ml'),
      args: [JSON.stringify(userData)]
    };

    try {
      const results = await PythonShell.run('financial_model.py', options);
      
      if (!results || !Array.isArray(results) || results.length === 0) {
        throw new Error('No results returned from Python script');
      }

      const lastResult = results[results.length - 1];
      if (!lastResult) {
        throw new Error('Invalid result format');
      }

      const advice = JSON.parse(lastResult);

      if (!Array.isArray(advice)) {
        throw new Error('Invalid advice format');
      }

      return res.status(200).json({ 
        advice: advice.slice(0, 5),
        status: 'success'
      });

    } catch (pythonError) {
      console.warn('Python execution failed, using fallback:', pythonError);
      return res.status(200).json({ 
        advice: getFallbackAdvice(userData),
        status: 'success',
        fallback: true
      });
    }
    /* good */
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      message: 'Failed to generate advice',
      status: 'error'
    });
  }
}
