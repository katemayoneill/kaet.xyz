/**
@author kate
@title  name
@desc   name display
*/

let config = null;
let big, small, grid = [];
let renderMap = new Map();
let context = null;

const PHYSICS = {
	    repel_distance : 8,
	  	repel_strength : 0.5,
	 	min_distance   : 0.1,
      	spring_force   : 0.08,
      	friction       :  0.92
};

/**
verifies ascii input files exist

@param {object} cfg
@throws {Error} if files missing
*/
function check_config(cfg) {
	if (!cfg) throw new Error('config required');
	if (!cfg.files || !cfg.files.big || !cfg.files.small) {
		throw new Error('config.files.big and config.files.small required');
	}
}

/**
logs a message

@param {string} level e.g. 'info', 'error'
@param {string} message
@param {unknown} [data]
*/
function log(level, message, data = null) {
	console.log(`[animation] ${level.toUpperCase()}: ${message}`, data || '');
}

/**
converts coordinates to a map key

@param {number} x
@param {number} y
@returns {string}
*/
function  coords_to_key(x, y) {
	return `${Math.floor(x)},${Math.floor(y)}`;
}

/**
parses ascii rows into a grid of characters with physics state

@param {string[]} rows
@returns {{ grid: Array<{x, y, char, offset_x, offset_y, vel_x, vel_y}> }}
*/
function rows_to_ascii(rows) {
	let grid = [];
	let width = 0;
		rows.forEach((line, y) => {
			for (let x = 0; x < line.length; x++) {
				if (line[x] !== ' ') {
					grid.push({x, y, char: line[x], offset_x: 0, offset_y: 0, vel_x: 0, vel_y: 0});
					if (x >= width) width = x + 1;
				}
			}
		});
	return { grid, width };
}

/**
switches between big and small ascii based on element cols
*/
function change_ascii() {
	grid = context && context.cols >= big.width ? big.grid : small.grid;
	renderMap.clear();
}

/**
play.core resize hook
*/
export function on_resize() {
	change_ascii();
}

/**
updates physics and rebuilds render map

@param {object} context
@param {{x, y, pressed}} cursor
*/
export function pre(ctx, cursor) {
	context = ctx;
	grid.forEach(art => {
		const p = config.physics;
		const dx = art.x + art.offset_x - cursor.x;
		const dy = art.y + art.offset_y - cursor.y;
		const distance_sq = dx * dx + dy * dy;

		if (distance_sq < p.repel_distance ** 2 && distance_sq > p.min_distance) {
			const distance = Math.sqrt(distance_sq);
			const force = p.repel_strength * (1 - distance / p.repel_distance);
			const angle = Math.atan2(dy, dx);
			art.vel_x += Math.cos(angle) * force;
			art.vel_y += Math.sin(angle) * force;
		}
		art.vel_x -= art.offset_x * p.spring_force;
		art.vel_y -= art.offset_y * p.spring_force;
		art.vel_x *= p.friction;
		art.vel_y *= p.friction;
		art.offset_x += art.vel_x;
		art.offset_y += art.vel_y;
	});
	renderMap.clear();
	grid.forEach(art => {
		renderMap.set(coords_to_key(art.x + Math.round(art.offset_x), art.y + Math.round(art.offset_y)), art.char);
	});
}

/**
returns character at coord from render map

@param {{x, y}} coord
@returns {string}
*/
export function main(coord, context, cursor) {
	return renderMap.get(coords_to_key(coord.x, coord.y)) || ' ';
}

/**
play.core boot hook loads ascii files and initialises config

@param {object} context
@returns {Promise<void>}
@throws {Error} if ascii files are missing
*/
export async function boot(ctx, buffer, userData) {
	context = ctx;
	const user_config = context.settings;
	check_config(user_config);

	try {
		log('info', 'initializing', user_config);

		const physics = { ...PHYSICS, ...user_config.physics };

		config = {
			files: user_config.files,
			physics: {
				repel_distance: physics.repel_distance,
				repel_strength: physics.repel_strength,
				friction: physics.friction,
				spring_force: physics.spring_force,
				min_distance: physics.min_distance
			},
		};

		log('info', 'loading files');
		const load_file = file => fetch(file)
			.then(r => {
				if (!r.ok) throw new Error(`${file}: ${r.status}`);
				return r.text();
			})
			.then(t => rows_to_ascii(t.split('\n')));

		[big, small] = await Promise.all([
			load_file(config.files.big),
			load_file(config.files.small)
		]);

		change_ascii();
		log('info', `loaded ${big.grid.length} big and ${small.grid.length} small characters`);
	} catch (err) {
		log('error', err.message);
		throw err;
	}
}
