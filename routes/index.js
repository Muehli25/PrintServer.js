const express = require('express');
const router = express.Router();
const printer = require('printer');
const fs = require('fs-extra');

router.get('/', function (req, res, next) {
    res.render('main');
});

router.post('/upload', function (req, res, next) {
    let filestream;
    let savePath;
    req.pipe(req.busboy);
    req.busboy
        .on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
            savePath = __dirname + '/uploads/' + filename;
            if (fs.lstatSync(savePath).isDirectory()) {
                //prevent crash with no file
                res.json({success: false});
                return;
            }
            filestream = fs.createWriteStream(savePath);
            file.pipe(filestream);
            filestream.on('close', function () {
                console.log("Upload Finished of " + filename);
                printer.printDirect({
                    data: fs.readFileSync(savePath),
                    type: 'AUTO',
                    success: function (jobID) {
                        console.log("sent to printer with ID: " + jobID);
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
                res.json({success: true});
            });
        })
});


module.exports = router;
