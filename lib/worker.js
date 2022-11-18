import * as Comlink from 'comlink'

import init, { initThreadPool, process } from '../pkg'
;(async () => {
  init()
    .then((e) => {
      console.log('initialized', e)
      initThreadPool(navigator.hardwareConcurrency)
        .then(() => {
          console.log(
            'thread pool initialized with',
            navigator.hardwareConcurrency,
            'threads.'
          )
        })
        .catch((e) => {
          console.error('thread pool init failed', e)
        })
    })
    .catch((e) => {
      console.error('init failed', e)
    })
})()

const obj = {
  data: [],
  process(buf, width, height, deltaEMethod, colors, multithreading) {
    console.log(
      `${width}x${height} (${width * height} pixels), ${
        colors.length
      } colors in the palette`
    )
    let startTime = performance.now()
    this.data = process(
      buf,
      width,
      height,
      deltaEMethod,
      colors,
      multithreading
    )
    let endTime = performance.now()
    console.log(`processing took ${endTime - startTime} ms`)
    return this.data
  },
}

Comlink.expose(obj)
