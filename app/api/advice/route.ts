import { NextResponse } from 'next/server';
import { PythonShell, Options } from 'python-shell';
import { join } from 'path';

export const runtime = 'nodejs';  // Changed back to nodejs

const getFallbackAdvice = (userData: any) => {
  return [
    "Build an emergency fund",
    `Save ${Math.round(userData.income * 0.2)} monthly`,
    "Review your expenses",
    "Create a budget",
    "Consider financial planning"
  ];
};

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    
    const options: Options = {
      mode: "text",
      pythonPath: 'python3',
      pythonOptions: ['-u'],
      scriptPath: join(process.cwd(), 'ml'),
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
      return NextResponse.json({ 
        advice: Array.isArray(advice) ? advice.slice(0, 5) : getFallbackAdvice(userData),
        status: 'success'
      });

    } catch (error) {
      return NextResponse.json({ 
        advice: getFallbackAdvice(userData),
        status: 'success',
        fallback: true
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      message: 'Failed to generate advice',
      status: 'error'
    }, { status: 500 });
  }
}
