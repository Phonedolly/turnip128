const express = require('express')
const multer = require('multer')
const multerS3 = require('multer-s3')
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3')

const { s3, now } = require('../server')
const { redisClient } = require('../server')

const Post = require('../schemas/post');
const sitemapCacheUpdator = require('../tools/sitemapCacheUpdator')

const router = express.Router();


const getToday = () => {
  let date = new Date();
  let year = date.getFullYear();
  let month = ("0" + (1 + date.getMonth())).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);

  return year + month + day;
}
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, getToday() + "/" + Date.now().toString() + '_' + req.body.filename)
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,

    // acl: 'public-read'
  })
})

const isPostExists = async (req, res, next) => {
  req.isPostExists = !!await Post.findOne({ title: req.body.title })
  next()
}

router.post('/uploadImage', upload.single('img'), function (req, res, next) {
  res.json({ imageLocation: req.file.location, imageName: req.file.key })
})

const titleLinkManufacturer = (req, res, next) => {
  try {
    if (req.body.newTitle) {
      req.body.postURL = req.body.newTitle.replace(/ /gi, '-').replace(/\./gi, '').replace(/,/gi, '').replace(/'/gi, '').replace(/“/gi, '"').replace(/”/gi, '"').replace(/‘/gi, "'").replace(/’/gi, "'").replace(/%/gi, '').replace(/\//gi, '-');

    } else {
      req.body.postURL = req.body.title.replace(/ /gi, '-').replace(/\./gi, '').replace(/,/gi, '').replace(/'/gi, '').replace(/“/gi, '"').replace(/”/gi, '"').replace(/‘/gi, "'").replace(/’/gi, "'").replace(/%/gi, '').replace(/\//gi, '-');
    }
    next()
  } catch (error) {
    console.error(now() + "Title has a problem")
    console.error(error)
    res.status(500).send("Title has a problem")
  }
}

const deleteBlacklist = async (imageBlacklist) => {

  if (imageBlacklist.length === 0) {
    return
  }
  const params = {
    Bucket: process.env.S3_BUCKET,
    Delete: {
      Objects: imageBlacklist
    },
    // Quiet: false
  }

  const deleteCommand = new DeleteObjectsCommand(params);
  await s3.send(deleteCommand)
    .then((res) => {
      console.log('쓰지 않는 사진 삭제 성공')
    }, (err) => {
      console.error(now() + '에러')
      console.error(err)

    })
}

const updatePostToCache = (post) => {
  redisClient.set(post.postURL, JSON.stringify(post))
}

router.post('/edit', isPostExists, titleLinkManufacturer, async (req, res) => {
  if (!req.isPostExists) {
    return res.status(500).send("post not exists")
  }
  const post = await Post.updateOne(
    { _id: req.body._id }, {

    title: req.body.newTitle,
    content: req.body.content,
    postURL: req.body.postURL,
    images: req.body.imageWhitelist,
    thumbnailURL: req.body.thumbnailURL ?? null,

  }).then(async () => {
    updatePostToCache(await Post.findOne({ postURL: req.body.postURL }))
    sitemapCacheUpdator(true)
  })
  deleteBlacklist(req.body.imageBlacklist)

  res.status(200).send(post);
})

router.post('/', isPostExists, titleLinkManufacturer, async (req, res) => {
  const isDuplicated = req.isPostExists;
  if (isDuplicated) {
    console.error(now() + 'duplicated title!')
    console.error(now() + 'title:' + req.body.title)
    res.status(500).send('duplicated title');
    return
  }

  deleteBlacklist(req.body.imageBlacklist)
    .then(() => console.log("이미지 삭제 성공"),
      (err) => {
        console.error(now() + "이미지 삭제 실패")
        return res.status(500).send(err)
      })

  const post = await Post.create({
    title: req.body.title,
    content: req.body.content,
    postURL: req.body.postURL,
    images: req.body.imageWhitelist,
    thumbnailURL: req.body.thumbnailURL ? req.body.thumbnailURL : null,
  }).then((post) => {
    updatePostToCache(post);
    sitemapCacheUpdator(true);
  })

  console.log(now() + post);
  res.status(200).send();
})

module.exports = router;
