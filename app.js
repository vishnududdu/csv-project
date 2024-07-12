import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

const upload = multer({ 
    dest: 'uploads/', 
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    }
});

app.get('/', (req, res) => {
    fs.readdir('uploads', (err, files) => {
        if (err) {
            return res.status(500).send('Error reading upload directory');
        }
        res.render('index', { files: files });
    });
});

app.post('/upload', upload.single('csvFile'), (req, res) => {
    res.redirect('/');
});

app.get('/view/:filename', (req, res) => {
    const filepath = path.join('uploads', req.params.filename);
    // console.log(filepath);
    const results = [];
    fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.render('table', { data: results, headers: Object.keys(results[0] || {}) });
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
