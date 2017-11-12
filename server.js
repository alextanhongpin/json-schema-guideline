const express = require('express')
const app = express()
const path = require('path')

// Host our schemas for both v1 and v2 as static files
app.use('/schemas', express.static(path.join(__dirname, 'schema')))

app.get('*', (req, res) => {
  res.status(200).json({
    schemas: [
      {
        name: 'user',
        path: 'http://localhost:8000/schemas/v1/user.json'
      },
      {
        name: 'user',
        path: 'http://localhost:8000/schemas/v1/user.json'
      }
    ]
  })
})

app.listen(8000, () => {
  console.log('listening to port *:8000. press ctrl + c to cancel.')
})
