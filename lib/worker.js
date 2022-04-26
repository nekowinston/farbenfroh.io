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
  process(buf, width, height, deltaEMethod, colors) {
    console.log('processing!', width, height, deltaEMethod, colors)
    this.data = process(buf, width, height, deltaEMethod, colors)
    return this.data
  },
}

Comlink.expose(obj)
