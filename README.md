# JSON Schema Guideline

Few reasons to use JSON Schema:

- a standard specification that has client libraries for different languages 
- validation is an **absolute** must, since it is part of business logic
- write less code
- no code bloat, since we shift the responsibility of the validation to JSON Schema
- json is more descriptive than code, and modifying it is easy
- JSON Schemas can be shared and consumed by producers, code will be more difficult to share
- ensure the request params for an API call is honored
- defining `optional` and `required` fields are staight-forward
- you can version your schema - versioning your code validation will be more cumbersome

The specification can be found [here](http://json-schema.org/latest/json-schema-validation.html).

## Best Practices

For `string`: 

- define lower/upper boundaries (`minLength`, `maxLength`)
- define the `format` (`date`, `time`, `date-time`, `uri`, `url`, `email`, `hostname`, `ipv4`, `ipv6`, `regex`, `uuid`, `json-pointer`, `relative-json-pointer`)
- use `enums` if the values needs to be constrained

For `integer`:
- define `minimum` and `maximum`
- `integer` (purely round number) is different than `number` (floats are acceptable)

For `number`:
- see `integer`

For `enums`:
- description of the available enums

For `object`:
- define fields that are `required`
- remove `additionalProperties` or define acceptable additional properties
- use `definitions` to promote reusability, especially when using the same object to define an array

For `array`:
- an array should hold the objects for **one** schema only
- do not share schemas

For `all`:
- define `description` of the field if required
- define `examples` of the field data type. The value must be array
- define `default` if the field is required
- define `optional` or `required`
- define if `additionalProperties` is allowed. This will **remove** fields that are not part of the JSON Schema, making your request validation more secure.

For `compound keywords`:
- `not`, `oneOf`, `anyOf`, `allOf`
- create `definitions` to promote reusability

Naming for id can be the `email.json`, `test.json` instead of a `url`.

## Basic Example

Let's try a basic example by creating a `user.json` schema:

```json
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "description": "A user schema",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 140
    },
    "age": {
      "type": "integer",
      "minimum": 0 
    }
  },
  "required": [
    "name",
    "age"
  ]
}
```

In our code, we will load the JSON schema:

```javascript
const Schema = require('./schema')

const userSchema = require('./schema/user.json')
async function main () {
  const schema = Schema()

  schema.add('user', userSchema)

  try {
    const params = {
      name: 'John Doe',
      age: 1
    }
    const validatedUser = await schema.validate('user', params)
    console.log('validatedUser:', validatedUser)
  } catch (error) {
    console.log('error:', error)
  }
}

main().then(console.log).catch(console.error)
```

Let's see the following input and output:


### Minimum

```javascript
const params = { name: 'John Doe', age: -1 }
```

We specify that age should be greater than one. So it will throw error.
Output:
```
[ { keyword: 'minimum',
    dataPath: '.age',
    schemaPath: '#/properties/age/minimum',
    params: { comparison: '>=', limit: 0, exclusive: false },
    message: 'should be >= 0' } ]
```

### Valid

```javascript
const params = { name: 'John Doe', age: 1 }
```

The object is valid, you will get the validated params. Output:
```
{ name: 'John Doe', age: 1 }
```

### Automatic Conversion
```javascript
const params = { name: 'John Doe', age: '1' }
```

When creating our `Ajv`, we define `coerceTypes: true` so that it will safely convert our values to the desired type. In this scenario, we happen to pass a `string` age, but the validated output will be converted to string. This is valid. Output:
```
{ name: 'John Doe', age: 1 }
```

In the case of `{"type": "boolean"}`, the following 
`1`, `0`, `false`, `true`, `'false'`, `'true'` is valid.

### Strict Type Checking
```javascript
const params = { name: 'John Doe', age: 1.4 }
```

Brilliant! This is a common mistakes for most beginner - treating `integer` the same as `float`. If you have pagination in your request query and someone pass in a float, your server will crash if you do not carry out validation. With this validation, you can prevent this. If you did not carry out validation, you will have inserted **dirty data** into your database - age should not be a float. Output:
```
[ { keyword: 'type',
    dataPath: '.age',
    schemaPath: '#/properties/age/type',
    params: { type: 'integer' },
    message: 'should be integer' } ]
```

### Required

```javascript
const params = { name: 'John Doe' }
```

We specify the `name` and `age` to be `required`. Output:

```
[ { keyword: 'required',
    dataPath: '',
    schemaPath: '#/required',
    params: { missingProperty: 'age' },
    message: 'should have required property \'age\'' } ]
```

### Sharing Schema

Host the schemas on the producer of the service. This is how the `server.js` would look like:

```javascript
const express = require('express')
const app = express()
const path = require('path')

// Host our schemas as static files
app.use('/schemas', express.static(path.join(__dirname, 'schema')))

app.get('*', (req, res) => {
  res.status(200).json({
    schemas: [
      {
        name: 'user',
        path: 'http://localhost:8000/schemas/user.json'
      }
    ]
  })
})

app.listen(8000, () => {
  console.log('listening to port *:8000. press ctrl + c to cancel.')
})

```

From the consumer, load the json from the endpoint. This is how the `client.js` would look like:
```javascript
const Schema = require('./schema')

async function main () {
  const schema = Schema()
  try {
    // Load the schema from a server and call it on the client
    await schema.addFromUrl('user', 'http://localhost:8000/schemas/user.json')
    const params = {
      name: 'John Doe',
      age: 1.4
    }
    const validatedUser = await schema.validate('user', params)
    console.log('validatedUser:', validatedUser)
  } catch (error) {
    console.log('error:', error)
  }
}

main().then(console.log).catch(console.error)
```

The json schema is loaded **once** and **cached** on our client side. 

### Versioning

To ensure that the client will not break, we can introduce versioning to our schema endpoint. We can separate the folders within the schema into different version:

```bash
- schema
  - v1
    - user.json
  - v2
    - user.json
```

Note that the producer should strive to make the schema as *backward-compatible* as possible, and the consumer should strive to use *latest* schema as soon as possible.

## Reusability

Most of the time, you need to reuse a schema, and maybe add additional fields. Use `definitions` to make your schema reusable.

```json
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "description": "A user schema",
  "id": "https://seekasia.com/schemas/user.json",
  "type": "object",
  "definitions": {
    "user": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "maxLength": 140
        },
        "age": {
          "type": "integer",
          "minimum": 0
        }
      },
      "required": [
        "name",
        "age"
      ]
    }
  },
  "allOf": [
    { "$ref": "#/definitions/user" }
  ]
}
```

In the example above, we define our `user` object as `definitions`. We also point this schema to itself through the `allOf` keyword. We can still perform validation of the user object with this schema and reuse it at another file.

For example, to validate an array of `user` objects, we create a new `users.json` schema and refer to our `user.json`.

```json
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "description": "Users schema",
  "id": "https://seekasia.com/schemas/users.json",
  "type": "object",
  "properties": {
    "count": {
      "type": "integer",
      "minimum": 0
    },
    "data": {
      "type": "array",
      "items": {
        "$ref": "user.json"
      }
    }
  }
}
```

## Composition

We can also reuse previous definitions to compose **compound schemas**. You have the `user.json` and `location.json`, and you want to validate the following payload:

```js
// You can v
const user = {
  name: 'John Doe',
  age: 10,
  latitude: 65,
  longitude: 100,
  flag: false
}
```

You can compose your schemas to achieve that. The following is the content of `user-with-location.json`:

```json
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "description": "A user with location compound schema",
  "id": "https://seekasia.com/schemas/user-with-location.json",
  "type": "object",
  "allOf":[
    { "$ref": "location.json" },
    { "$ref": "user.json" },
    {
      "type": "object",
      "properties": {
        "flag": { "type": "boolean" }
      },
      "required": [ "flag" ]
    }
  ]
}
```


## Removing Additional Properties

Set the field `additionalProperties` to false to remove fields that are not in used.

```json
{
	"id": "getTransactionResponse",
	"$schema": "http://json-schema.org/draft-06/schema#",
	"title": "getTransactionResponse",
	"description": "Returns a transaction matching the given transaction hash",
	"definitions": {
		"transaction": {
			"type": "object",
			"properties": {
				"field1": {
					"description": "",
					"type": "string"
				},
			},
			"additionalProperties": false
		}
	},
	"oneOf": [
		{
			"type": "null"
		},
		{
			"$ref": "#/definitions/transaction"
		}
	]
}
```
