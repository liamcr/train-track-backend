const router = require("express").Router();
const authenticateJWT = require("../middleware/authenticate");
const AWS = require("aws-sdk");
const Busboy = require("busboy");
const User = require("../models/user.model");
const sharp = require("sharp");

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

    const imageResizer = sharp().rotate().resize(500, 500, { fit: "cover" });

    // Portrait images >500px in height are stretched on chrome, so the
    // images must be resized as they are uploaded
    file.pipe(imageResizer).toBuffer((err, buffer, info) => {
      if (err) {
        res.status(500).json("Error: " + err);
      }

      const params = {
        Bucket: BUCKET_NAME,
        Key: `${generateUUID()}.${suffix}`,
        Body: buffer,
        ACL: "public-read",
      };

      s3.upload(params, function (err, data) {
        if (err) {
          res.status(500).json("Error: " + err);
        }

        console.log(data.Location);

        User.findById(req.user.userId)
          .then((user) => {
            const currentDisplayPictureName = user.displayImage
              .split("/")
              .pop();

            User.findByIdAndUpdate(req.user.userId, {
              displayImage: data.Location,
            })
              .then(() => {
                if (currentDisplayPictureName === "") {
                  res.status(201).send("Image successfully uploaded");
                  return;
                }

                const getParams = {
                  Bucket: BUCKET_NAME,
                  Key: currentDisplayPictureName,
                };

                s3.getObject(getParams, (err, data) => {
                  if (err) {
                    console.error(
                      `Image with name ${currentDisplayPictureName} not found`
                    );

                    res.json("Image successfully uploaded");
                  } else {
                    const deleteParams = {
                      Bucket: BUCKET_NAME,
                      Key: currentDisplayPictureName,
                    };

                    s3.deleteObject(deleteParams, (err, data) => {
                      if (err) {
                        console.error(
                          "There was a problem deleting the previous display image"
                        );
                      }

                      res.json("Image successfuly uploaded");
                    });
                  }
                });
              })
              .catch((err) => {
                res.status(500).json("Error: " + err);
              });
          })
          .catch((err) => {
            res.status(500).json("Error: User not found");
          });
      });
    });
  });
});

module.exports = router;
