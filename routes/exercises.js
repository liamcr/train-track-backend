const router = require("express").Router();
const Exercise = require("../models/exercise.model");
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
  const index = req.body.index;

  const newExercise = new Exercise({
    user: req.user.userId,
    workout: workoutId,
    name,
    description,
    sets,
    index,
  });

  newExercise
    .save()
    .then(() => res.json("Exercise successfully created!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/addBulk").post(authenticateJWT, async (req, res) => {
  const workoutId = req.body.workoutId;
  const exercises = req.body.exercises;

  for (let i = 0; i < exercises.length; i++) {
    let newExercise = new Exercise({
      user: req.user.userId,
      workout: workoutId,
      name: exercises[i].name,
      description: exercises[i].description,
      sets: exercises[i].sets,
      index: i,
    });

    await newExercise
      .save()
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
