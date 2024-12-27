export const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

export type Routes = {
  home: string;
  results: string;
  api: {
    getAdvice: string;
  };
};

export const routes: Routes = {
  home: '/',
  results: '/results',
  api: {
    getAdvice: '/api/advice'
  }
};
