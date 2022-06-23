/**
 * Entry point for NodeJS application.  Responsible for loading the (mostly static) website and handling communication with the interactive demo.
 */

var express = require('express')
var http = require('http')
var path = require('path')
var reload = require('reload')
var bodyParser = require('body-parser')
//var pubNubInteractiveDemo = require('pubnub-demo-integration')
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

/**
 * Entry point for when the apps wants to send a message to the interactive demo. 
 * I originally wanted to use the pubnub-demo-integration module for consistency with other demos.
 * Unfortunately, Netlify would require some additional logic for me to expose this so I just implemented the interactive demo logic entirely in JavaScript (demo_interface.js)
 */
/*
app.get('/interactivedemo/*', (req, res) => {
  //  Sending a message to the interactive demo
  try {
    //  Not the prettiest of code, I'm sure there is a library for this
    if (
      req.url.startsWith('/interactivedemo/') &&
      req.url.length > '/interactivedemo/'.length
    ) {
      let json = JSON.parse(
        decodeURIComponent(req.url.substring('/interactivedemo/'.length))
      )
      let reqAction = json.action
      let reqBlockDuplicateCalls = json.blockDuplicateCalls
      let reqDebug = json.debug
      let reqWindowLocation = json.windowLocation
      pubNubInteractiveDemo.actionCompleted({
        action: reqAction,
        blockDuplicateCalls: reqBlockDuplicateCalls,
        debug: reqDebug,
        windowLocation: reqWindowLocation,
        fetchClient: fetch
      })
      res.sendStatus(200)
    }
  } catch (err) {
    console.log('Error processing Interactive demo request: ' + err.message)
    res.sendStatus(500)
  }
})
*/

var server = http.createServer(app)

// Reload code here
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