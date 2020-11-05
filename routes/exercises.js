const router = require("express").Router();
const Exercise = require("../models/exercise.model");
const Workout = require("../models/workout.model");
const authenticateJWT = require("../middleware/authenticate");

router.route("/:id").get(authenticateJWT, (req, res) => {
  Exercise.findById(req.params.id)
    .then((exercise) => res.json(exercise))
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/add").post(authenticateJWT, (req, res) => {
  const workoutId = req.body.workoutId;
  const name = req.body.name;
  const description = req.body.description;
  const sets = req.body.sets;

  const newExercise = new Exercise({
    user: req.user.userId,
    name: name,
    description: description,
    sets: sets,
  });

  newExercise
    .save()
    .then(() => {
      Workout.findById(workoutId)
        .then((workout) => {
          if (workout.user.toString() !== req.user.userId) {
            return res.sendStatus(403);
          }

          if (workout.exerciseIds.includes(newExercise.id)) {
            return res
              .status(400)
              .json(
                "Error: User is attempting to add an exercise that is already in the workout"
              );
          }
          workout.exerciseIds.push(newExercise.id);

          workout
            .save()
            .then(() => res.json("Exercise successfully created!"))
            .catch((err) => res.status(400).json("Error: " + err));
        })
        .catch((err) => res.status(404).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/addBulk").post(authenticateJWT, async (req, res) => {
  const workoutId = req.body.workoutId;
  const exercises = req.body.exercises;

  for (let i = 0; i < exercises.length; i++) {
    let newExercise = new Exercise({
      user: req.user.userId,
      name: exercises[i].name,
      description: exercises[i].description,
      sets: exercises[i].sets,
    });

    await newExercise
      .save()
      .then(async () => {
        await Workout.findById(workoutId)
          .then(async (workout) => {
            if (workout.user.toString() !== req.user.userId) {
              return res.sendStatus(403);
            }

            if (workout.exerciseIds.includes(newExercise.id)) {
              return res
                .status(400)
                .json(
                  "Error: User is attempting to add an exercise that is already in the workout"
                );
            }
            workout.exerciseIds.push(newExercise.id);

            await workout
              .save()
              .catch((err) => res.status(400).json("Error: " + err));
          })
          .catch((err) => res.status(404).json("Error: " + err));
      })
      .catch((err) => res.status(400).json("Error: " + err));
  }

  res.json("Exercises Added");
});

router.route("/update/:id").put(authenticateJWT, (req, res) => {
  Exercise.findById(req.params.id)
    .then((exercise) => {
      if (exercise.user.toString() !== req.user.userId) {
        return res.sendStatus(403);
      }

      if (req.body.name) exercise.name = req.body.name;
      if (req.body.description) exercise.description = req.body.description;
      if (req.body.sets) exercise.sets = req.body.sets;

      exercise
        .save()
        .then(() => res.json("Exercise updated!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

module.exports = router;
