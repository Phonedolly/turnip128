const { utcToZonedTime, format } = require('date-fns-tz')

const postTimeAlignmentor = (data) => {
    /* UTC(mongodb) to local time */
    return timeAlignedResult = data.map((each) => Object.assign({}, { title: each.title, thumbnailURL: each.thumbnailURL ?? null, postURL: each.postURL, postDate: format(utcToZonedTime(each.createdAt), 'yyyy-MM-dd') }));
}

module.exports = postTimeAlignmentor;