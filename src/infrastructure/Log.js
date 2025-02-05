import { Config } from '../env/Config'

export const Log = {}

let logLevel = Config.debug.logLevel

const allLevels = {
  debug: {
    index: 0,
    run: (...args) => {
      if (logLevel > 0) { return }
      console.debug(timestamp(), ...args)
    }
  },
  info: {
    index: 1,
    run: (...args) => {
      if (logLevel > 1) { return }
      console.info(timestamp(), ...args)
    }
  },
  log: {
    index: 2,
    run: (...args) => {
      if (logLevel > 2) { return }
      console.log(timestamp(), ...args)
    }
  },
  warning: {
    index: 3,
    run: (...args) => {
      if (logLevel > 3) { return }
      console.warn(timestamp(), ...args)
    }
  },
  error: {
    index: 4,
    run: (...args) => {
      console.error(timestamp(), ...args)
    }
  }
}

const timestamp = () => {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
}

Log.levels = () => ({ ...allLevels })

Log.setLevel = level => {
  const indices = Object.values(allLevels)

  if (!indices.includes(level)) {
    throw new Error(`Unsupported log level: ${level}`)
  }

  logLevel = level
}

Log.create = (name, type = 'log') => {
  if (!Object.hasOwnProperty.call(allLevels, type)) {
    throw new Error(`Unsupported log type: ${type}`)
  }

  const logName = `${type} [${name}]:`
  const logFn = allLevels[type].run

  if (!logFn) {
    throw new Error(`Unexpected: no log function retrieved for type ${type}`)
  }

  return (...args) => logFn(logName, ...args)
}

Log.debug = (...args) => allLevels.debug.run(...args)

Log.info = (...args) => allLevels.info.run(...args)

Log.log = (...args) => allLevels.log.run(...args)

Log.warn = (...args) => allLevels.warning.run(...args)

Log.error = (...args) => allLevels.error.run(...args)
