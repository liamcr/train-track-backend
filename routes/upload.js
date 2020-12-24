const router = require("express").Router();
const authenticateJWT = require("../middleware/authenticate");
const AWS = require("aws-sdk");
const Busboy = require("busboy");
const User = require("../models/user.model");

const ID = process.env.AWSAccessKeyId;
const SECRET = process.env.AWSSecretKey;

const BUCKET_NAME = "train-track-images";

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

function generateUUID() {
  var d = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

router.route("/").post(authenticateJWT, async (req, res) => {
  const busboy = new Busboy({ headers: req.headers });

  req.pipe(busboy);

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const suffix = filename.split(".")[filename.split(".").length - 1];

    const params = {
      Bucket: BUCKET_NAME,
      Key: `${generateUUID()}.${suffix}`,
      Body: file,
      ACL: "public-read",
    };

    s3.upload(params, function (err, data) {
      if (err) {
        res.status(500).json("Error: " + err);
      }

      User.findByIdAndUpdate(req.user.userId, { displayImage: data.Location })
        .then(() => {
          res.json("Image successfully uploaded");
        })
        .catch((err) => {
          res.status(500).json("Error: " + err);
        });
    });
  });
});

module.exports = router;
