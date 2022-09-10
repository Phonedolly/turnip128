const { redisClient, now } = require('../server')

const postTimeAlignmentor = require('./postTimeAlilgnmentor')

const Post = require('../schemas/post')

const runner = () => {
  Post.find({}).sort({ "_id": -1 }).limit(20)
    .then((result) => {
      /* UTC(mongodb) to local time */
      const timeAlignedResult = postTimeAlignmentor(result)

      const multi = redisClient.multi()

      /* 찾은 값을 20개까지 캐시에 저장 */
      redisClient.del('sitemapCache')
      for (let i = 0; i < timeAlignedResult.length; i++) {
        multi.rPush("sitemapCache", JSON.stringify(timeAlignedResult[i]))
      }

      multi.exec()
        .then((multiResult) => {
          if (process.env.NODE_ENV === 'dev') {
            console.log(multiResult)
          }
        },
          (multiError) => {
            console.error(now() + 'multiError');
            console.error(multiError)
          })

      if (process.env.NODE_ENV === 'dev') {
        console.log(now() + "sitemapCache updated");
      }
    })
}


function sitemapCacheUpdator(useInstantRun) {
  if (useInstantRun) {
    runner()
    if (process.env.NODE_ENV === 'dev') {
      console.log("sitemap instantly updated")
    }
  } else {
    setInterval(runner, process.env.SITEMAP_CACHE_REFRESH_TIME)
  }
}



module.exports = sitemapCacheUpdator;
