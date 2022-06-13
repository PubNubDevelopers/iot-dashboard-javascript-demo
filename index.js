// Importing express module
var express = require("express");
var http = require('http')
var path = require('path')
var reload = require('reload')
var bodyParser = require('body-parser')

const port = 8001;
const app = express();
app.set('port', port)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// For serving static html files
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.set({
      "Allow-access-Allow-Origin": "*",
    });
       
    // res.send("Hello World");
    return res.redirect("index.html");
  });



  var server = http.createServer(app)

// Reload code here
reload(app).then(function (reloadReturned) {
  // reloadReturned is documented in the returns API in the README

  // Reload started, start web server
  server.listen(app.get('port'), function () {
    console.log('Web server listening on port ' + app.get('port'))
  })
}).catch(function (err) {
  console.error('Reload could not start, could not start server/sample app', err)
})

// Starting the server on the 80 port
//app.listen(port, () => {
//console.log(`The application started
//successfully on port ${port}`);
//});
