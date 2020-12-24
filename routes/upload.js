const router = require("express").Router();
const authenticateJWT = require("../middleware/authenticate");
const AWS = require("aws-sdk");
const Busboy = require("busboy");

const ID = process.env.AWSAccessKeyId;
const SECRET = process.env.AWSSecretKey;

const BUCKET_NAME = "train-track-images";

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

router.route("/").post(authenticateJWT, async (req, res) => {
  const busboy = new Busboy({ headers: req.headers });

  req.pipe(busboy);

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: file,
      ACL: "public-read",
    };

    s3.upload(params, function (err, data) {
      if (err) {
        res.status(500).json("Error: " + err);
      }
      res.json("Image successfully uploaded");
    });
  });
});

module.exports = router;
