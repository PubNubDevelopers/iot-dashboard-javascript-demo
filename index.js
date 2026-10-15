/**
 * Serves the dashboard from public/ on http://localhost:8001.
 * The page needs a web server (not file://) because the device simulators run as web workers.
 */

const express = require('express')

const port = 8001
const app = express()

app.use(express.static('public'))

app.listen(port, () => {
  console.log('IoT dashboard on http://localhost:' + port)
})
