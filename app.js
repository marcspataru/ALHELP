const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

app.set('views', path.join(__dirname, 'views')); // use the views directory to extract the views
app.set('view engine', 'pug'); // set pug.js as the view engine

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public')); // set the resources directory to be "public"
app.use(express.json());
app.use(cookieParser());
app.use(session({ // use session cookies (for errors and username)
  secret: 'Secret',
  resave: false,
  saveUninitialized: false
}));
app.use(routes); // set the routes to be the ones from index.js

module.exports = app;