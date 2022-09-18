const Post = require('../schemas/post')

module.exports = async (category, offset) => ((await Post.find(category).skip(20 * (offset + 1)).limit(1)).length > 0)