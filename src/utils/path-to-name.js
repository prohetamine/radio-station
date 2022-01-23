const pathToName = filePath => {
  try {
    const name = filePath.match(/[^\/]+\..+$/)
    return (name && name[0]) || false
  } catch (e) {
    return false
  }
}

module.exports = pathToName
