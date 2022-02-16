const SimpleSchema = require('simpl-schema')
const schema = def => new SimpleSchema(def)

const settingsSchema = schema({
  remotes: schema({
    content: schema({
      url: String,
      jwt: schema({
        key: String,
        sub: String
      }),
      sync: schema({
        "field": Boolean,
        "unit": Boolean,
        "unitSet": Boolean,
        "dimension": Boolean,
        "level": Boolean,
        "testCycle": Boolean
      })
    })
  }),
  restore: schema({
    codes: schema({
      numberOfCodes: SimpleSchema.Integer,
      length: SimpleSchema.Integer,
      uppercase: Boolean,
      forbidden: schema({
        source: String,
        flags: {
          type: String,
          optional: true
        }
      }),
      maxRetries: SimpleSchema.Integer
    })
  }),
  log: schema({
    level: SimpleSchema.Integer
  }),
  public: schema({})
})

module.exports = function (settings) {
  settingsSchema.validate(settings)
}
