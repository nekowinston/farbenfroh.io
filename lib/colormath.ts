export const rgbToHsl = (r: number, g: number, b: number): number[] => {
  r /= 255
  g /= 255
  b /= 255
  let max = Math.max(r, g, b)
  let min = Math.min(r, g, b)
  let d = max - min
  let h
  if (d === 0) h = 0
  else if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else if (max === b) h = (r - g) / d + 4
  let l = (min + max) / 2
  let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  return [h * 60, s, l]
}

export const hslToRgb = (h: number, s: number, l: number): number[] => {
  let c = (1 - Math.abs(2 * l - 1)) * s
  let hp = h / 60.0
  let x = c * (1 - Math.abs((hp % 2) - 1))
  let rgb1
  if (isNaN(h)) rgb1 = [0, 0, 0]
  else if (hp <= 1) rgb1 = [c, x, 0]
  else if (hp <= 2) rgb1 = [x, c, 0]
  else if (hp <= 3) rgb1 = [0, c, x]
  else if (hp <= 4) rgb1 = [0, x, c]
  else if (hp <= 5) rgb1 = [x, 0, c]
  else if (hp <= 6) rgb1 = [c, 0, x]
  let m = l - c * 0.5
  return [
    Math.round(255 * (rgb1[0] + m)),
    Math.round(255 * (rgb1[1] + m)),
    Math.round(255 * (rgb1[2] + m)),
  ]
}

export const calculateContrastColor = (
  hexColor: string,
  dark: string = '#000000',
  light: string = '#ffffff'
): string => {
  // clean up the string if necessary
  let rgb = hexColor.replace('#', '')
  let r = parseInt(rgb.slice(0, 2), 16)
  let g = parseInt(rgb.slice(2, 4), 16)
  let b = parseInt(rgb.slice(4, 6), 16)
  // determine the lightness of the color
  let l = (r * 299 + g * 587 + b * 114) / 1000
  return l >= 128 ? dark : light
}
