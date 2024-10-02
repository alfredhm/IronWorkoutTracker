const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    const hoursPart = hrs > 0 ? `${hrs}h ` : '';
    const minutesPart = mins > 0 ? `${mins}m` : '';
    
    return `${hoursPart}${minutesPart}`.trim();
};

export default formatTime