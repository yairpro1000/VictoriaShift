import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

const outputDir = new URL('../public/icons/', import.meta.url)

function makeCrcTable() {
  const table = new Uint32Array(256)

  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[n] = c >>> 0
  }

  return table
}

const crcTable = makeCrcTable()

function crc32(buffer) {
  let crc = 0xffffffff

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii')
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)

  const crcBuffer = Buffer.concat([typeBuffer, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcBuffer), 0)

  return Buffer.concat([length, typeBuffer, data, crc])
}

function pngBuffer(size, painter) {
  const width = size
  const height = size
  const stride = width * 4 + 1
  const raw = Buffer.alloc(stride * height)

  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0
    for (let x = 0; x < width; x += 1) {
      const pixel = painter(x, y, size)
      const offset = y * stride + 1 + x * 4
      raw[offset] = pixel[0]
      raw[offset + 1] = pixel[1]
      raw[offset + 2] = pixel[2]
      raw[offset + 3] = pixel[3]
    }
  }

  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function insideRoundedRect(x, y, left, top, width, height, radius) {
  if (x < left || x >= left + width || y < top || y >= top + height) {
    return false
  }

  const right = left + width
  const bottom = top + height

  const cornerChecks = [
    [left + radius, top + radius],
    [right - radius - 1, top + radius],
    [left + radius, bottom - radius - 1],
    [right - radius - 1, bottom - radius - 1],
  ]

  for (const [cx, cy] of cornerChecks) {
    const inCornerX = Math.abs(x - cx) > radius
    const inCornerY = Math.abs(y - cy) > radius
    if (inCornerX && inCornerY) {
      const dx = x - cx
      const dy = y - cy
      return dx * dx + dy * dy <= radius * radius
    }
  }

  return true
}

function insideCircle(x, y, cx, cy, radius) {
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= radius * radius
}

function iconPainter(x, y, size) {
  const scale = size / 512
  const bg = [245, 239, 230, 255]
  const paper = [255, 250, 244, 255]
  const accent = [217, 75, 61, 255]
  const green = [107, 157, 116, 255]
  const slate = [73, 80, 79, 255]

  let color = bg

  if (insideRoundedRect(x, y, 92 * scale, 96 * scale, 328 * scale, 320 * scale, 36 * scale)) {
    color = paper
  }
  if (insideRoundedRect(x, y, 126 * scale, 142 * scale, 260 * scale, 32 * scale, 16 * scale)) {
    color = accent
  }
  if (insideRoundedRect(x, y, 126 * scale, 212 * scale, 44 * scale, 44 * scale, 12 * scale)) {
    color = accent
  }
  if (insideRoundedRect(x, y, 194 * scale, 220 * scale, 192 * scale, 28 * scale, 14 * scale)) {
    color = slate
  }
  if (insideRoundedRect(x, y, 126 * scale, 286 * scale, 44 * scale, 44 * scale, 12 * scale)) {
    color = green
  }
  if (insideRoundedRect(x, y, 194 * scale, 294 * scale, 160 * scale, 28 * scale, 14 * scale)) {
    color = slate
  }

  const lineA = Math.abs((x - 136 * scale) - (y - 308 * scale) * 0.9) <= 5 * scale
  const boundsA =
    x >= 132 * scale &&
    x <= 150 * scale &&
    y >= 300 * scale &&
    y <= 322 * scale
  const lineB = Math.abs((x - 146 * scale) + (y - 319 * scale) * 0.82) <= 5 * scale
  const boundsB =
    x >= 142 * scale &&
    x <= 166 * scale &&
    y >= 296 * scale &&
    y <= 322 * scale

  if ((lineA && boundsA) || (lineB && boundsB)) {
    color = paper
  }

  return color
}

function maskablePainter(x, y, size) {
  const scale = size / 512
  const accent = [217, 75, 61, 255]
  const paper = [255, 250, 244, 255]
  const bg = [245, 239, 230, 255]
  const green = [107, 157, 116, 255]
  const slate = [73, 80, 79, 255]

  let color = accent

  if (insideCircle(x, y, 256 * scale, 256 * scale, 170 * scale)) {
    color = paper
  }
  if (insideRoundedRect(x, y, 178 * scale, 164 * scale, 156 * scale, 184 * scale, 22 * scale)) {
    color = bg
  }
  if (insideRoundedRect(x, y, 204 * scale, 196 * scale, 104 * scale, 18 * scale, 9 * scale)) {
    color = accent
  }
  if (insideRoundedRect(x, y, 204 * scale, 240 * scale, 24 * scale, 24 * scale, 8 * scale)) {
    color = accent
  }
  if (insideRoundedRect(x, y, 242 * scale, 243 * scale, 66 * scale, 18 * scale, 9 * scale)) {
    color = slate
  }
  if (insideRoundedRect(x, y, 204 * scale, 286 * scale, 24 * scale, 24 * scale, 8 * scale)) {
    color = green
  }
  if (insideRoundedRect(x, y, 242 * scale, 289 * scale, 56 * scale, 18 * scale, 9 * scale)) {
    color = slate
  }

  const lineA = Math.abs((x - 210 * scale) - (y - 298 * scale) * 0.9) <= 4 * scale
  const boundsA =
    x >= 206 * scale &&
    x <= 218 * scale &&
    y >= 292 * scale &&
    y <= 306 * scale
  const lineB = Math.abs((x - 217 * scale) + (y - 306 * scale) * 0.82) <= 4 * scale
  const boundsB =
    x >= 214 * scale &&
    x <= 230 * scale &&
    y >= 292 * scale &&
    y <= 308 * scale

  if ((lineA && boundsA) || (lineB && boundsB)) {
    color = paper
  }

  return color
}

mkdirSync(outputDir, { recursive: true })

writeFileSync(new URL('icon-192.png', outputDir), pngBuffer(192, iconPainter))
writeFileSync(new URL('icon-512.png', outputDir), pngBuffer(512, iconPainter))
writeFileSync(
  new URL('maskable-icon-512.png', outputDir),
  pngBuffer(512, maskablePainter),
)
