const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/user.model");
const authenticateJWT = require("../middleware/authenticate");
const Workout = require("../models/workout.model");
const Exercise = require("../models/exercise.model");
const AWS = require("aws-sdk");

const ID = process.env.AWSAccessKeyId;
const SECRET = process.env.AWSSecretKey;

const BUCKET_NAME = "train-track-images";

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

router.route("/").get(authenticateJWT, (req, res) => {
  User.findById(req.user.userId)
    .select("-password")
    .then((user) => res.json(user))
    .catch((err) =>
      res.status(404).json(`Cannot find user with id ${req.user.userId}`)
    );
});

router.route("/:id").get(authenticateJWT, (req, res) => {
  User.findById(req.params.id)
    .select("-password")
    .then((user) => {
      let response = {
        ...user._doc,
        isFollowing: user.followers.includes(req.user.userId),
      };

      res.json(response);
    })
    .catch((err) =>
      res.status(404).json(`Cannot find user with id ${req.params.id}`)
    );
});

router.route("/register").post((req, res) => {
  let newUser = User({
    username: req.body.username,
  });

  newUser.password = newUser.generateHash(req.body.password);
  newUser
    .save()
    .then(() => {
      const accessToken = jwt.sign(
        { userId: newUser.id },
        process.env.TOKEN_SECRET,
        { expiresIn: "2h" }
      );

      res.json({ accessToken: accessToken });
    })
    .catch((err) =>
      res
        .status(409)
        .json(`Error: Username "${newUser.username}" is already taken`)
    );
});

router.route("/login").post((req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err || user === null || !user.validPassword(req.body.password)) {
      res.status(401).json("Error: Username or password does not match");
    } else {
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.TOKEN_SECRET,
        { expiresIn: "2h" }
      );

      res.json({ accessToken: accessToken });
    }
  }).catch((err) => res.status(400).json(`Error: ${err}`));
});

router.route("/follow/:id").post(authenticateJWT, (req, res) => {
  User.findById(req.user.userId)
    .then((currentUser) => {
      User.findById(req.params.id)
        .then((userToFollow) => {
          // If a user if trying to follow someone they are already following,
          // respond with "Bad Request"
          if (
            currentUser.following.includes(userToFollow.id) ||
            userToFollow.followers.includes(currentUser.id)
          ) {
            return res
              .status(400)
              .json(
                "Error: User is attempting to follow someone they already follow"
              );
          }

          currentUser.following.push(userToFollow.id);
          userToFollow.followers.push(currentUser.id);

          currentUser
            .save()
            .then(() =>
              userToFollow
                .save()
                .then(() => {
                  res.json("Followed!");
                })
                .catch((err) => res.status(400).json("Error: " + err))
            )
            .catch((err) => res.status(400).json("Error: " + err));
        })
        .catch((err) =>
          res
            .status(404)
            .json(`Error: Could not find user with id ${req.params.id}`)
        );
    })
    .catch((err) =>
      res
        .status(404)
        .json(`Error: Could not find user with id ${req.user.userId}`)
    );
});

router.route("/unfollow/:id").post(authenticateJWT, (req, res) => {
  User.findById(req.user.userId)
    .then((currentUser) => {
      User.findById(req.params.id)
        .then((userToUnfollow) => {
          // If a user if trying to unfollow someone they aren't already following,
          // respond with "Bad Request"
          if (
            !currentUser.following.includes(userToUnfollow.id) ||
            !userToUnfollow.followers.includes(currentUser.id)
          ) {
            return res
              .status(400)
              .json(
                "Error: User is attempting to unfollow someone they don't yet follow"
              );
          }

          currentUser.following = currentUser.following.filter(
            (userFollowed) => userFollowed.toString() !== userToUnfollow.id
          );
          userToUnfollow.followers = userToUnfollow.followers.filter(
            (follower) => follower.toString() !== currentUser.id
          );

          currentUser
            .save()
            .then(() =>
              userToUnfollow
                .save()
                .then(() => {
                  res.json("Unfollowed!");
                })
                .catch((err) => res.status(400).json("Error: " + err))
            )
            .catch((err) => res.status(400).json("Error: " + err));
        })
        .catch((err) =>
          res
            .status(404)
            .json(`Error: Could not find user with id ${req.params.id}`)
        );
    })
    .catch((err) =>
      res
        .status(404)
        .json(`Error: Could not find user with id ${req.user.userId}`)
    );
});

router.route("/update").post(authenticateJWT, (req, res) => {
  User.findById(req.user.userId)
    .then((currentUser) => {
      currentUser.username = req.body.username;

      currentUser
        .save()
        .then(() => {
          res.json("User Updated");
        })
        .catch((err) => {
          res.status(400).json("Error: Display name is already taken");
        });
    })
    .catch((err) =>
      res
        .status(404)
        .json(`Error: Could not find user with id ${req.params.id}`)
    );
});

router.route("/").delete(authenticateJWT, (req, res) => {
  Workout.find({ user: req.user.userId })
    .then(async (workouts) => {
      for (let workout of workouts) {
        try {
          await Exercise.deleteMany({
            _id: {
              $in: workout.exerciseIds,
            },
          });
        } catch (err) {
          res.status(500).json("Error: " + err);
          return;
        }
      }

      try {
        await Workout.deleteMany({ user: req.user.userId });
      } catch (err) {
        res.status(500).json("Error: " + err);
        return;
      }

      User.findByIdAndDelete(req.user.userId)
        .then((deletedUser) => {
          if (deletedUser.displayImage !== "") {
            const deleteParams = {
              Bucket: BUCKET_NAME,
              Key: deletedUser.displayImage,
            };

            s3.deleteObject(deleteParams, (err, data) => {
              if (err) {
                console.error(
                  "There was a problem deleting the previous display image"
                );
              }

              res.json("User successfuly deleted");
            });
          } else {
            res.json("User successfuly deleted");
          }
        })
        .catch((err) => res.status(500).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

module.exports = router;
