const express = require("express");
const bodyParser = require("body-parser");


const app = express();

app.use(bodyParser.json());


const makeGreeting = (suffix = "World") => {
  return {
    greeting: `Hello ${suffix}`
  };
};

app.get('/greet', (req, res) => {
  res.json(makeGreeting(suffix = req.query.suffix));
});

app.get('/greet/:suffix', (req, res) => {
  res.json(makeGreeting(suffix = req.params.suffix));
});

module.exports = app;
