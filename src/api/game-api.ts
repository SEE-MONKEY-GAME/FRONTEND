const BASE_URL = import.meta.env.VITE_BASE_URL;

export const createGameResult = async (score: number, coin: number) => {
  const response = await fetch(`${BASE_URL}/game`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Hash 1`,
    },
    body: JSON.stringify({ score, coin }),
  });

  if (!response.ok) {
    throw new Error(`ERROR: ${response.status}`);
  }

  return response.json();
};
