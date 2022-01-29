const text = (data, max) =>
  data.length > max
    ? (data[0].toUpperCase() + data.toLowerCase().slice(1)).slice(0, max) + '..'
    : data[0].toUpperCase() + data.slice(1)

const date = data =>
  data.length === 8
    ? `${data.slice(0, 4)}/${data.slice(4, 6)}/${data.slice(6, 8)}`
    : false

module.exports = {
  text,
  date
}
