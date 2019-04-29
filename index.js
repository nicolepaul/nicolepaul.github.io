//  Define requirements
const express = require('express')
const path = require('path');
const port = 3000

// Start express app
const app = express()

// Load in static files to root
app.use(express.static('data'))
app.use(express.static('plots'))
app.use(express.static('public'))

// Serve index.html
app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/index.html')))

// Initialize server
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
