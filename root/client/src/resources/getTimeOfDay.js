// Converts timestamp to time of day
const getTimeOfDay = (timestamp) => {
    const date = new Date(timestamp);
    const hour = date.getHours();      
    if (hour >= 5 && hour < 12) {
        return "Morning";
    } else if (hour >= 12 && hour < 17) {
        return "Afternoon";
    } else {
        return "Evening";
    }
};

export default getTimeOfDay;