// Helper function to generate days of the month
const generateCalendarDays = (currentDate) => {
    const startOfMonth = currentDate.startOf('month').startOf('week');
    const endOfMonth = currentDate.endOf('month').endOf('week');
    const days = [];

    let day = startOfMonth;
    while (day.isBefore(endOfMonth)) {
        days.push(day);
        day = day.add(1, 'day');
    }

    return days;
};

export default generateCalendarDays