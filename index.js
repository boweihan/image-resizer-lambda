const SDK = require("aws-sdk");
const SHARP = require("sharp");

const S3 = new SDK.S3();

const BUCKET = process.env.BUCKET;
const BUCKET_URL = process.env.BUCKET_URL;

exports.handler = function (event, context, callback) {
  console.log(event, context, callback);
  const key = event.queryStringParameters.key;
  const match = key.match(/((\d+)x(\d+))\/(.*)/);

  const width = parseInt(match[2], 10);
  const height = parseInt(match[3], 10);
  const originalKey = match[4];

  S3.getObject({ Bucket: BUCKET, Key: originalKey }, (data) =>
    SHARP(data.Body)
      .resize(width, height)
      .toFormat("jpg")
      .toBuffer()
      .then((buffer) =>
        S3.putObject(
          {
            Body: buffer,
            Bucket,
            Key: key,
            //   ContentType: "image/jpg",
          },
          () =>
            callback(null, {
              statusCode: "301",
              headers: { location: `${BUCKET_URL}/${key}` },
              //   body: "",
            })
        )
      )
  );
};
