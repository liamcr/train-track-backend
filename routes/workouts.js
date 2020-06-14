const router = require("express").Router();
const Workout = require("../models/workout.model");

router.route("/:id").get((req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => res.json(workout))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/user/:id").get((req, res) => {
  Workout.find({ user: req.body.userId })
    .then((workouts) => res.json(workouts.sort((a, b) => b.date - a.date)))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/add").post((req, res) => {
  const userId = req.body.userId;
  const name = req.body.name;
  const description = req.body.description;
  const date = req.body.date;

  const newWorkout = new Workout({
    user: userId,
    name: name,
    description: description,
    date: date,
  });

  newWorkout
    .save()
    .then(() => res.json("Workout added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/update/:id").put((req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => {
      workout.user = req.body.userId;
      workout.name = req.body.name;
      workout.description = req.body.description;
      workout.date = req.body.date;

      workout
        .save()
        .then(() => res.json("Workout updated!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").delete((req, res) => {
  Workout.findByIdAndDelete(req.params.id)
    .then(() => res.json("Workout deleted."))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
