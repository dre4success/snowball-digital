const express = require("express");
const AWS = require("aws-sdk");
const fileUpload = require("express-fileupload");
const Jimp = require("jimp");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config({ path: "variable.env" });
const { hostname } = require("os");

const app = express();

let logoPath = path.join(__dirname + "/logo/snowball-digital.png");

app.use(fileUpload());

AWS.config.update({
  accessKeyId: process.env.KEY_ID,
  secretAccessKey: process.env.ACCESS_KEY,
  region: "eu-west-1",
});

const s3 = new AWS.S3();

const STACK_NAME = process.env.STACK_NAME || 'Unknown Stack'

let message = `Hello Cloud from ${hostname()} IN ${STACK_NAME}`;

app.get("/", (req, res) => {
  res.json(message);
});

app.post("/api/upload", async (req, res) => {
  try {
    // validating that it's a file being inputed
    if (!req.files) throw Error("Please use form-data");

    // validating that it's the current name being used
    if (!req.files.image)
      return res
        .status(400)
        .json({ status: 400, message: `No image to upload` });

    // validating that only an image is being uploaded
    if (!req.files.image.mimetype.includes("image/"))
      return res.status(400).json({
        status: 400,
        message: `only images allowed for upload`,
      });

    let resource = `${await crypto.randomBytes(8).toString("hex")}.${
      req.files.image.mimetype
    }`;

    let [image, logo] = await Promise.all([
      Jimp.read(req.files.image.data),
      Jimp.read(logoPath),
    ]);
    // let logo = await Jimp.read(logoPath);
    let overlayedImage = await image
      .scale(1)
      // overlaying logo over uploaded image
      .composite(logo.scale(0.3), 128 - 75, 128, [
        Jimp.BLEND_DESTINATION_OVER,
        0.5,
        0.5,
      ])
      .getBufferAsync(Jimp.MIME_JPEG);

    const params = {
      Bucket: "snowball-digital",
      ACL: "public-read",
      Key: resource,
      Body: overlayedImage,
      ContentType: req.files.image.mimetype,
    };
    // uploading to AWS S3 bucket
    const data = await s3.upload(params).promise();
    return res.status(200).json({ status: 200, url: data.Location });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
});

const port = process.env.PORT || 5051;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
