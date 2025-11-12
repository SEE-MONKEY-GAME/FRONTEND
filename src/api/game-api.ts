const BASE_URL = import.meta.env.VITE_BASE_URL;

export const createGameResult = async (score: number, coin: number) => {
  console.log(score, coin);
  const response = await fetch(`${BASE_URL}/game`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ score, coin }),
  });

  if (!response.ok) {
    console.log(response);
    throw new Error(`ERROR: ${response.status}`);
  }

  return response.json();
};
