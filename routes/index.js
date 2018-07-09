var express = require('express');
var router = express.Router();
var printer = require('printer');
var util = require('util');
var fs = require('fs-extra');

router.get('/', function (req, res, next) {
    res.render('main');
});

router.post('/upload', function (req, res, next) {
    let fstream;
    let savePath;
    req.pipe(req.busboy);
    req.busboy
        .on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            savePath = __dirname + '/uploads/' + filename;
            if (fs.lstatSync(savePath).isDirectory()) { //prevent crash with no file
                res.json({success: false});
                return;
            }
            fstream = fs.createWriteStream(savePath);
            file.pipe(fstream);
            fstream.on('close', function () {
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
