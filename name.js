/**
@author kate
@title  name 
@desc   name display
*/

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
