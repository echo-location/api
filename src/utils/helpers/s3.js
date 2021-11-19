import AWS from "aws-sdk";
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
const s3 = new AWS.S3();

const uploadFile = (buffer, name, type) => {
  const parameters = {
    ACL: "public-read",
    Body: buffer,
    Bucket: process.env.S3_BUCKET,
    ContentType: type.mime,
    Key: `${name}.${type.ext}`,
  };

  return s3.upload(parameters).promise();
};
export { uploadFile };
