const formatTime = (totalSeconds) => {
  const seconds = Number(totalSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return "0m";

  const totalMinutes = Math.floor(seconds / 60);
  if (totalMinutes === 0) return "<1m";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
};

export default formatTime;
