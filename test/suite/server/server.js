'use strict';
let express = require('express');
let path = require ('path');
let fs = require('fs');
let bodyParser = require('body-parser');
let sanitize = require('sanitize-filename');
let _ = require('lodash');

let app = express();

let dataSetsPath = path.join(__dirname, '../../datasets/');
let libPath = path.join(__dirname, '../../../dist');

app.use('/data', express.static(dataSetsPath));
app.use('/lib', express.static(libPath));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));
app.use(bodyParser.json());

app.get('/data', (req, res) => {
    fs.readdir(dataSetsPath, (err, files) => {
        if (err) {
            res.status(500).send(err);
        }

        let dataSets = files
            .map(f => path.join(dataSetsPath, f))
            .filter(isJson)
            .map(f => path.basename(f));

        res.send(dataSets);
    })
});

app.post('/data/:name', (req, res) => {
    let name = sanitize(req.params.name);

    if (!req.body || !name) {
        return res.status(400).end();
    }

    let filepath = path.join(dataSetsPath, name);
    let content = JSON.stringify(req.body, null, 2) + '\n';

    fs.writeFile(filepath, content, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            console.log('Written ' + filepath + '.');
            res.end();
        }
    });
});

let server = app.listen(9001, function() {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);
});

function isJson(filepath) {
    return fs.statSync(filepath).isFile() && path.extname(filepath) === '.json';
}
