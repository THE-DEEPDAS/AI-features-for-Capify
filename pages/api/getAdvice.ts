import type { NextApiRequest, NextApiResponse } from 'next';
import { PythonShell } from 'python-shell';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userData = req.body;
    
    const options = {
      mode: "text" as "text",
      pythonPath: process.env.VERCEL ? '/var/lang/bin/python3' : 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(process.cwd(), 'ml'),
      args: [JSON.stringify(userData)]
    };

    const results = await new Promise<string[]>((resolve, reject) => {
      PythonShell.run('financial_model.py', options, (err, output) => {
        if (err) reject(err);
        resolve(output || []);
      });
    });

    const lastResult = results[results.length - 1];
    const advice = JSON.parse(lastResult);

    if (!Array.isArray(advice)) {
      throw new Error('Invalid advice format');
    }

    return res.status(200).json({ 
      advice: advice.slice(0, 5),
      status: 'success'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      message: 'Failed to generate advice',
      status: 'error'
    });
  }
}
