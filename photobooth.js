/**
@author kaet
@title  Camera grayscale
@desc   Grayscale input from camera
*/

import { sort } from './play.core/src/modules/sort.js'
import Camera from './play.core/src/modules/camera.js'
import Canvas from './play.core/src/modules/canvas.js'

const cam = Camera.init()
const can = new Canvas()
// For a debug view uncomment the following line:
 can.display(document.body, 10, 10)

const density = sort(' .+╋┿', 'Helvetica', false)

const data = []

export function pre(context, cursor, buffer) {
	const a = context.metrics.aspect

	// The canvas is resized so that 1 cell -> 1 pixel
	can.resize(context.cols, context.rows)
	// The cover() function draws an image (cam) to the canvas covering
	// the whole frame. The aspect ratio can be adjusted with the second
	// parameter.
	can.cover(cam, a).mirrorX().normalize().writeTo(data)
}

export function main(coord, context, cursor, buffer) {
	// Coord also contains the index of each cell:
	const color = data[coord.index]
	const index = Math.floor(color.v * (density.length-1))
	return density[index]
}


