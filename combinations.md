# With $data type

```js
const Ajv = require('ajv')
const ajv = new Ajv({
  allErrors: true,
  $data: true,
  useDefaults: true,
  coerceTypes: true,
  removeAdditional: true,
  schemas: []
})

const numberSchema = {
  properties: {
    larger: {
      type: 'number', // Must be number.
      minimum: { $data: '1/smaller' } // Must be equal to smaller or larger.
    },
    smaller: {
      type: 'number'
    }
  }
}

const result = ajv.validate(numberSchema, {
  smaller: 0,
  larger: -1
})
console.log(result, ajv.errors)
// false [ { keyword: 'minimum',
//     dataPath: '.larger',
//     schemaPath: '#/properties/larger/minimum',
//     params: { comparison: '>=', limit: 0, exclusive: false },
//     message: 'should be >= 0' } ]

const result2 = ajv.validate(numberSchema, {
  smaller: 0,
  larger: 0
})
console.log(result2, ajv.errors)
// true null

// with exclusive minimum.
const numberSchema2 = {
  properties: {
    larger: {
      type: 'number', // Must be number.
      // minimum: { $data: '1/smaller' }, // Must be equal to smaller or larger.
      exclusiveMinimum: { $data: '1/smaller' }// Must be greater than smaller.
    },
    smaller: {
      type: 'number'
    }
  }
}
const result3 = ajv.validate(numberSchema2, {
  smaller: 1,
  larger: 1 // Will throw error.
})
console.log(result3, ajv.errors)
// false [ { keyword: 'exclusiveMinimum',
//     dataPath: '.larger',
//     schemaPath: '#/properties/larger/exclusiveMinimum',
//     params: { comparison: '>', limit: 1, exclusive: true },
//     message: 'should be > 1' } ]
```
