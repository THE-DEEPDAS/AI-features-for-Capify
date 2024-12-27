import type { NextApiRequest, NextApiResponse } from 'next';
import { PythonShell, Options } from 'python-shell';
import path from 'path';

const getFallbackAdvice = (userData: any) => {
  return [
    "Build an emergency fund",
    `Save ${Math.round(userData.income * 0.2)} monthly`,
    "Review your expenses",
    "Create a budget",
    "Consider financial planning"
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
      pythonPath: 'python3',
      pythonOptions: ['-u'],
      scriptPath: path.join(process.cwd(), 'ml'),
      args: [JSON.stringify(userData)]
    };

    try {
      const results = await Promise.race([
        PythonShell.run('financial_model.py', options),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 4000))
      ]);

      if (!results?.[0]) {
        throw new Error('No results');
      }

      const advice = JSON.parse(results[0]);
      return res.status(200).json({ 
        advice: Array.isArray(advice) ? advice.slice(0, 5) : getFallbackAdvice(userData),
        status: 'success'
      });

    } catch (error) {
      return res.status(200).json({ 
        advice: getFallbackAdvice(userData),
        status: 'success',
        fallback: true
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      message: 'Failed to generate advice',
      status: 'error'
    });
  }
}
