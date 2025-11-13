const BASE_URL = import.meta.env.VITE_BASE_URL;

export const createFeedback = async (content: string, createdAt: string) => {
  const response = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Hash 1`,
    },
    body: JSON.stringify({ content, createdAt }),
  });

  if (!response.ok) {
    throw new Error(`ERROR: ${response.status}`);
  }

  return response.json();
};
