import * as Comlink from 'comlink'

import init, { initThreadPool, process } from '../pkg/faerber'
;(async () => {
  init()
    .then((e) => {
      console.log('initialized', e)
      const threads = navigator.hardwareConcurrency;
      initThreadPool(threads)
        .then(() => {
          console.log(
            'thread pool initialized with',
            threads,
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

export const obj: {
  data: Uint8Array
  process: typeof process
} = {
  data: new Uint8Array(),
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
    console.log(`processing took ${(endTime - startTime) / 1000} s`)
    return this.data
  },
}

Comlink.expose(obj)
