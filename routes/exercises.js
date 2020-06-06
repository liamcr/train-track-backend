const router = require("express").Router();
const Exercise = require("../models/exercise.model");
const Workout = require("../models/workout.model");

router.route("/").get((req, res) => {
  Exercise.find()
    .then((exercises) => res.json(exercises))
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

module.exports = router;
