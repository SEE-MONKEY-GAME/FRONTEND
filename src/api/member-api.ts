const BASE_URL = import.meta.env.VITE_BASE_URL;

export const selectMemberData = async () => {
  const response = await fetch(`${BASE_URL}/member`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`ERROR: ${response.status}`);
  }

  return response.json();
};
