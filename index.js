const SDK = require("aws-sdk");
const SHARP = require("sharp");

const S3 = new SDK.S3();

const BUCKET = process.env.BUCKET;
const BUCKET_URL = process.env.BUCKET_URL;

const handler = function (event, context, callback) {
  console.log(event, context, callback);
  const size = event.queryStringParameters.key;
  const path = event.path.slice(1);
  const key = `${size}/${path}`;

  const dimensions = size.split("x");
  const width = parseInt(dimensions[0], 10);
  const height = parseInt(dimensions[1], 10);

  S3.getObject({ Bucket: BUCKET, Key: path }, (err, data) =>
    SHARP(data.Body)
      .resize(width, height)
      .toFormat("jpg")
      .toBuffer()
      .then((buffer) =>
        S3.putObject(
          {
            Body: buffer,
            Bucket: BUCKET,
            Key: key,
            ContentType: "image/jpeg",
            ContentDisposition: "inline", // display images inline
          },
          () =>
            callback(null, {
              statusCode: "301",
              headers: { location: `${BUCKET_URL}/${key}` },
              body: "",
            })
        )
      )
  );
};

const event = {
  queryStringParameters: {
    key: "400x100",
  },
  path: "/theshot.jpg",
};

handler(event, null, () => {});
