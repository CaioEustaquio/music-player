const path = require('path');
const express = require('express');
const port = 80;
const app = express();

app.get('/', (req, res) =>{
    res.sendFile(`${__dirname}${path.sep}/views/index.html`);
});

app.listen(port, (req, res) =>{
    console.log(`Server is running!`);
})