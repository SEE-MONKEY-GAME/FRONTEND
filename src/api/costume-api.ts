const BASE_URL = import.meta.env.VITE_BASE_URL;

export const selectCostumes = async (token: string) => {
  const response = await fetch(`${BASE_URL}/costume`, {
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

export const createCostume = async (token: string, costumeId: number) => {
  const response = await fetch(`${BASE_URL}/costume/${costumeId}`, {
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

export const putCostume = async (token: string, type: string, costumeId: number) => {
  const response = await fetch(`${BASE_URL}/costume/equipped/${type}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Hash ${token}`,
    },
    body: JSON.stringify({ costumeId }),
  });

  if (!response.ok) {
    throw new Error(`ERROR: ${response.status}`);
  }

  return response.json();
};

export const deleteCostume = async (token: string, type: string) => {
  const response = await fetch(`${BASE_URL}/costume/equipped/${type}`, {
    method: 'DELETE',
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
