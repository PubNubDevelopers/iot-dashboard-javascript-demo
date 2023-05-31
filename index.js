/**
 * Entry point for NodeJS application.  Responsible for loading the (mostly static) website and handling communication with the interactive demo.
 */

var express = require('express')
var http = require('http')
var path = require('path')
//var reload = require('reload')
var bodyParser = require('body-parser')
var fetch = require('node-fetch')

const port = 8001
const app = express()
var path = require('path')
app.set('port', port)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))
// For serving static html files
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.set({
    'Allow-access-Allow-Origin': '*'
  })

  // res.send("Hello World");
  return res.redirect('index.html')
})

var server = http.createServer(app)

server.listen(app.get('port'), function () {
  console.log('Web server listening on port ' + app.get('port'))
})

// Reload code here
/*
reload(app)
  .then(function (reloadReturned) {
    server.listen(app.get('port'), function () {
      console.log('Web server listening on port ' + app.get('port'))
    })
  })
  .catch(function (err) {
    console.error(
      'Reload could not start, could not start server/sample app',
      err
    )
  })
  */