const BASE_URL = import.meta.env.VITE_BASE_URL;

export const selectDailyCheckin = async (token: string) => {
  const response = await fetch(`${BASE_URL}/member/daily-checkin`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Hash ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`ERROR: ${response.status}`);
  }

  return response.json();
};

export const createDailyCheckin = async (token: string) => {
  const response = await fetch(`${BASE_URL}/member/daily-checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Hash ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`ERROR: ${response.status}`);
  }

  return response.json();
};
