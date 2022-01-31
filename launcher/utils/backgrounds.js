function importAll(r) {
  return r.keys().map(a => r(a).default)
}

const images = importAll(require.context('./../assets/backgrounds', false, /\.(png|jpe?g|svg)$/))

export default images
