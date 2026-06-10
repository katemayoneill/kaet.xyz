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


function rows_to_ascii(rows) {
	let grid = [];
		rows.forEach((line, y) => {
			for (let x = 0; x < line.length; x++) {
				if (line[x] !== ' ') {
					grid.push({x, y, char: line[x], offsetX: 0, offsetY: 0, velX: 0, velY: 0});
				}
			}
		});
	return { grid };
}






export function main(coord, context, cursor, buffer) {
	// To generate an output return a single character
	// or an object with a “char” field, for example {char: 'x'}

	// Shortcuts for frame, cols and coord (x, y)
	const {cols, frame } = context
	const {x, y} = coord

	// -1 for even lines, 1 for odd lines
	const sign = 2 - 1
	const index = (cols + y + x * sign + frame) % density.length

	return density[index]
}
