const express = require('express')
const router = express.Router();
const { redisClient, now } = require('../server')

const auth = require('./auth');
const createdPost = require('./publish');
const category = require('./category');

const postTimeAlignmentor = require('../tools/postTimeAlilgnmentor');
const sitemapCacheUpdator = require('../tools/sitemapCacheUpdator');
const checkCanLoadMore = require('../tools/checkCanLoadMore');

const Post = require('../schemas/post');


router.use('/auth', auth)
router.use('/publish', createdPost)
router.use('/category', category);

router.get('/', (req, res) => {
  res.send({ test: 'hi' })
});

router.get('/getSitemap', async (req, res) => {
  /* redis에서 캐시가 있는지 확인 */
  const cache = await redisClient.lRange('sitemapCache', 0, -1);
  const canLoadMoreSitemap = (await redisClient.get("sitemapCacheCanLoadMore")) === "true" ? true : false;
  redisClient.get("sitemapCacheCanLoadMore").then((res) => console.log(res))
  if (cache) {
    if (process.env.NODE_ENV === 'dev') {
      console.log("Use Cache to getSitemap");
    }

    return res.send({
      sitemap: cache.map((each) => {
        const eachParsed = JSON.parse(each)
        return Object.assign({}, { title: eachParsed.title, thumbnailURL: eachParsed.thumbnailURL ?? null, postURL: eachParsed.postURL, postDate: eachParsed.postDate })
      }),
      canLoadMoreSitemap
    })
  }

  console.log(now() + '캐시 가져오기 실패')
  console.log(now() + "Not use Cache to getSitemap")
  Post.find({}).sort({ "_id": -1 }).limit(20)
    .then((result) => {
      /* 포스트를 20개 외에 더 로드할 수 있는지 확인 */
      const canLoadMoreSitemap = checkCanLoadMore(0);

      /* UTC(mongodb) to local time */
      timeAlignedResult = postTimeAlignmentor(result);

      res.send({ sitemap: timeAlignedResult, canLoadMoreSitemap });

      sitemapCacheUpdator(true)

    }, (err) => {
      console.error(err);
      console.error(now() + "get sitemap error");
      res.status(500).send();
    })
});

router.get('/getSitemap/more/:moreIndex', async (req, res) => {
  const moreIndex = req.params.moreIndex;
  Post.find({}).sort({ '_id': -1 }).skip(20 * moreIndex).limit(20)
    .then(async (result) => {
      let canLoadMoreSitemap = await checkCanLoadMore(moreIndex);

      const timeAlignedResult = postTimeAlignmentor(result)

      return res.send({ sitemap: timeAlignedResult, canLoadMoreSitemap })

    }, (err) => {
      console.error(err);
      console.error(now() + "failed to get more sitemap");
      return res.status(500).send();
    })
});

router.post('/search', async (req, res) => {
  const query = req.body.query;

  const result = await Post
    .find({ $or: [{ title: new RegExp(query) }, { content: new RegExp(query) }] })
    .sort({ '_id': -1 })

  res.send(result);
})

router.get('/post/:postURL', async (req, res) => {
  /* 캐시가 있는지 확인 */
  const cache = await redisClient.get(req.params.postURL)

  if (cache) {
    return res.send(JSON.parse(cache))
  }

  Post.findOne({ postURL: req.params.postURL })
    .then((result) => {
      res.send(result)

      /* 보냈던 포스트를 캐싱 */
      redisClient.set(req.params.postURL, JSON.stringify(result))
    }, (error) => {
      console.error(error)
      res.status(500).send();
    })
})

module.exports = router;
