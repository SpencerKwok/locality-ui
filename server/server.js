const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('Server listening on port::' + port);
});