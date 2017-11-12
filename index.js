const Schema = require('./schema')
const userSchema = require('./schema/v1/user.json')
const usersSchema = require('./schema/v1/users.json')
const locationSchema = require('./schema/v1/location.json')
const userWithLocationSchema = require('./schema/v1/user-with-location.json')

async function main () {
  const schema = Schema()

  schema.add('user', userSchema)
  // Note that once you load the user schema with the id `https://seekasia.com/schemas/user.json`,
  // you can now refer to the schema from other file as `"$ref": "user.json"`.
  // See `users.json` example.
  schema.add('users', usersSchema)
  schema.add('location', locationSchema)
  schema.add('userWithLocation', userWithLocationSchema)

  try {
    //  Validate user schema
    const userParams = {
      name: 'John Doe',
      age: 10
    }
    const validatedUser = await schema.validate('user', userParams)
    console.log('validatedUser:', validatedUser)

    // Validate users schema
    const usersParams = {
      data: [ userParams, { name: 'Jane Doe', age: 1 } ],
      count: 1
    }
    const validatedUsers = await schema.validate('users', usersParams)
    console.log('validatedUsers:', validatedUsers)

    // Validate user with location compound schema
    const userWithLocationParams = {
      name: 'John Doe',
      age: 1,
      latitude: 85,
      longitude: 180,
      flag: 'false' // 1, 0, false, true, 'false', 'true' is valid
    }
    const validatedUserWithLocation = await schema.validate('userWithLocation', userWithLocationParams)
    console.log('validatedUserWithLocation:', validatedUserWithLocation)
  } catch (error) {
    console.log('error:', error)
  }
}

main().then(console.log).catch(console.error)
