const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/user.model");
const authenticateJWT = require("../middleware/authenticate");

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
        process.env.TOKEN_SECRET
      );

      res.json({ accessToken: accessToken });
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/login").post((req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (!user.validPassword(req.body.password)) {
      res.status(401).json("Error: Username or password does not match");
    } else {
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.TOKEN_SECRET
      );

      res.json({ accessToken: accessToken });
    }
  });
});

router.route("/follow/:id").post(authenticateJWT, async (req, res) => {
  User.findById(req.user.userId)
    .then((currentUser) => {
      User.findById(req.params.id)
        .then((userToFollow) => {
          // If a user if trying to follow someone they are already following,
          // respond with "Bad Request"
          if (
            currentUser.following.findIndex(userToFollow.id) !== -1 ||
            userToFollow.followers.findIndex(currentUser.id) !== -1
          ) {
            res
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

router.route("/unfollow/:id").post(authenticateJWT, async (req, res) => {
  User.findById(req.user.userId)
    .then((currentUser) => {
      User.findById(req.params.id)
        .then((userToUnfollow) => {
          // If a user if trying to unfollow someone they aren't already following,
          // respond with "Bad Request"
          if (
            currentUser.following.findIndex(userToUnfollow.id) === -1 ||
            userToUnfollow.followers.findIndex(currentUser.id) === -1
          ) {
            res
              .status(400)
              .json(
                "Error: User is attempting to unfollow someone they don't yet follow"
              );
          }

          currentUser.following = currentUser.following.filter(
            (userFollowed) => userFollowed !== userToUnfollow.id
          );
          userToUnfollow.followers = userToUnfollow.followers.filter(
            (follower) => follower !== currentUser.id
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

module.exports = router;
