import Arrow90degUp from '@svg-icons/bootstrap/arrow-90deg-up.svg'
import Save from '@svg-icons/bootstrap/save.svg'
import Trash from '@svg-icons/octicons/trash.svg'
import AddImage from '@svg-icons/bootstrap/file-earmark-image.svg'
import Gear from '@svg-icons/bootstrap/gear.svg'
import Alert from '@svg-icons/bootstrap/exclamation-diamond-fill.svg'
import * as Comlink from 'comlink'
import Head from 'next/head'
import cx from 'classnames'

import React, { useEffect, useRef, useState } from 'react'
import { calculateContrastColor } from '../lib/colormath'
import { useLocalStorage } from 'usehooks-ts'
import { colorSchemePresets } from '../lib/colorschemes'
import type { FaerberWorker } from '../lib/worker'

type ImageSize = {
  width: number
  height: number
}

type DEMethod = '1976' | '1994g' | '1994t' | '2000'
enum MultiThreadOption {
  Never,
  Smart,
  Always,
}

const Faerber: React.FC = (): JSX.Element => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const resultCanvasRef = useRef<HTMLCanvasElement>(null)
  const customColorRef = useRef<HTMLInputElement>(null)
  const workerRef = useRef<Comlink.Remote<Worker & FaerberWorker>>()

  const [downloadable, setDownloadable] = useState<Boolean>(false)
  const [showWarning, setShowWarning] = useState<Boolean>(false)
  const [loading, setLoading] = useState<Boolean>(false)

  const [selColors, setSelColors] = useState<string[]>([])
  const [buffer, setBuffer] = useState<ArrayBuffer | null>()
  const [imageSize, setImageSize] = useState<ImageSize>({
    width: 0,
    height: 0,
  })

  const [selPreset, setSelPreset] = useLocalStorage<string[]>('preset', [
    'Catppuccin Mocha',
  ])
  const [selMethod, setSelMethod] = useLocalStorage<DEMethod>(
    'deMethod',
    '1976'
  )
  const [selMulti, setSelMulti] = useLocalStorage<MultiThreadOption>(
    'multithreading',
    1
  )

  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData('text/plain')
    let file: File | null = null

    if (text.startsWith('https://')) {
      await fetch(text)
        .then(async (res) => {
          const blob = await res.blob()
          const type = res.headers.get('content-type') ?? 'image/png'
          const filename =
            text.split('/').pop() ?? `unknown.${type.split('/')[1]}`

          if (res.ok) {
            file = new File([blob], filename, { type })
          }
        })
        .catch((err) => console.log(err))
    } else if (event.clipboardData.files[0] !== null) {
      file = event.clipboardData.files[0]
    } else {
      return
    }

    if (file) {
      console.log(file)
      const previewCanvas = previewCanvasRef.current
      const previewCtx = previewCanvasRef.current?.getContext('2d')
      if (!previewCanvas || !previewCtx) return
      previewCtx.clearRect(0, 0, imageSize.width, imageSize.height)
      setBuffer(new ArrayBuffer(0))

      if (!file) return null
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onloadend = () => {
        onImageLoad(reader, previewCanvas, previewCtx)
      }
    }
  }

  // loads the uploaded image to a blob & displays it in the preview
  const loadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    // clear the previous canvas & reset the buffer state
    const previewCanvas = previewCanvasRef.current
    const previewCtx = previewCanvasRef.current?.getContext('2d')
    if (!previewCanvas || !previewCtx) return null
    previewCtx.clearRect(0, 0, imageSize.width, imageSize.height)
    setBuffer(new ArrayBuffer(0))

    const file = e.target.files?.[0]
    if (!file) return null
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onloadend = () => {
      onImageLoad(reader, previewCanvas, previewCtx)
    }
  }

  // loads the uploaded image to a blob & displays it in the preview
  const onImageLoad = (
    reader: FileReader,
    previewCanvas: HTMLCanvasElement,
    previewCtx: CanvasRenderingContext2D
  ) => {
    const img: HTMLImageElement = new Image()
    img.src = reader.result as any
    img.onload = () => {
      // create an ImageData object
      const imgData = previewCtx.createImageData(img.width, img.height)
      previewCanvas.width = img.width
      previewCanvas.height = img.height
      setImageSize({ width: img.width, height: img.height })
      // copy the image contents to the ImageData object
      previewCtx.drawImage(img, 0, 0)
      const pix = previewCtx.getImageData(0, 0, img.width, img.height).data
      pix.map((_, i) => (imgData.data[i] = pix[i]))
      previewCtx.putImageData(imgData, 0, 0)
      setBuffer(imgData.data)
    }
  }

  const downloadResult = () => {
    const resultCanvas = resultCanvasRef.current
    const resultCtx = resultCanvasRef.current?.getContext('2d')
    if (!resultCanvas || !resultCtx) return null
    resultCtx.canvas.toBlob((blob) => {
      if (!blob) return null
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'result.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  const addCustomColor = () => {
    const color = customColorRef.current?.value
    if (!color) return null
    const regex = /^#[\dA-F]{6}$/i
    const alreadyExists = selColors.find((c) => c === color)
    if (regex.test(color) && !alreadyExists) {
      setSelColors([...selColors, color])
      customColorRef.current.value = ''
    } else if (alreadyExists) {
      customColorRef.current.value = ''
    }
  }

  // called when the preset is changed
  useEffect(() => {
    let colors: string[] = []
    selPreset.forEach((preset) => {
      colors = [...colors, ...colorSchemePresets[preset]]
    })
    setSelColors(colors)
  }, [selPreset])

  const handlePresetClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const preset = e.currentTarget.innerText

    // check that the preset name actually exists
    if (!colorSchemePresets.hasOwnProperty(preset)) return null

    if (e.shiftKey) {
      if (selPreset.includes(preset)) {
        setSelPreset(selPreset.filter((p) => p !== preset))
      } else {
        setSelPreset([...selPreset, preset])
      }
    } else {
      setSelPreset([preset])
    }
  }

  // onMount
  useEffect(() => {
    ;(async () => {
      workerRef.current = Comlink.wrap(
        new Worker(new URL('../lib/worker.ts', import.meta.url), {
          type: 'module',
          credentials: 'omit',
        })
      )
    })().then(() => {})
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  // called when the user changes image/parameters
  useEffect(() => {
    const getColorscheme = (): number[] => {
      return selColors.map((color: string) => {
        return parseInt(color.replace('#', ''), 16)
      })
    }

    const processImage = async (colorscheme: number[]) => {
      const worker = workerRef.current
      if (!worker) return null
      const resultCtx = resultCanvasRef.current?.getContext('2d')
      if (!resultCtx) return null
      if (!buffer) return null

      await worker.process(
        new Uint8Array(buffer),
        imageSize.width,
        imageSize.height,
        selMethod,
        new Uint32Array(colorscheme),
        selMulti
      )
      const imgData = new ImageData(
        new Uint8ClampedArray(await worker.data),
        imageSize.width,
        imageSize.height
      )
      resultCtx.canvas.width = imageSize.width
      resultCtx.canvas.height = imageSize.height
      resultCtx.putImageData(imgData, 0, 0)
      setShowWarning(false)
      setDownloadable(true)
      setLoading(false)
    }

    if (buffer) {
      setLoading(true)
      // warn if the image is large, as it will take a while to process
      if (imageSize.width * imageSize.height >= 2560 * 1440) {
        setShowWarning(true)
      }

      // get the converted colorscheme
      const colorscheme = getColorscheme()
      // call webassembly
      processImage(colorscheme).then(() =>
        console.debug('[DEBUG] processImage() finished')
      )
    }
  }, [
    buffer,
    selMethod,
    selColors,
    imageSize.width,
    imageSize.height,
    selMulti,
  ])

  return (
    <>
      <Head>
        <title>farbenfroh.io :: faerber</title>
      </Head>
      <div className="relative h-full" onPaste={handlePaste}>
        <div className="fixed z-50 w-full">
          {showWarning && (
            <div className="top-2 mx-auto mt-8 flex max-w-xl items-center gap-4 rounded-md bg-peach p-4 text-xl text-crust shadow-lg">
              <Alert className="h-12 w-12" />
              You have used quite a large image. This may take a while, and your
              browser might freeze, depending on your hardware.
            </div>
          )}
        </div>
        <div className="pt-8 text-center md:p-0">
          <h1 className="p-4 font-lobster text-8xl text-pink">faerber</h1>
          <h2 className="my-2 text-2xl text-pink">
            Makes your wallpaper fit your favorite colorscheme!
          </h2>
          <p className="prose mx-auto max-w-md text-text">
            When you have spent a lot of time tweaking your OS, you don{"'"}t
            want to just grab any old wallpaper that might not fit your favorite
            look. Drop it here, and it might just look great!
          </p>
        </div>
        <div className="py-4 text-center">
          <label
            htmlFor="inputImage"
            className="m-2 inline-block cursor-pointer rounded bg-surface2 p-2"
          >
            <input
              type="file"
              accept="image/png,image/webp,image/jpeg"
              name="inputImage"
              id="inputImage"
              className="sr-only"
              onChange={(e) => loadImage(e)}
            />
            <AddImage className="mr-2 inline-block h-5 w-5" />
            Select image
          </label>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 p-2 lg:flex-row">
          <div className="flex aspect-video w-full items-center justify-center border border-crust bg-mantle p-4">
            <canvas
              ref={previewCanvasRef}
              className="max-h-full max-w-full"
            ></canvas>
          </div>
          <div className="relative flex aspect-video w-full items-center justify-center border border-crust bg-mantle p-4">
            {loading && (
              <div className="absolute inset-0 flex w-full items-center justify-center">
                <div className="rounded-full bg-crust">
                  <Gear className="h-24 w-24 animate-spin p-4 text-pink" />
                </div>
              </div>
            )}
            <canvas
              id="resultCanvas"
              ref={resultCanvasRef}
              className="max-h-full max-w-full"
            ></canvas>
          </div>
        </div>
        {downloadable && (
          <div className="py-4 text-center">
            <div
              onClick={() => downloadResult()}
              className="m-2 inline-block cursor-pointer rounded bg-surface2 p-2"
            >
              <Save className="mr-2 inline-block h-5 w-5"></Save>
              <span>Save image</span>
            </div>
          </div>
        )}
        <div>
          <div className="mx-auto max-w-6xl ">
            <h3 className="mx-auto max-w-fit rounded-t-lg border border-b-0 border-surface1 bg-surface2 px-4 text-center text-xl">
              Colors to match against:
            </h3>
            <div className="divide-y divide-dashed divide-surface1 overflow-hidden rounded-xl border border-surface1 bg-mantle shadow-lg">
              <div className="pb-2">
                <div className="grid max-h-80 grid-cols-4 overflow-y-auto overflow-x-hidden font-mono">
                  {selColors.map((el, i) => (
                    <div
                      key={i}
                      className="group relative flex items-center justify-center p-2 transition-[shadow,transform] hover:z-10 hover:scale-105 hover:shadow"
                      style={{ background: `${el}` }}
                    >
                      <span
                        className="h-6 rounded px-1"
                        style={{ color: `${calculateContrastColor(el)}` }}
                      >
                        {el.toUpperCase()}
                      </span>
                      <Trash
                        className="absolute right-2 h-6 w-6 cursor-pointer rounded p-1 opacity-0 transition-transform hover:scale-125 hover:opacity-100 group-hover:opacity-75"
                        style={{ color: `${calculateContrastColor(el)}` }}
                        onClick={() => {
                          const newArr = [...selColors]
                          newArr.splice(i, 1)
                          setSelColors(newArr)
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col justify-center gap-2 px-8 py-2 md:flex-row md:px-0">
                  <label className="flex items-center" htmlFor="customColorAdd">
                    <Arrow90degUp className="mr-1 h-4 w-4 -translate-y-0.5" />
                    Custom color
                  </label>
                  <input
                    type="text"
                    id="customColorAdd"
                    ref={customColorRef}
                    className="bg-surface2"
                    onChange={(e) => {
                      const color = e.target.value.replace('#', '')
                      if (color.length >= 6) {
                        e.target.value = '#' + color.slice(0, 6)
                      }
                    }}
                    onKeyDown={(e) => {
                      const color = e.currentTarget.value.replace('#', '')
                      if (color.length === 6 && e.key === 'Enter') {
                        addCustomColor()
                      }
                    }}
                  />
                  <button
                    className="bg-surface2 px-2"
                    onClick={() => addCustomColor()}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="py-2 text-center">
                <p className="text-lg">
                  Here are some colorscheme presets for you:
                </p>
                <div className="m-4 grid grid-cols-2 justify-center gap-3 md:grid-cols-5">
                  {Object.keys(colorSchemePresets).map((preset) => (
                    <button
                      key={preset}
                      className={cx(
                        'rounded bg-surface2 p-1 hover:outline hover:outline-pink/60',
                        {
                          'outline outline-pink': selPreset.includes(preset),
                        }
                      )}
                      onClick={handlePresetClick}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-subtext0">
                  You can hold <kbd>Shift</kbd> while pressing presets to
                  combine them.
                </p>
                <div className="text-sm text-subtext0">
                  <p>Your favorite colorscheme is missing?</p>
                  <p>
                    How about you{' '}
                    <a
                      href="https://github.com/nekowinston/farbenfroh.io"
                      className="underline"
                      target={'_blank'}
                      rel="noreferrer"
                    >
                      open a PR/create an issue
                    </a>
                    ?
                  </p>
                </div>
              </div>
              <div className="py-2">
                <div className="mx-auto max-w-fit">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div>
                      <label htmlFor="methodSelector" className="block">
                        Color comparison method:
                      </label>
                      <select
                        id="methodSelector"
                        name="methodSelector"
                        className="mt-1 block w-full rounded-md border-surface2 bg-surface2 py-2 pl-3 pr-10 text-text focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        defaultValue={selMethod}
                        onChange={(e) =>
                          setSelMethod(e.target.value as DEMethod)
                        }
                      >
                        <option value="1976">Delta E 76</option>
                        <option value="1994t">Delta E 94-T</option>
                        <option value="1994g">Delta E 94-G</option>
                        <option value="2000">Delta E 2000</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="multiThreadingSelector" className="block">
                        Multi-threading:
                      </label>
                      <select
                        id="multiThreadingSelector"
                        name="multiThreadingSelector"
                        className="mt-1 block w-full rounded-md border-surface2 bg-surface2 py-2 pl-3 pr-10 text-text focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        defaultValue={selMulti}
                        onChange={(e) =>
                          setSelMulti(
                            Number(e.target.value) as MultiThreadOption
                          )
                        }
                      >
                        <option value={MultiThreadOption.Never}>Never</option>
                        <option value={MultiThreadOption.Smart}>Smart</option>
                        <option value={MultiThreadOption.Always}>Always</option>
                      </select>
                    </div>
                  </div>
                </div>
                <p className="prose-lg p-4 text-text">
                  The color comparison method is how the algorithm calculates
                  the difference between each pixel in your image & the limited
                  colors in your colorscheme. The numbers correspond to the
                  years the standard were set by the CIE. Newer standards
                  require more computing power, but might give better / more
                  accurate results. More accurate isn{"'"}t always {"'"}better
                  {"'"} - since people like vinyl, and Instagram filters, old
                  standards are also included. Because art.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 text-center opacity-30 transition ease-linear hover:-translate-y-1 hover:opacity-100">
          a project by{' '}
          <a href="https://github.com/nekowinston" className="text-blue">
            winston 🤘
          </a>
        </div>
      </div>
    </>
  )
}

export default Faerber
