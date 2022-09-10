const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Post = require('../schemas/post');

const sitemapReader = (offset) => {
  if (!fs.existsSync(path.join(__dirname, `../../client/build/sitemap${offset}.txt`))) {
    fs.writeFileSync(path.join(__dirname, `../../client/build/sitemap${offset}.txt`), "");
  }
  return fs.readFileSync(path.join(__dirname, `../../client/build/sitemap${offset}.txt`), { encoding: 'utf-8' });
}

const writer = (content, offset) => {
  fs.writeFileSync(path.join(__dirname, `../../client/build/sitemap${offset}.txt`), content)
}

const runner = async () => {
  const mongoBulkData = await Post.find({})
  const numOfOffset = Math.ceil(mongoBulkData.length / 1000)
  console.log('numOfOffset: ' + numOfOffset)

  for (let i = 0; i < numOfOffset; i++) {
    const prevData = sitemapReader(i);
    const last = (mongoBulkData.length % 1000 === 0) ? (i + 1) * 1000 : i * 1000 + mongoBulkData.length % 1000;
    const curContent = mongoBulkData.slice(i * 1000, last).reduce((acc, cur) => acc.concat(process.env.WEBSITE_URL + '/post/' + cur.postURL + '\n'), "")

    const sitemapUpdated = prevData !== curContent;

    if (sitemapUpdated || !fs.existsSync(__dirname, `../../client/build/sitemap${i}.txt`)) {
      writer(curContent, i);
      if (process.env.NODE_ENV === 'dev') {
        console.log("sitemap refreshed")
      }
    }

    if (process.env.NODE_ENV === 'production'
      && fs.existsSync(path.join(__dirname, `../../client/build/sitemap${i}.txt`))
      && sitemapUpdated) {
      axios.get(`https://www.google.com/ping?sitemap=https://stardue64.com/sitemap${i}.txt`);
      console.log(`send sitemap${i} update ping to google`)
    }
  }
}

const sitemapGenarator = () => {
  return setInterval(runner, process.env.SITEMAP_REFRESH_TIME)
}

module.exports = sitemapGenarator;
