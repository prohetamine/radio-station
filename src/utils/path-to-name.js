const path = require('path')

const pathToName = filePath => {
  const name = path.basename(filePath)

  if (name.match(/\./)) {
    return name
  }

  return false
}

module.exports = pathToName
