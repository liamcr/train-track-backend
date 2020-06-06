const router = require("express").Router();
let Workout = require("../models/workout.model");

router.route("/").get((req, res) => {
  Workout.find()
    .then((workouts) => res.json(workouts))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/add").post((req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const date = req.body.date;

  const newWorkout = new Workout({
    name: name,
    description: description,
    date: date,
  });

  newWorkout
    .save()
    .then(() => res.json("Workout added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
