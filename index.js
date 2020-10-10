// import dependencies from node_modules
const SDK = require("aws-sdk");
const SHARP = require("sharp");

// instantiate S3 helper
const S3 = new SDK.S3();

// pull in environment variables that we specified in lambda settings
const BUCKET = process.env.BUCKET;
const BUCKET_URL = process.env.BUCKET_URL;

// export handler function that is needed for lambda execution
exports.handler = function (event, context, callback) {
  // parse request parameters to get width, height, and bucket key
  const key = event.rawPath.slice(1);
  const params = key.split("/");
  const size = params[0];
  const path = params[1];

  const dimensions = size.split("x");
  const width = parseInt(dimensions[0], 10);
  const height = parseInt(dimensions[1], 10);

  // fetch the original image from S3
  S3.getObject({ Bucket: BUCKET, Key: path }, (err, data) =>

    // use Sharp (https://www.npmjs.com/package/sharp)
    // a node.js image conversion library, to resize the image.
    SHARP(data.Body)
      .resize(width, height)
      .toFormat("jpg")
      .toBuffer()
      .then((buffer) =>
            
        // create a new entry in S3 with our resized image
        // the key is unique per size - i.e. 300x300/image.jpg
        S3.putObject(
          {
            Body: buffer,
            Bucket: BUCKET,
            Key: key,
            ContentType: "image/jpeg",
            ContentDisposition: "inline", // ensure that the browser will display S3 images inline
          },
          () =>
    
            // generate lambda response with the location of the newly uploaded file
            callback(null, {
              statusCode: "301",
              headers: { location: `${BUCKET_URL}/${key}` },
              body: "",
            })
        )
      )
  );
};
