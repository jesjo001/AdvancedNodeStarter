const AWS = require('aws-sdk');
const uuid = require('uuid/v4');
const requireLogin = require('../middlewares/requireLogin');
const s3 = new AWS.S3({
    accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
        signatureVersion: 'v4',
        region: process.env.AWS_REGION,
})
module.exports = app => { 
    app.get('/api/upload', requireLogin, (req, res) => {

        const key = `${req.user.id}/${uuid()}.jpeg`
        s3.getSignedUrl('putObject', {
            Bucket: process.env.awsBucketName,
            ContentType: 'image/jpeg',
            Key: key
        }, (err, url) => {
            if (err) console.log(err, err.stack) // an error occurred
            res.send({ key, url })})
    })
}

// const s3 = new AWS.S3({
//     credentials: {
//       accessKeyId: keys.accessKeyId,
//       secretAccessKey: keys.secretAccessKey,
//     },
//     region: 'us-west-2',
//   });