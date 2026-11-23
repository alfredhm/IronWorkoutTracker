const getElapsedDurationSec = (startedAt, endedAt = Date.now()) => {
  const startTime = Number(startedAt);
  const endTime = Number(endedAt);
  if (
    !Number.isFinite(startTime) ||
    !Number.isFinite(endTime) ||
    endTime < startTime
  ) {
    return 0;
  }
  return Math.max(1, Math.floor((endTime - startTime) / 1000));
};

export default getElapsedDurationSec;
