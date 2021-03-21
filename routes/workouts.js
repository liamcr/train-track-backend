const router = require("express").Router();
const Workout = require("../models/workout.model");
const Exercise = require("../models/exercise.model");
const Comment = require("../models/comment.model");
const Set = require("../models/set.model");
const LikeRelation = require("../models/likeRelation.model");
const authenticateJWT = require("../middleware/authenticate");

router.route("/:id").get(authenticateJWT, (req, res) => {
  Workout.findById(req.params.id)
    .then(async (workout) => {
      const liked = await LikeRelation.findOne({
        user: req.user.userId,
        workout: workout._id,
      }).exec();

      res.json({
        ...workout._doc,
        liked: liked !== null,
      });
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/user/:id").get(authenticateJWT, (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    res.status(400).json("Error: limit and offset params must be integers");
  }

  Workout.find({ user: req.params.id })
    .then(async (workouts) => {
      const likes = await LikeRelation.find({ user: req.user.userId }).exec();

      let timeline = workouts
        .sort((a, b) => b.date - a.date)
        .slice(offset, offset + limit)
        .map((workout) => ({
          ...workout._doc,
          liked:
            likes.findIndex(
              (likeRelation) => likeRelation.workout === workout._id
            ) !== -1,
        }));

      res.json(timeline);
    })
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

router.route("/:id").delete(authenticateJWT, async (req, res) => {
  if ((await Workout.findById(req.params.id).exec()) === null) {
    res.status(404).json("Could not find workout");
    return;
  }

  const exercises = await Exercise.find({ workout: req.params.id }).exec();

  console.log(`Found ${exercises.length} exercises to delete`);

  let sets = [];

  for (let exercise of exercises) {
    sets.push(...(await Set.find({ exercise: exercise._id }).exec()));
  }

  console.log(`Found ${sets.length} sets to delete`);

  try {
    await Set.deleteMany({
      _id: { $in: sets.map((setDoc) => setDoc._id) },
    }).exec();
  } catch (err) {
    res.status(500).json("Error: " + err);
    return;
  }

  console.log(`Deleted ${sets.length} sets`);

  try {
    await Exercise.deleteMany({
      workout: req.params.id,
    }).exec();
  } catch (err) {
    res.status(500).json("Error: " + err);
    return;
  }

  console.log(`Deleted ${exercises.length} exercises`);

  try {
    await LikeRelation.deleteMany({
      workout: req.params.id,
    }).exec();
  } catch (err) {
    res.status(500).json("Error: " + err);
    return;
  }

  console.log(`Deleted likes`);

  try {
    await Comment.deleteMany({
      workout: req.params.id,
    }).exec();
  } catch (err) {
    res.status(500).json("Error: " + err);
    return;
  }

  console.log(`Deleted comments`);

  try {
    await Workout.findByIdAndDelete(req.params.id).exec();
  } catch (err) {
    res.status(500).json("Error: " + err);
    return;
  }

  console.log(`Deleted workout`);

  res.json("Successfully deleted workout");
});

module.exports = router;
