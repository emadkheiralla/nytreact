
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request'); 
var cheerio = require('cheerio');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));



mongoose.connect('mongodb://localhost/nytreact');
var db = mongoose.connection;

db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

db.once('open', function() {
  console.log('Mongoose connection successful.');
});


var Article = require('./models/Article.js');


app.get('/', function(req, res) {
  res.send(index.html);
});

app.get('/scrape', function(req, res) {

  request('https://www.reddit.com/r/webdev', function(error, response, html) {

    var $ = cheerio.load(html);

    $('p.title').each(function(i, element) {

        var result = {};

        result.title = $(this).children('a').text();
        result.url = $(this).children('a').attr('href');

        var entry = new Article(result);

        entry.save(function(err, doc) {
          if (err) {
            console.log(err);
          } 
          else {
            console.log(doc);
            res.send(doc);
          }
        });


    });
  });
  console.log("Scrape Complete");
});

app.get('/articles', function(req, res){

  Article.find({}, function(err, doc){

    if (err){
      console.log(err);
    } 

    else {
      res.json(doc);
    }
  });
});

app.get('/articles/:title', function(req, res){

  Article.findOne({'_title': req.params.title})

  .exec(function(err, doc){

    if (err){
      console.log(err);
    } 

    else {
      res.json(doc);
    }
  });
});

app.post('api/removed/:title', function(req, res){

  Article.find({ '_title':req.body.title }).remove().exec();
});

app.listen(3000, function() {
  console.log('App running on port 3000!');
});
