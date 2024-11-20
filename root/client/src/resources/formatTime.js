// Takes seconds and puts them in 0m format
const formatTime = (totalSeconds) => {
    if (totalSeconds === 0) {
        return 0
    }
    const mins = Math.floor(totalSeconds / 60);
    return `${mins}m`;
};

export default formatTime;
