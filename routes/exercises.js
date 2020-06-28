const router = require("express").Router();
const Exercise = require("../models/exercise.model");
const Workout = require("../models/workout.model");
const authenticateJWT = require("../middleware/authenticate");

router.route("/:id").get(authenticateJWT, (req, res) => {
  Exercise.findById(req.params.id)
    .then((exercise) => res.json(exercise))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/add").post((req, res) => {
  const workoutId = req.body.workoutId;
  const name = req.body.name;
  const description = req.body.description;
  const sets = req.body.sets;

  const newExercise = new Exercise({
    name: name,
    description: description,
    sets: sets,
  });

  newExercise
    .save()
    .then(() => {
      Workout.findById(workoutId).then((workout) => {
        workout.exerciseIds.push(newExercise.id);

        workout
          .save()
          .then(() => res.json("Exercise successfully created!"))
          .catch((err) => res.status(400).json("Error: " + err));
      });
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/update/:id").put((req, res) => {
  Exercise.findById(req.params.id)
    .then((exercise) => {
      exercise.name = req.body.name;
      exercise.description = req.body.description;
      exercise.sets = req.body.sets;

      exercise
        .save()
        .then(() => res.json("Exercise updated!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").delete((req, res) => {
  Exercise.findByIdAndDelete(req.params.id)
    .then(() => res.json("Exercise deleted."))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
