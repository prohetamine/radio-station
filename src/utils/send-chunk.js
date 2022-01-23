const sendChunk = (listeners, chunk) => {
  listeners.forEach(
    client =>
      client.write(chunk)
  )
}

module.exports = sendChunk
