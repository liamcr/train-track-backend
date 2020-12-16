const router = require("express").Router();
const Workout = require("../models/workout.model");
const Exercise = require("../models/exercise.model");
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
    .then(() => res.json({ workout: newWorkout }))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/like/:id").post(authenticateJWT, (req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => {
      if (workout.likes.includes(req.user.userId)) {
        return res
          .status(400)
          .json(
            "Error: User is attempting to like something they have already liked"
          );
      }
      workout.likes.push(req.user.userId);

      // Note: The response message "post liked" is used in the frontend logic
      // so be careful when changing this
      workout
        .save()
        .then(() => res.json("Post liked!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/unlike/:id").post(authenticateJWT, (req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => {
      if (!workout.likes.includes(req.user.userId)) {
        return res
          .status(400)
          .json(
            "Error: User is attempting to unlike something they have not already liked"
          );
      }
      workout.likes = workout.likes.filter(
        (id) => id.toString() !== req.user.userId
      );

      // Note: The response message "post unliked" is used in the frontend logic
      // so be careful when changing this
      workout
        .save()
        .then(() => res.json("Post unliked!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/comment/:id").post(authenticateJWT, (req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => {
      const comment = {
        userId: req.user.userId,
        comment: req.body.comment,
      };

      workout.comments.push(comment);

      workout
        .save()
        .then(() => res.json("Comment posted!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/update/:id").put(authenticateJWT, (req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => {
      if (workout.user.toString() !== req.user.userId) {
        return res.sendStatus(403);
      }

      if (req.body.name) workout.name = req.body.name;
      if (req.body.description) workout.description = req.body.description;
      if (req.body.date) workout.date = req.body.date;

      workout
        .save()
        .then(() => res.json("Workout updated!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/:id").delete(authenticateJWT, (req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => {
      if (workout.user.toString() !== req.user.userId) {
        return res.sendStatus(403);
      }

      Exercise.deleteMany({ _id: { $in: workout.exerciseIds } })
        .then(() => {
          Workout.findByIdAndDelete(req.params.id)
            .then(() => {
              res.json("Workout deleted");
            })
            .catch((err) => res.status(404).json("Error: " + err));
        })
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/exercise/:id").delete(authenticateJWT, (req, res) => {
  Workout.findById(req.body.workoutId)
    .then((workout) => {
      if (workout.exerciseIds.findIndex((id) => id === req.params.id) === -1) {
        res.status(404).json("Error: Exercise not found in given workout");
      }

      workout.exerciseIds = workout.exerciseIds.filter((exerciseId) => {
        exerciseId !== req.params.id;
      });

      workout
        .save()
        .then(() => {
          Exercise.findByIdAndDelete(req.params.id)
            .then(() => {
              res.json("Exercise deleted.");
            })
            .catch((err) => res.status(404).json("Error: " + err));
        })
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

module.exports = router;
