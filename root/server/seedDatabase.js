const mongoose = require("mongoose")
const { Exercise } = require("./models/exercise")
const { Workout } = require("./models/workout")
const presetExercises = require("./exercises.json")
const { create } = require("lodash")
console.log(Exercise)

mongoose.connect('mongodb://localhost/tracker')
    .then(() => {
        console.log('Connected to MongoDB for seeding...')
        seedDatabase();
    })
    .catch(err => console.error('Could not connect to MongoDB for seeding...', err))

const adminID = new mongoose.Types.ObjectId('67358f7f63abd61be9b451b2')

// Convert the array of exercises into a dictionary for quick lookup by name
const exerciseDictionary = presetExercises.reduce((dict, exercise) => {
    dict[exercise.name] = exercise;
    return dict;
}, {});

// Function for creating the original preset exercises
const createPresetExercises = async () => {
    try {
        await Exercise.insertMany(presetExercises.map(exercise => ({
            ...exercise,
            _id: new mongoose.Types.ObjectId(),
            isPreset: true
        })));
        console.log('Preset exercises created successfully');
    } catch (err) {
        console.error('Error creating preset exercises:', err);
    }
};

// Function for creating a copy of an exercise
const createExerciseCopy = async (exerciseName) => {
    const exercise = exerciseDictionary[exerciseName];
    if (!exercise) {
        throw new Error(`Exercise with name ${exerciseName} not found in dictionary`);
    }

    const exerciseCopy = new Exercise({
        ...exercise,
        _id: new mongoose.Types.ObjectId(), // Create a new unique ID for the copy
        numOfSets: 3, // Add numOfSets property
        isPreset: false // Mark as not a preset
    });
    await exerciseCopy.save();
    return exerciseCopy._id;
};

const createPresetWorkouts = async () => {
    try {
        const workout1 = new Workout({
            userId: adminID,
            name: "Push Day",
            focusGroup: ["Chest", "Shoulders", "Triceps"],
            notes: "",
            exercises: [
                await createExerciseCopy("Push-Up"),
                await createExerciseCopy("Bench Press"),
                await createExerciseCopy("Overhead Tricep Extension"),
                await createExerciseCopy("Shoulder Press"),
                await createExerciseCopy("Arnold Press"),
                await createExerciseCopy("Lateral Raise")
            ].map(exercise => exercise._id),
            isTemplate: true,
            date: new Date('2024-11-13T07:05:05.483Z'),
            createdAt: new Date('2024-11-13T07:05:05.483Z'),
            updatedAt: new Date('2024-11-14T04:24:21.584Z')
        });

        const workout2 = new Workout({
            userId: adminID,
            name: "Pull Day",
            focusGroup: ["Back", "Biceps"],
            notes: "",
            exercises: [
                await createExerciseCopy("Pull-Up"),
                await createExerciseCopy("Lat Pulldown"),
                await createExerciseCopy("Cable Row"),
                await createExerciseCopy("Bicep Curl"),
                await createExerciseCopy("Hammer Curl"),
                await createExerciseCopy("Spider Curl")
            ].map(exercise => exercise._id),
            isTemplate: true,
            date: new Date('2024-11-13T21:52:32.831Z'),
            createdAt: new Date('2024-11-13T21:52:32.832Z'),
            updatedAt: new Date('2024-11-14T04:10:53.311Z')
        });

        const workout3 = new Workout({
            userId: adminID,
            name: "Leg Day (Quads)",
            focusGroup: ["Quadriceps", "Calves"],
            notes: "",
            exercises: [
                await createExerciseCopy("Squat"),
                await createExerciseCopy("Lunges"),
                await createExerciseCopy("Leg Press"),
                await createExerciseCopy("Leg Extensions"),
                await createExerciseCopy("Standing Calf Raise"),
                await createExerciseCopy("Seated Calf Raise")
            ].map(exercise => exercise._id),
            isTemplate: true,
            date: new Date('2024-11-13T21:53:42.372Z'),
            createdAt: new Date('2024-11-13T21:53:42.372Z'),
            updatedAt: new Date('2024-11-14T04:23:26.943Z')
        });

        const workout4 = new Workout({
            userId: adminID,
            name: "Leg Day (Hams and Glutes)",
            focusGroup: ["Hamstrings", "Glutes", "Calves"],
            notes: "",
            exercises: [
                await createExerciseCopy("Romanian Deadlift"),
                await createExerciseCopy("Hamstring Curl"),
                await createExerciseCopy("Bulgarian Split Squat"),
                await createExerciseCopy("Hip Thrust"),
                await createExerciseCopy("Glute Bridge")
            ].map(exercise => exercise._id),
            isTemplate: true,
            date: new Date('2024-11-13T21:57:19.835Z'),
            createdAt: new Date('2024-11-13T21:57:19.835Z'),
            updatedAt: new Date('2024-11-14T04:28:47.141Z')
        });

        const workout5 = new Workout({
            userId: adminID,
            name: "Upper Day",
            focusGroup: ["Chest", "Back", "Shoulders", "Triceps", "Biceps"],
            notes: "",
            exercises: [
                await createExerciseCopy("Bench Press"),
                await createExerciseCopy("Machine Row"),
                await createExerciseCopy("Shoulder Press"),
                await createExerciseCopy("Incline Dumbbell Press"),
                await createExerciseCopy("Lat Pulldown"),
                await createExerciseCopy("Lateral Raise"),
                await createExerciseCopy("Tricep Pushdown"),
                await createExerciseCopy("Bicep Curl")
            ].map(exercise => exercise._id),
            isTemplate: true,
            date: new Date('2024-11-13T21:57:19.835Z'),
            createdAt: new Date('2024-11-13T21:57:19.835Z'),
            updatedAt: new Date('2024-11-14T04:28:47.141Z')
        });

        const workout6 = new Workout({
            userId: adminID,
            name: "Lower Day",
            focusGroup: ["Quadriceps", "Hamstrings", "Glutes", "Calves"],
            notes: "",
            exercises: [
                await createExerciseCopy("Squat"),
                await createExerciseCopy("Romanian Deadlift"),
                await createExerciseCopy("Leg Press"),
                await createExerciseCopy("Hamstring Curl"),
                await createExerciseCopy("Standing Calf Raise")
            ].map(exercise => exercise._id),
            isTemplate: true,
            date: new Date('2024-11-13T21:57:19.835Z'),
            createdAt: new Date('2024-11-13T21:57:19.835Z'),
            updatedAt: new Date('2024-11-14T04:28:47.141Z')
        });

        const workout7 = new Workout({
            userId: adminID,
            name: "Full Body",
            focusGroup: ["Chest", "Back", "Shoulders", "Triceps", "Biceps", "Quadriceps", "Hamstrings", "Glutes", "Calves"],
            notes: "",
            exercises: [
                await createExerciseCopy("Bench Press"),
                await createExerciseCopy("Pull-Up"),
                await createExerciseCopy("Shoulder Press"),
                await createExerciseCopy("Tricep Pushdown"),
                await createExerciseCopy("Bicep Curl"),
                await createExerciseCopy("Squat"),
                await createExerciseCopy("Romanian Deadlift"),
                await createExerciseCopy("Leg Press"),
                await createExerciseCopy("Hamstring Curl"),
                await createExerciseCopy("Standing Calf Raise")
            ].map(exercise => exercise._id),
            isTemplate: true,
            date: new Date('2024-11-13T21:57:19.835Z'),
            createdAt: new Date('2024-11-13T21:57:19.835Z'),
            updatedAt: new Date('2024-11-14T04:28:47.141Z')
        });

        await workout1.save();
        await workout2.save();
        await workout3.save();
        await workout4.save();
        await workout5.save();
        await workout6.save();
    } catch (err) {
        console.error('Error creating preset workouts:', err);
    }
}

const seedDatabase = async () => {
    try {
        await createPresetExercises();
        await createPresetWorkouts();
        console.log('Database seeded successfully');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        mongoose.disconnect();
    }

};

module.exports = seedDatabase;
