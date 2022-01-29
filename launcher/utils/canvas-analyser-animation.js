import roundRect from './round-rect'

const canvasAnalyserAnimation = (ctx, x, bottom, max, min) => {
  let oldAngle = 7
  let currentAngle = 7
  let isLoop = true

  const loop = () => {
    const int = currentAngle
    ctx.clearRect(x-2, 0, 3+3, bottom + 2)
    roundRect(ctx, x, bottom - int, 3, int, 2)

    if (oldAngle > currentAngle) {
      currentAngle += 0.5
    } else {
      currentAngle -= 0.5
    }

    isLoop && requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)

  return {
    kill: () => isLoop = false,
    animation: s => {
      const normalize = Math.abs((s - 128) / 2) + 7
      oldAngle = normalize < min ? min : normalize > max ? max : normalize
    }
  }
}

export default canvasAnalyserAnimation
