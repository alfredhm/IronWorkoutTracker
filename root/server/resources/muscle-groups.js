const muscleGroupsObject =  [
    {
    name: "Upper Body",
    sub_groups: [
        {
            name: "Chest",
            description: "Includes the pectoral muscles (pectoralis major and minor). Exercises: bench press, push-ups, chest fly."
        },
        {
            name: "Back",
            description: "Includes the latissimus dorsi, trapezius, rhomboids, and erector spinae. Exercises: pull-ups, rows, lat pulldown."
        },
        {
            name: "Shoulders",
            description: "Focuses on the deltoid muscles (anterior, lateral, and posterior). Exercises: shoulder press, lateral raises, front raises."
        },
        {
        name: "Arms",
        sub_groups: [
                {
                    name: "Biceps",
                    description: "Located at the front of the upper arm. Exercises: bicep curls, chin-ups, hammer curls."
                },
                {
                    name: "Triceps",
                    description: "Located at the back of the upper arm. Exercises: tricep dips, tricep pushdowns, skull crushers."
                },
                {
                    name: "Forearms",
                    description: "Involves the flexor and extensor muscles of the forearm. Exercises: wrist curls, reverse curls, farmer's walk."
                }
            ]
            }
        ]
    },
    {
        name: "Core",
        sub_groups: [
            {
                name: "Abdominals",
                description: "Includes the rectus abdominis, obliques, and transverse abdominis. Exercises: crunches, leg raises, Russian twists."
            },
            {
                name: "Obliques",
                description: "Located on the sides of the abdomen. Exercises: side planks, oblique crunches, bicycle crunches."
            },
            {
                name: "Lower Back",
                description: "Focuses on the erector spinae and other stabilizing muscles. Exercises: back extensions, deadlifts, Superman."
            }
        ]
    },
    {
        name: "Lower Body",
        sub_groups: [
            {
                name: "Quadriceps",
                description: "Located at the front of the thigh. Exercises: squats, lunges, leg press."
            },
            {
                name: "Hamstrings",
                description: "Located at the back of the thigh. Exercises: deadlifts, leg curls, glute bridge."
            },
            {
                name: "Glutes",
                description: "Includes the gluteus maximus, medius, and minimus. Exercises: hip thrusts, squats, step-ups."
            },
            {
                name: "Calves",
                description: "Includes the gastrocnemius and soleus muscles. Exercises: calf raises, jump rope, seated calf raises."
            }
        ]
    }
];
 
const muscleGroups = [
    "Chest",
    "Back",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Forearms",
    "Abdominals",
    "Obliques",
    "Lower Back",
    "Quadriceps",
    "Hamstrings",
    "Glutes",
    "Calves"
];

module.exports = muscleGroups
