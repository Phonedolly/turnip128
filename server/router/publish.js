const express = require('express')
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3')

const { s3, now } = require('../server')
const { redisClient } = require('../server')

const Post = require('../schemas/post');
const Category = require('../schemas/category');

const sitemapCacheUpdator = require('../tools/sitemapCacheUpdator')

const imageUploader = require('./middlewares').imageUploader;

const router = express.Router();

const checkPostExists = async (req, res, next) => {
  const isPostExists = !!await Post.findOne({ title: req.body.title })
  if (isPostExists) {
    req.isPostExists = true;
    next()
  }
  else {
    req.isPostExists = false;
    next()
  }

}

router.post('/uploadImage', imageUploader.single('img'), (req, res) => {
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
    return res.status(500).send("Title has a problem")
  }
}

const hasProperCatetory = async (req, res, next) => {
  const thisCategoryExists = !! await Category.findById(req.body.category)
  if (thisCategoryExists) {
    next();
  }
  else {
    return res.status(500).send("This category don't exists")
  }
}

const deleteBlacklist = async (req, res, next) => {
  if (!req.body.imageBlacklist || req.body.imageBlacklist.length === 0) {
    return next();
  }
  const params = {
    Bucket: process.env.S3_BUCKET,
    Delete: {
      Objects: req.body.imageBlacklist
    },
    // Quiet: false
  }

  const deleteCommand = new DeleteObjectsCommand(params);
  await s3.send(deleteCommand)
    .then((result) => {
      console.log('쓰지 않는 사진 삭제 성공')
      return next();
    }, (error) => {
      console.error(now() + '에러')
      console.error(error)

      return res.status(500).send("failed to delete blacklist");
    })
}

const updatePostToCache = (post) => {
  redisClient.set(post.postURL, JSON.stringify(post))
}

router.post('/edit',
  checkPostExists,
  hasProperCatetory,
  titleLinkManufacturer,
  deleteBlacklist,
  async (req, res) => {
    if (!req.isPostExists) {
      return res.status(500).send("post does not exists")
    }
    const post = await Post.updateOne(
      { _id: req.body._id }, {
      title: req.body.newTitle,
      content: req.body.content,
      postURL: req.body.postURL,
      images: req.body.imageWhitelist,
      thumbnailURL: req.body.thumbnailURL ?? null,
      category: req.body.category
    }).then(async () => {
      updatePostToCache(await Post.findOne({ postURL: req.body.postURL }))
      sitemapCacheUpdator(true)
    })

    res.status(200).send(post);
  })

router.post('/',
  checkPostExists,
  hasProperCatetory,
  titleLinkManufacturer,
  deleteBlacklist,
  async (req, res) => {
    if (req.isPostExists) {
      console.error(now() + 'duplicated title!')
      console.error(now() + 'title:' + req.body.title)
      return res.status(500).send('duplicated title');
    }
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      postURL: req.body.postURL,
      images: req.body.imageWhitelist,
      thumbnailURL: req.body.thumbnailURL ? req.body.thumbnailURL : null,
      category: req.body.category
    }).then((post) => {
      updatePostToCache(post);
      sitemapCacheUpdator(true);
    })

    console.log(now() + post);
    res.status(200).send("Successfully Create Post!");
  })

module.exports = router;
