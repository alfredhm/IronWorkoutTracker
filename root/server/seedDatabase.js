const mongoose = require("mongoose")
const { Exercise } = require("./models/exercise")
const { Workout } = require("./models/workout")
const presetExercises = require("./exercises.json")

// Convert the array of exercises into a dictionary for quick lookup by name
const exerciseDictionary = presetExercises.reduce((dict, exercise) => {
    dict[exercise.name] = exercise;
    return dict;
}, {});

// Function for creating the original preset exercises
const createPresetExercises = async (userId) => {
    try {
        await Exercise.insertMany(presetExercises.map(exercise => ({
            ...exercise,
            _id: new mongoose.Types.ObjectId(),
            isPreset: true,
            userId: userId
        })));
        console.log('Preset exercises created successfully');
    } catch (err) {
        console.error('Error creating preset exercises:', err);
    }
};

// Function for creating a copy of an exercise
const createExerciseCopy = async (exerciseName, userId) => {
    const exercise = exerciseDictionary[exerciseName];
    if (!exercise) {
        throw new Error(`Exercise with name ${exerciseName} not found in dictionary`);
    }

    const exerciseCopy = new Exercise({
        ...exercise,
        userId: userId, // Copy the original user ID
        _id: new mongoose.Types.ObjectId(), // Create a new unique ID for the copy
        numOfSets: 3, // Add numOfSets property
        isPreset: false // Mark as not a preset
    });
    await exerciseCopy.save();
    return exerciseCopy._id;
};

const createPresetWorkouts = async (userId) => {
    try {
        const workout1 = new Workout({
            userId: userId,
            name: "Push Day",
            focusGroup: ["Chest", "Shoulders", "Triceps"],
            notes: "",
            exercises: [
                await createExerciseCopy("Push-Up", userId),
                await createExerciseCopy("Bench Press", userId),
                await createExerciseCopy("Overhead Tricep Extension", userId),
                await createExerciseCopy("Shoulder Press", userId),
                await createExerciseCopy("Arnold Press", userId),
                await createExerciseCopy("Lateral Raise", userId)
            ].map(exercise => exercise._id),
            isTemplate: true,
        });

        const workout2 = new Workout({
            userId: userId,
            name: "Pull Day",
            focusGroup: ["Back", "Biceps"],
            notes: "",
            exercises: [
                await createExerciseCopy("Pull-Up", userId),
                await createExerciseCopy("Lat Pulldown", userId),
                await createExerciseCopy("Cable Row", userId),
                await createExerciseCopy("Bicep Curl", userId),
                await createExerciseCopy("Hammer Curl", userId),
                await createExerciseCopy("Spider Curl", userId)
            ].map(exercise => exercise._id),
            isTemplate: true,
        });

        const workout3 = new Workout({
            userId: userId,
            name: "Leg Day (Quads)",
            focusGroup: ["Quadriceps", "Calves"],
            notes: "",
            exercises: [
                await createExerciseCopy("Squat", userId),
                await createExerciseCopy("Lunges", userId),
                await createExerciseCopy("Leg Press", userId),
                await createExerciseCopy("Leg Extensions", userId),
                await createExerciseCopy("Standing Calf Raise", userId),
                await createExerciseCopy("Seated Calf Raise", userId)
            ].map(exercise => exercise._id),
            isTemplate: true,
        });

        const workout4 = new Workout({
            userId: userId,
            name: "Leg Day (Hams and Glutes)",
            focusGroup: ["Hamstrings", "Glutes", "Calves"],
            notes: "",
            exercises: [
                await createExerciseCopy("Romanian Deadlift", userId),
                await createExerciseCopy("Hamstring Curl", userId),
                await createExerciseCopy("Bulgarian Split Squat", userId),
                await createExerciseCopy("Hip Thrust", userId),
                await createExerciseCopy("Glute Bridge", userId)
            ].map(exercise => exercise._id),
            isTemplate: true,
        });

        const workout5 = new Workout({
            userId: userId,
            name: "Upper Day",
            focusGroup: ["Chest", "Back", "Shoulders", "Triceps", "Biceps"],
            notes: "",
            exercises: [
                await createExerciseCopy("Bench Press", userId),
                await createExerciseCopy("Machine Row", userId),
                await createExerciseCopy("Shoulder Press", userId),
                await createExerciseCopy("Incline Dumbbell Press", userId),
                await createExerciseCopy("Lat Pulldown", userId),
                await createExerciseCopy("Lateral Raise", userId),
                await createExerciseCopy("Tricep Pushdown", userId),
                await createExerciseCopy("Bicep Curl", userId)
            ].map(exercise => exercise._id),
            isTemplate: true,
        });

        const workout6 = new Workout({
            userId: userId,
            name: "Lower Day",
            focusGroup: ["Quadriceps", "Hamstrings", "Glutes", "Calves"],
            notes: "",
            exercises: [
                await createExerciseCopy("Squat", userId),
                await createExerciseCopy("Romanian Deadlift", userId),
                await createExerciseCopy("Leg Press", userId),
                await createExerciseCopy("Hamstring Curl", userId),
                await createExerciseCopy("Standing Calf Raise", userId)
            ].map(exercise => exercise._id),
            isTemplate: true,
        });

        const workout7 = new Workout({
            userId: userId,
            name: "Full Body",
            focusGroup: ["Chest", "Back", "Shoulders", "Triceps", "Biceps", "Quadriceps", "Hamstrings", "Glutes", "Calves"],
            notes: "",
            exercises: [
                await createExerciseCopy("Bench Press", userId),
                await createExerciseCopy("Pull-Up", userId),
                await createExerciseCopy("Shoulder Press", userId),
                await createExerciseCopy("Tricep Pushdown", userId),
                await createExerciseCopy("Bicep Curl", userId),
                await createExerciseCopy("Squat", userId),
                await createExerciseCopy("Romanian Deadlift", userId),
                await createExerciseCopy("Leg Press", userId),
                await createExerciseCopy("Hamstring Curl", userId),
                await createExerciseCopy("Standing Calf Raise", userId)
            ].map(exercise => exercise._id),
            isTemplate: true,
        });

        await workout1.save();
        await workout2.save();
        await workout3.save();
        await workout4.save();
        await workout5.save();
        await workout6.save();
        await workout7.save();
    } catch (err) {
        console.error('Error creating preset workouts:', err);
    }
}

const seedDatabase = async (userId) => {
    console.log(userId)
    try {
        await createPresetExercises(userId);
        await createPresetWorkouts(userId);
        console.log('Database seeded successfully');
    } catch (err) {
        console.error('Error seeding database:', err);
    }
};

module.exports = seedDatabase;
