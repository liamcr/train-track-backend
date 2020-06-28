const router = require("express").Router();
const Workout = require("../models/workout.model");
const authenticateJWT = require("../middleware/authenticate");

router.route("/:id").get(authenticateJWT, (req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => res.json(workout))
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/user/:id").get(authenticateJWT, (req, res) => {
  Workout.find({ user: req.params.id })
    .then((workouts) => res.json(workouts.sort((a, b) => b.date - a.date)))
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/add").post(authenticateJWT, (req, res) => {
  const userId = req.user.userId;
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

router.route("/like/:id").post((req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => {
      workout.likes.push(req.body.userId);

      workout
        .save()
        .then(() => res.json("Post liked!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/comment/:id").post((req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => {
      const comment = {
        userId: req.body.userId,
        comment: req.body.comment,
      };

      workout.comments.push(comment);

      workout
        .save()
        .then(() => res.json("Comment posted!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/update/:id").put((req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => {
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
