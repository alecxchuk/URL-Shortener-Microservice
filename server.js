require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
var validUrl = require('valid-url');


mongoose.connect(
  uri, 
    { useNewUrlParser: true, useUnifiedTopology: true });

// Mongoose schema Object
const Schema = mongoose.Schema;

// Create url schema.
const urlSchema = new Schema ({
  original_url : {
    type: String, 
    required: true,
  },
  short_url : {
    type: Number,
    
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
app.post('/api/shorturl/new',async (req, res, done) => {
  var urlCode = Math.floor(Math.random() * 387);
  
  // Handle the data in the request
  var url = req.body.url;
  
  // Check if the input is a valid url
  if (validUrl.isWebUri(url)){
    try {
      console.log('Looks like an URI');
      // Check if url is already in the database
      let findOne = await Url.findOne({original_url: url});
      // if an entry exists
      if (findOne) {
        res.json({
          original_url: findOne.original_url, 
          short_url: findOne.short_url 
        });
      } else {
        // If one doesn't already exist, Create a new url, including their attributes
        findOne = new Url ({
          original_url: url, 
          short_url: urlCode
        });
        // save the new url to the database
        await findOne.save();
          res.json({
          original_url: findOne.original_url, 
          short_url: findOne.short_url 
        });

      }
    } catch (err) {
      console.log(err);
      res.status(500).json('Server error...')
    }   
  } else { // Input is not a valid Url. Throw error.
      console.log('Not a URI');
      res.json ({
        error: 'invalid url'
      });
    }
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  try{
    // Find the Original Url from database
    const urlParams =await Url.findOne({
      short_url:req.params.short_url}, (err, data) => {
      if (err) return  console.log(err) 
    })
    // If original url is found
    if (urlParams) {
      // redirect to original url
      return res.redirect(urlParams.original_url);
    } else { // Display an error message 
      return res.status(404).json('Url Not Found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).json('Server error');    
  }  
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
