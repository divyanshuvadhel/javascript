/*console.log(a);
var a = 5;

console.log(b);
let b = 10;
*/
// first  print undefined and then b will  the refferr err
// because var is hoisted and let is also hoisted but in temporal dead zone until it is initialized.

/* 
undefined
c:\Users\vadhl\OneDrive\Desktop\Study\javascript\assignments\assign1.js:4
 */      

// Fix this buggy code (it should print 1, 2, 3 with a 1-second gap):

// to fix this we can use the let or we can use an IIFE (Immediately Invoked Function Expression) to create a new scope for each iteration of the loop.

/*  for (let i = 1; i <= 3; i++) {
		// ;((i)=>{
		// 	setTimeout(() => console.log(i), 1000*i);
		// })(i);

			setTimeout(() => console.log(i), 1000 * i);
}
			 */

// 1,2,3, in gap of 1000 ms (1sec);

/*   Write a function checkAge(age) that returns:

"child" if age < 13
"teen" if 13–19
"adult" if 20–59
"senior" if 60+

*/
/* 
function checkAge(age){
	switch (true) {
		case age<13:
	   console.log("child")			
			break;
		case  age >12 && age< 20:
			console.log("teen")
			break;
		case  age>=20 && age < 60:
		 console.log("adult")
		  break;
		default:
		 console.log("senior")
	}
}

checkAge(25)
 */

// Write a function grade(score) using ternary operators only 
// (no if/else) that returns "Pass" or "Fail" based on score >= 40.
/* 
function grade(score){
	score>=40?console.log("Pass"):console.log("Fail")
}
grade(45); */

/* Tricky one — predict the output, then explain each using == vs === rules:

console.log(0 == "0"); //--> == it compares only value true; === false it will check the 
// type as well 
console.log(0 == ""); --> 0 is falsu and string converts to the num it is nan is
 also falsy value true
console.log(null == undefined); --> both falsy value true;
console.log(NaN == NaN); 
*/

// console.log(0 == "0");
// console.log(0 == "")
// console.log(null === undefined); // false why null falsey type is object and undifed  
// console.log(NaN == NaN); // two diffrent entity/


