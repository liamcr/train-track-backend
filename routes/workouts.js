const router = require("express").Router();
let Workout = require("../models/workout.model");

router.route("/").get((req, res) => {
  Workout.find()
    .then((workouts) => res.json(workouts))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
