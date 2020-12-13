const router = require("express").Router();
const User = require("../models/user.model");
const authenticateJWT = require("../middleware/authenticate");

router.route("/").get(authenticateJWT, (req, res) => {
  if (req.query.search === undefined || req.query.search.length < 3) {
    res
      .status(400)
      .json(
        "Error: Search query must be present and greater than 3 characters"
      );
  }

  User.find({ username: { $regex: req.query.search, $options: "i" } })
    .select("-password")
    .then((users) => {
      res.json(users);
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
