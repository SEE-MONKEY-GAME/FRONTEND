export const formatCoin = (value: number): string => {
  if (value >= 1_000_000) {
    const num = Math.floor((value / 1_000_000) * 100) / 100;
    return `${num}m`;
  }

  if (value >= 1_000) {
    const num = Math.floor((value / 1_000) * 100) / 100;
    return `${num}k`;
  }

  return value.toString();
};
