const BASE_URL = import.meta.env.VITE_BASE_URL;

export const selectCostumes = async () => {
  const response = await fetch(`${BASE_URL}/costume`, {
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

export const createCostume = async (costumeId: number) => {
  const response = await fetch(`${BASE_URL}/costume/${costumeId}`, {
    method: 'POST',
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

export const putCostume = async (type: string, costumeId: number) => {
  const response = await fetch(`${BASE_URL}/costume/equipped/${type}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Hash 1`,
    },
    body: JSON.stringify({ costumeId }),
  });

  if (!response.ok) {
    throw new Error(`ERROR: ${response.status}`);
  }

  return response.json();
};

export const deleteCostume = async (type: string) => {
  const response = await fetch(`${BASE_URL}/costume/equipped/${type}`, {
    method: 'DELETE',
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
