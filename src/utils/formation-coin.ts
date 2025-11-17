export const formatCoin = (value: number): string => {
  if (value >= 1_000_000_000) {
    const num = Math.floor((value / 1_000_000_000) * 100) / 100;
    return `${num}B`;
  }

  if (value >= 1_000_000) {
    const num = Math.floor((value / 1_000_000) * 100) / 100;
    return `${num}M`;
  }

  if (value >= 1_000) {
    const num = Math.floor((value / 1_000) * 100) / 100;
    return `${num}K`;
  }

  return value.toString();
};
