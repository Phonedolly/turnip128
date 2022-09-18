const multer = require('multer')
const multerS3 = require('multer-s3')
const { s3, now } = require('../server')

const getToday = () => {
    let date = new Date();
    let year = date.getFullYear();
    let month = ("0" + (1 + date.getMonth())).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);

    return year + month + day;
}

module.exports.imageUploader = multer({
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


