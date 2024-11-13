    // Converts an isoString into MM/DD format
    const convertToMonthDay = (isoString) => {
        const date = new Date(isoString);
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate(); 
    
        return `${month}/${day}`;
    }

    export default convertToMonthDay