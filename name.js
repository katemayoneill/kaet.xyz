/**
@author kate
@title  name 
@desc   name display
*/

const REPEL_DISTANCE = 8;
const REPEL_STRENGTH = 0.5;
const MIN_DISTANCE = 0.1;
const SPRING_FORCE = 0.08;
const FRICTION =  0.92;

const MOBILE_WIDTH = 800;
const MOBILE_HEIGHT = 400;

let big, small, grid = [], map = new Map();




const BIG_ROWS = 
`    *****                                    
  ******                           *          
 **   *  *    **                  **          
*    *  *   **** *                **          
    *  *     ****               ********      
   ** **    * **          **** ******** ***   
   ** **   *             * ***  * **   * ***  
   ** *****             *   ****  **  *   *** 
   ** ** ***           **    **   ** **    ***
   ** **   ***         **    **   ** ******** 
   *  **    ***        **    **   ** *******  
      *       ***      **    **   ** **       
  ****         ***     **    **   ** ****    *
 *  *****        ***  * ***** **   ** ******* 
*    ***           ***   ***   **      *****  
*                                              
 **`.split('\n');


const SMALL_ROWS = 
`      *****          
   ******        
  **   *  *    ** 
 *    *  *   **** *
     *  *     **** 
    ** **    * **    
    ** **   *
    ** *****
    ** ** ***
    ** **   ***
    *  **    ***
       *       ***
   ****         ***
  *  *****        ***  * 
 *    ***           ***   
 *
  **`.split('\n');

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
	const is_mobile = window.innerWidth < MOBILE_WIDTH || window.innerHeight < MOBILE_HEIGHT;
	grid = is_mobile ? small.grid : big.grid;
	map.clear();
	grid.forEach(art => map.set(coordKey(art.x, art.y), art));
}

export const settings = {
	backgroundColor: 'white',
	color: 'black',
	fontFamily: 'monospace',
	lineHeight: '1'
};

export function on_resize() {
	change_ascii();
}

export function pre(context, cursor) {
	grid.forEach( art => {
		const dx = art.x + art.offset_x - cursor.x;
		const dy = art.y + art.offset_y - cursor.y;
		const distance_sq = dx * dx + dy * dy;
		if (distance_sq < REPEL_DISTANCE ** 2 && distance_sq > MIN_DISTANCE) {
			const distance = Math.sqrt(distance_sq);
			const force = REPEL_STRENGTH * (1 - distance / REPEL_DISTANCE);
			const angle = Math.atan2(dy, dx);
			art.vel_x += Math.cos(angle) * force;
			art.vel_y += Math.sin(angle) * force;
		}
		art.vel_x -= art.offset_x * SPRING_FORCE;
		art.vel_y -= art.offset_y * SPRING_FORCE;
		art.vel_x *= FRICTION;
		art.vel_y *= FRICTION;
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

(asyncg () => {
	const load_ascii = file => fetch(file)
	.then(r => r.text())
	.then(t => rows_to_ascii(t.split('\n')));
	[big, small] = await Promise.all([load_ascii('big.txt'), load_ascii('small.txt')]);
	change_ascii();
})();