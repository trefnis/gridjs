var express = require('express');
var path = require ('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var sanitize = require('sanitize-filename');

var app = express();

app.use(express.static(path.join(__dirname, '../../sample-data/')));
app.use(bodyParser.json());

app.post('/:name', function(req, res) {
    var name = sanitize(req.params.name);

    if (!req.body || !name) {
        return res.status(400).end();
    }

    var filepath = path.join(__dirname, '../../sample-data/', name);
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
