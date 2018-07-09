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
            if (!filename) {
                console.log("No file given");
            }
            else {
                savePath = __dirname + '/uploads/' + filename;
                filestream = fs.createWriteStream(savePath);
                file.pipe(filestream);
                filestream.on('close', function () {
                    console.log("Upload Finished of " + filename);
                    if (fs.lstatSync(savePath).isDirectory()) {
                        console.log("File not found");
                        res.json({success: false});
                        return;
                    }
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
            }
        })
});


module.exports = router;
