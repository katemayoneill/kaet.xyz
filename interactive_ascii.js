/**
@author kate
@title  name 
@desc   name display
*/

let config = null;
let big, small, grid = []
let map = new Map();

const PHYSICS = {
	    repel_distance : 8,
	  	repel_strength : 0.5,
	 	min_distance   : 0.1,
      	spring_force   : 0.08,
      	friction       :  0.92
};

const MOBILE_BREAKPOINT = {
	width  : 800,
	height : 400
}

function check_config(cfg) {
	if (!cfg) throw new Error('config required');
	if (!cfg.files || !cfg.files || !cfg.files.small) {
		throw new Error('config.art_files.big and config.art_files.small required');
	}
}

function get_css(pre) {
	const s = window.getComputedStyle(pre);
	return {
		backgroundColor: s.backgroundColor || 'white',
		color: s.color || 'black',
		fontFamily: s.fontFamily || 'monospace',
		lineHeight: s.lineHeight || '1'
	};
}

function log(level, message, data = null) {
	console.log(`[ascii-animation] ${level.toUpperCase()}: ${message}`, data || '');
}

function  coords_to_key(x, y) {
	return `${Math.floor(x)},${Math.floor(y)}`;
}

function rows_to_ascii(rows) {
	let grid = [];
		rows.forEach((line, y) => {
			for (let x = 0; x < line.length; x++) {
				if (line[x] !== ' ') {
					grid.push({x, y, char: line[x], offset_x: 0, offset_y: 0, vel_x: 0, vel_y: 0});
				}
			}
		});
	return { grid };
}

function change_ascii() {
	const bp = config.mobile_breakpoint;
	const is_mobile = window.innerWidth < bp.width || window.innerHeight < bp.width;
	grid = is_mobile ? small.grid : big.grid;
	map.clear();
	grid.forEach(art => map.set(coords_to_key(art.x, art.y), art));
}

export function on_resize() {
	change_ascii();
}

export function pre(context, cursor) {
	grid.forEach( art => {
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
}

export function main(coord, context, cursor) {
	const art = map.get(coords_to_key(coord.x, coord.y));
	if (!art) return ' ';

	const offset_x = Math.round(art.offset_x);
	const offset_y = Math.round(art.offset_y);
	if (Math.floor(coord.x) === art.x + offset_x && Math.floor(coord.y) === art.y + offset_y) {
		return art.char;
	}
	return ' ';
}

export async function init(user_config) {
	check_config(user_config);

	try {
		log('info', 'initializing', user_config);

		const physics = { ...PHYSICS, ...user_config.physics };
		const breakpoint = { ...MOBILE_BREAKPOINT, ...user_config.mobile_breakpoint };
		const settings = user_config.settings || get_css(user_config.pre || document.querySelector('pre'));

		config = {
			files: user_config.files,
			physics: {
				repel_distance: physics.repel_distance,
				repel_strength: physics.repel_strength,
				friction: physics.friction,
				repel_force: physics.repel_force,
				min_distance: physics.min_distance
			},
			mobile_breakpoint: breakpoint,
			settings
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

		return { main, pre, settings: config.settings, on_resize };
	} catch (err) {
		log('error', err.message);
		throw err;
	}
}
