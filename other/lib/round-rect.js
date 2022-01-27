const roundRect = (ctx, x, y, width, height, radius) => {
  let w = width
  let h = height
  let r = radius
  ctx.stroke()
  ctx.fill()
  ctx.beginPath()

  if ((w >= r * 2) && (h >= r * 2)) {
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
  } else if ((w < r * 2) && (h > r * 2)) {
      r = w / 2
      ctx.moveTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
  } else if ((w > r * 2) && (h < r * 2)) {
      r = h / 2
      ctx.moveTo(x + w - r, y + h)
      ctx.quadraticCurveTo(x + w, y + h, x + w, y + r)
      ctx.quadraticCurveTo(x + w, y, x + w - r, y)
      ctx.lineTo(x + r, y)
      ctx.quadraticCurveTo(x, y, x, y + r)
      ctx.quadraticCurveTo(x, y + h, x + r, y + h)
  } else if ((w < 2 * r) && (h < 2 * r)) {
      ctx.moveTo(x + w / 2, y + h)
      ctx.quadraticCurveTo(x + w, y + h, x + w, y + h / 2)
      ctx.quadraticCurveTo(x + w, y, x + w / 2, y)
      ctx.quadraticCurveTo(x, y, x, y + h / 2)
      ctx.quadraticCurveTo(x, y + h, x + w / 2, y + h)
  }
  ctx.closePath()
}

module.exports = {
  roundRect
}
