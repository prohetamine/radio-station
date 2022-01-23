const callback = () => {
  const callbacks = []
  return [
    (...args) => callbacks.map(callback => callback(...args)),
    (...args) => callbacks.push(...args)
  ]
}

module.exports = callback
