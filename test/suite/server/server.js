var express = require('express');
var path = require ('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var sanitize = require('sanitize-filename');

var app = express();

var datasetsPath = path.join(__dirname, '../../datasets/');

app.use('/data', express.static(datasetsPath));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));
app.use(bodyParser.json());

app.post('/data/:name', function(req, res) {
    var name = sanitize(req.params.name);

    if (!req.body || !name) {
        return res.status(400).end();
    }

    var filepath = path.join(datasetsPath, name);
    var content = JSON.stringify(req.body) + '\n';

    fs.writeFile(filepath, content, function(err) {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            console.log('Written ' + filepath + '.');
            res.end();
        }
    });
});

var server = app.listen(9001, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);
});
