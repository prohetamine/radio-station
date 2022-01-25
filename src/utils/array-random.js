const random = array => {
  const randomIndex = parseInt(Math.random() * array.length)
  return array[randomIndex] || null
}

module.exports = random
