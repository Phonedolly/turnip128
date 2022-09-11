const Post = require('../schemas/post')

module.exports = async (offset) => ((await Post.find({}).skip(20 * (offset + 1)).limit(1)).length > 0)