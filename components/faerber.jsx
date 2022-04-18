import { Arrow90degUp } from '@styled-icons/bootstrap/Arrow90degUp'
import { Download, Trash, Upload } from '@styled-icons/octicons'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import tw from 'tailwind-styled-components'
import { calculateContrastColor } from '../lib/colormath'
import { colorSchemePresets } from '../lib/colorschemes'
import { process } from '../pkg'

const Button = tw.button`
m-2 inline-block rounded bg-slate-500 p-2
`

const Faerber = () => {
  const previewImgRef = useRef()
  const resultImgRef = useRef()
  const customColorRef = useRef()
  const [selColors, setSelColors] = useState(colorSchemePresets['Dracula'])
  const [selMethod, setSelMethod] = useState('76')
  // the input image to process, as an ArrayBuffer
  const [buffer, setBuffer] = useState(null)

  // loads the uploaded image to a blob & displays it in the preview
  const loadImage = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      previewImgRef.current.src = reader.result
    }

    // when the preview is set, run the process
    reader.onloadend = () => {
      // new reader to read an arrayBlob into
      const readerAB = new FileReader()
      readerAB.readAsArrayBuffer(file)
      readerAB.onloadend = () => {
        setBuffer(readerAB.result)
      }
    }
  }

  const downloadResult = () => {
    if (resultImgRef.current.src) {
      const a = document.createElement('a')
      a.href = resultImgRef.current.src
      a.download = 'faerber.png'
      a.click()
      a.remove()
    }
  }

  const addCustomColor = () => {
    const color = customColorRef.current.value
    const regex = /^#[\dA-F]{6}$/i
    if (regex.test(color)) {
      setSelColors([...selColors, color])
      customColorRef.current.value = ''
    }
  }

  useEffect(() => {
    const getColorscheme = () => {
      const flat = []
      // convert the array of #rrggbb strings to an array of [r, g, b] arrays
      selColors.forEach((val) => {
        val = val.replace('#', '')
        const rgb = [val.slice(0, 2), val.slice(2, 4), val.slice(4, 6)]
        rgb.map((v) => (v = flat.push(parseInt(v, 16))))
      })
      return new Uint8Array(flat)
    }

    if (buffer) {
      // convert to Uint8Array, to pass it on to webassembly
      const data = new Uint8Array(buffer)
      // get the converted colorscheme
      const colorscheme = getColorscheme()
      // call webassembly
      const res = process(data, selMethod, colorscheme)

      // convert the result to a blob
      const blob = new Blob([res], { type: 'image/png' })
      const readerResult = new FileReader()
      readerResult.readAsDataURL(blob)
      readerResult.onloadend = () => {
        resultImgRef.current.src = readerResult.result
      }
    }
  }, [buffer, selMethod, selColors])

  return (
    <>
      <Head>
        <title>farbenfroh.io :: faerber</title>
      </Head>
      <div className="h-full bg-slate-800 text-gray-100">
        <div className="pt-8 text-center md:p-0">
          <h1 className="bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text p-4 font-lobster text-8xl text-transparent">
            faerber
          </h1>
          <h2 className="my-2 text-2xl">
            Makes your wallpaper fit your favorite colorscheme!
          </h2>
          <p className="prose mx-auto max-w-md text-gray-200">
            When you spent a lot of time tweaking your OS, you don{"'"}t want to
            just grab any old wallpaper that might not fit your favorite look.
            Drop it here, and it might just look great!
          </p>
        </div>
        <div className="py-4 text-center">
          <Button $as="label" htmlFor="inputImage">
            <input
              type="file"
              accept="image/png,image/webp"
              name="inputImage"
              id="inputImage"
              className="sr-only"
              onChange={(e) => loadImage(e)}
            />
            <Upload className="h-5 w-5" />
            Upload
          </Button>
        </div>
        <div className="flex justify-center gap-1 p-2">
          <div className="relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-2xl border border-purple-900/60 bg-gray-800">
            <img
              ref={previewImgRef}
              alt={'preview'}
              className="absolute h-full w-full object-contain"
            />
          </div>
          <div className="relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-2xl border border-purple-900/60 bg-gray-800">
            <img
              ref={resultImgRef}
              alt={'result'}
              className="absolute h-full w-full object-contain"
            />
          </div>
        </div>
        {resultImgRef.current?.src !== undefined && (
          <div className="py-4 text-center">
            <Button onClick={() => downloadResult()}>
              <Download className="h-5 w-5"></Download>
              <span>Download</span>
            </Button>
          </div>
        )}
        <div>
          <div className="mx-auto max-w-xl ">
            <h3 className="mx-auto max-w-fit rounded-t-lg border border-b-0 border-slate-500 bg-slate-700 px-4 text-center text-xl">
              Colors to match against:
            </h3>
            <div className="divide-y divide-dashed divide-slate-400 overflow-hidden rounded-xl border border-slate-500 bg-slate-700 shadow-lg">
              <div className="pb-2">
                <div className="grid grid-cols-4 font-mono">
                  {selColors.map((el, i) => (
                    <div
                      key={i}
                      className="group relative flex items-center justify-center border-slate-800/30 p-2 transition-[shadow,transform] hover:z-10 hover:scale-105 hover:shadow"
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
                <div className="flex justify-center gap-2 py-2">
                  <label className="flex items-center" htmlFor="customColorAdd">
                    <Arrow90degUp className="mr-1 h-4 w-4 -translate-y-0.5" />
                    Custom color
                  </label>
                  <input
                    type="text"
                    id="customColorAdd"
                    ref={customColorRef}
                    className="bg-slate-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addCustomColor()
                      }
                    }}
                  />
                  <button
                    className="bg-slate-500 px-2"
                    onClick={() => addCustomColor()}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="py-2 text-center">
                <p className="pb-2 text-lg">
                  Here are some colorscheme presets for you:
                </p>
                <div className="flex justify-center gap-3">
                  {Object.keys(colorSchemePresets).map((preset) => (
                    <button
                      key={preset}
                      className="rounded bg-slate-600 p-1 transition-[transform,shadow] hover:-translate-y-1 hover:scale-110 hover:shadow-lg"
                      onClick={() => setSelColors(colorSchemePresets[preset])}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="py-2">
                <div className="mx-auto max-w-fit">
                  <label htmlFor="methodSelector" className="block">
                    Color comparison method:
                  </label>
                  <select
                    id="methodSelector"
                    name="methodSelector"
                    className="mt-1 block w-full rounded-md border-gray-300 bg-slate-700 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    defaultValue={selMethod}
                    onChange={(e) => setSelMethod(e.target.value)}
                  >
                    <option value="76">Delta E 76</option>
                    <option value="94t">Delta E 94-T</option>
                    <option value="94g">Delta E 94-G</option>
                    <option value="2000">Delta E 2000</option>
                  </select>
                </div>
                <p className="prose-lg p-4 text-gray-100">
                  The color comparison method is how the algorithm calculates
                  the difference between each pixel in your image & the limited
                  colors in your colorscheme. The numbers correspond to the
                  years the standard were set by the IEC. Newer standards
                  require more computing power, but might give better / more
                  accurate results. More accurate isn{"'"}t always {"'"}better
                  {"'"} - since people like vinyl, and Instagram filters, old
                  standards are also included. Because art.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Faerber
