const BASE_URL = import.meta.env.VITE_BASE_URL;

export const selectItems = async (token: string) => {
  const response = await fetch(`${BASE_URL}/item`, {
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

export const createItem = async (token: string, itemId: number) => {
  const response = await fetch(`${BASE_URL}/item/${itemId}`, {
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

export const updateItem = async (token: string, itemId: number) => {
  const response = await fetch(`${BASE_URL}/item/${itemId}`, {
    method: 'PATCH',
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
