// scope -
// the scope where varial accessible and lives 

// there are three mainly scope 
//1.globle 2. block  3.function and also 4.lexical scope

{}// in these block whater we write variable stay withn this block 
// let and const are block scop variable

// var is  function scope we outer function cannot access the vari
// ble which declare in ther thatcop  

//lexical scope which mean the scope where the code is determined

// clouser is from when inner scope variable memorize the outer variable 

// 	count=0;
// function a(){

// 	return count++;
// }

// a();// 
// console.log(count);
// a();
// console.log(count);


/* let x = 1;

function first() {
  let x = 2;
  function second() {
    let x = 3;
    console.log(x);
  }
  second();
  console.log(x);
}
first();
console.log(x); */
// 3,2,1

const counters = [];
for (var i = 0; i < 3; i++) {
  counters[i] = (function(i){
		return function (){
			return i;
		}
	})(i);
}
// /* also can use let simple or bind es5
/*
Write a function makeMultiplier(factor) that returns a new 
function. The returned function should multiply its argument 
by factor.
 */

function makeMultiplier(times){
	return function (num){
		return num*times;
	}
}


const triple = makeMultiplier(3);
// console.log(triple(5)); // 15

const a = "global";

function outer() {
  const a = "outer";

  function inner() {
    console.log(a);
  }
  return inner;
}

const fn = outer();
// fn();// outer

// console.log(value);

let value = "global";

function check() {
  // console.log(value);   // can not access value break;
  let value = "local";
  console.log(value);   // local
}
check();




