// tdz in functions perameter 

// function (a=b,b=a){
// 	console.log(b);
// }
// it hase its own scope
// reff err we can not use b before its inarze 

// hoisting in destructuring 

// var{a}={a:10}
// console.log(b);
// console.log(a);

// basic var hoisting 

// console.log(b);// log the b before its intiallziation

// var b=0;

// for the let temporal deadzone 

// console.log(a);// then its not defian
// console.log(v);// then the reff err 
let v=0; //reff err cannot use before initialization 



// function  declaration vs function expression 
x(); // funciton dec are hoisted with its object value;
function x(){
	
 console.log("hellow");
	
}

// expresion 
//  fn(); // for these first it will be var and its undefined 
var fn=function (){
	console.log("hi");
}

// named function expression 

var greet=function helo(){
	helo();
	console
	.log("hello");
}
// greet();// exeece calling each othe r
// helo();// hello will not defined only accesible inside the function it self

// x(); // funciton type of x() inifinite ech other calling it self


// hoisting order 
// console.log(x); // hear funciton 
var x=10;//
function x(){
	console.log("helllll");
}
// console.log(x);// number 10 
// when sstart variable in creattion phase where 
// x is function bingdin is oject it selft 
// then in execution phase where x will be over write by 10;

// nested funciton hoisting 

function outer (){
	console.log(inner);
	if(false){
		function inner(){
			console.log("inner");
		}
	}
}

outer();// instrict mode the funciton is enclose tho the block 
// 







