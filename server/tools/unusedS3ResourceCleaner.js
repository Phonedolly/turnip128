const { s3 } = require('../server')

const Post = require('../schemas/post');
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');

const runner = async () => {
  const blacklist = []

  const params = {
    Bucket: process.env.S3_BUCKET,

    // Quiet: false
  }
  listV2Command = new ListObjectsV2Command(params);
  const s3List = await s3.send(listV2Command);
  console.log(s3List);

  // Post.find({})
  //   .then((res) => {

  //   })

  console.log("S3 Image Clean Up Complete")
}

const unusedS3ResourceCleaner = () => {
  setInterval(runner, process.env.S3_CLEAN_TIME)
}

module.exports = unusedS3ResourceCleaner;