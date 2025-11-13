const BASE_URL = import.meta.env.VITE_BASE_URL;

export const selectMemberData = async () => {
  const response = await fetch(`${BASE_URL}/member`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Hash 1`,
    },
  });

  if (!response.ok) {
    throw new Error(`ERROR: ${response.status}`);
  }

  return response.json();
};

export const updateSound = async (type: string, enabled: boolean) => {
  const response = await fetch(`${BASE_URL}/member/sound`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Hash 1`,
    },
    body: JSON.stringify({ type, enabled }),
  });

  if (!response.ok) {
    throw new Error(`ERROR: ${response.status}`);
  }

  return response.json();
};
