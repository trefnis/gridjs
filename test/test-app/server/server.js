'use strict';
const express = require('express');
const path = require ('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const sanitize = require('sanitize-filename');
const _ = require('lodash');

const app = express();

const dataSetsPath = path.join(__dirname, '../../datasets/');
const libPath = path.join(__dirname, '../../../dist');
const demosPath = path.join(__dirname, '../../../demo/');

app.use('/data', express.static(dataSetsPath));
app.use('/lib', express.static(libPath));
app.use('/demo', express.static(demosPath));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));
app.use(bodyParser.json());

app.get('/data', (req, res) => {
    fs.readdir(dataSetsPath, (err, files) => {
        if (err) {
            res.status(500).send(err);
        }

        const dataSets = files
            .map(f => path.join(dataSetsPath, f))
            .filter(isJson)
            .map(f => path.basename(f));

        res.send(dataSets);
    });
});

app.post('/data/:name', (req, res) => {
    const name = sanitize(req.params.name);

    if (!req.body || !name) {
        return res.status(400).end();
    }

    const filepath = path.join(dataSetsPath, name);
    const content = JSON.stringify(req.body, null, 2) + '\n';

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

const server = app.listen(9001, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);
});

function isJson(filepath) {
    return fs.statSync(filepath).isFile() && path.extname(filepath) === '.json';
}
