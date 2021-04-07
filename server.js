require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

var crypto = require('crypto')

var current_date = (new Date()).valueOf().toString();
var random = Math.random().toString();
var hash =crypto.createHash('sha1').update(current_date + random).digest('hex');

const { nanoid } = require('nanoid')

//console.log(nanoid(10));


mongoose.connect(
  uri, 
    { useNewUrlParser: true, useUnifiedTopology: true });

console.log(mongoose.connection.readyState);
// Mongoose schema
const Schema = mongoose.Schema;
// Create url schema.
const urlSchema = new Schema ({
  original_url : {
    type: String, 
    required: true
    //unique: true
  },
  short_url : {
    type: String,
    required: true
    //unique: true
  } 
})
// Create Url model from the schema.
let Url = mongoose.model("Url", urlSchema);


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Post url
app.post('/api/shorturl/new', (req, res, done) => {
  // Handle the data in the request
  const url = req.body.url;
  // short code
  const urlCode = nanoid(10);
  // Check if url is valid
  dns.lookup(url, (err, good) => {
    // throw error if url is not valid
    if (err) {
      console.log(err);
      res.json ({
        error: 'invalid url'
      })
      return 
    }
    // Save url 
    // Create a new url, including their attributes
    const siteUrl = new Url ({
      original_url: url, short_url: urlCode})
 
      // Save the new url you created
      siteUrl.save(function(err, data) {
       if (err) return console.error(err);
       done(null, data)
        console.log(data)
      });
      res.json({
    original_url: url,
    short_url: urlCode 
  })
    
  })    
})

app.get('/api/shorturl/:short_url', (req, res) => {
  
  // Find the Original Url from database
  Url.findOne({short_url:"pZGx_AL9UH"}, (err, data) => {
    if (err) return console.log(err);
    
    var str = data.original_url;
    // check if the url has a defined protocol
    if (str.substring(0, 7) !== 'http://')
    str = 'http://' + str;
    
    // redirect to original url
    res.redirect(str)
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
