  // Function that shortens length of focusGroups if it has more than 5 exercises to limit the number of icons displayed on each workout
const getFocusCount = (workout) => {
    if (workout.focusGroup.length > 5) {
        return 4
    } else {
        return workout.focusGroup.length
    }
} 

export default getFocusCount;