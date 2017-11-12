const moment = require('moment')
const Schema = require('./schema')

async function main () {
  const schema = Schema()
  try {
    // Load the schema from a server and call it on the client
    await schema.addFromUrl('user/v1', 'http://localhost:8000/schemas/v1/user.json')
    const params = {
      name: 'John Doe',
      age: 20
    }
    const validatedUser = await schema.validate('user/v1', params)
    console.log('validatedUserV1:', validatedUser)

    await schema.addFromUrl('user/v2', 'http://localhost:8000/schemas/v2/user.json')
    const paramsV2 = {
      name: 'John Doe',
      age: 20,
      date_of_birth: moment().format().toString() // Format is RFC 3339
    }
    const validatedUserV2 = await schema.validate('user/v2', paramsV2)
    console.log('validatedUserV2:', validatedUserV2)
  } catch (error) {
    console.log('error:', error)
  }
}

main().then(console.log).catch(console.error)
