const express = require('express')
const router = express.Router();

const Post = require('../schemas/post');
const Category = require('../schemas/category');

const imageUploader = require('./middlewares').imageUploader;

router.post('/uploadImage', imageUploader.single('img'), (req, res) => {
    res.json({ imageLocation: req.file.location, imageName: req.file.key })
})

router.get('/getCategories', async (req, res) => {
    const categories = await Category.find({}).sort({ index: 1 })

    res.send({ categories })
})

router.post('/createCategory', async (req, res) => {
    if (!req.body.name) {
        return res.status(500).send({ result: "Name is not supplied" })
    }
    if (!req.body.thumbnailURL) {
        return res.status(500).send({ result: "thumbnailURL is not supplied" })
    }
    const isDuplicated = !!(await Category.findOne({ name: req.body.name }));
    if (isDuplicated) {
        return res.status(500).send({ result: "Duplicated Category Name!" })
    }
    const categoryLength = (await Category.find({})).length;
    const result = await Category.create({ name: req.body.name, thumbnailURL: req.body.thumbnailURL, index: categoryLength });
    res.send({ successfullyCreateCategory: true });
})

router.post('/updateCategories', async (req, res) => {
    /* 임시로 인덱스 변경 */
    const categoryLength = (await Category.find({})).length;
    console.log(req.body);
    req.body.categories.map(async (eachCategory, plus) => {
        await Category.updateOne({ _id: eachCategory._id }, {
            index: categoryLength + plus + 1
        })
    })

    /* 인덱스 정상화 */
    req.body.categories.map(async (eachCategory) => {
        await Category.updateOne({ _id: eachCategory._id }, {
            name: eachCategory.name,
            index: eachCategory.index
        })
    })

    res.send("category updated");
})

router.post('/deleteCategory', async (req, res) => {
    // req.body.targetCategory는 _id 형식
    const postLengthOfThisCategory =
        (await Post.find({ category: { _id: req.body.targetCategory } }).populate("category")).length;
    if (postLengthOfThisCategory !== 0) {
        return res.status(200).send({
            successfullyDeleteCategory: false,
            hasOneOrMorePost: true,
            remainPosts: postLengthOfThisCategory,
            reason: "There are one or more posts that use this category"
        })
    }
    else {
        await Category.deleteOne({ _id: req.body.targetCategory });
        return res.status(200).send({ successfullyDeleteCategory: true })
    }
})

router.get('/getAllCategoryLength', async (req, res) => {
    const categories = await Category.find({})
    console.log(categories);
    const lengths = await  Promise.all(categories.map(async (eachCategory) => {
        const value = (await Post.find({ category: { _id: eachCategory._id.toString() } })).length
        return value;
    }))
    console.log("length", lengths);

    res.send(lengths)
})

module.exports = router;
