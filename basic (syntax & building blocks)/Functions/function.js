// function is the block of code that be used when need 
// analogy - whenever u need a help of freidn to make a recipie 
// instead of calling freind everytime when u cook u write down the 
// recipie and use it whenever you need it.

// declaring the function 

function  foo(){};

// function is keyword foo is name of function and () where 
// it takes the parameters  and {} is body of the function 

function print(){
	console.log("hprint")
}

print // calling without the () will give the function string
print () // to calling the function we need to use (); it will execute 

// function expression  

const expre =function(){};

// function expression assign to the variable it has no
// name of its own 

// RETURNING THE VALUE TO THE CALLER 
 
function add(a,b){
	return a+b;
}

// it will return the value to whoever calles it 

// if we dont pass the argument to the function if became 
// undefine and in arethematic operation it beacam the NaN

// to prevvent these we can assign the default value to the param 

function add2(a=1,b=0){
	// starting values of a =1and b will be 0;
	// if the argument were not passed then it will consider a =1and b as 0


}

// argument object 

function fun(){
// argument is an object array like but not array 
	console.log(arguments);
}

// fun(1,2,3);

// REST PERAMETER  -> ..rest
// it let the function to take unlimited arrguments
// it allway shoud be the last parameter of the function 

function addUnlimited(a,...otherValues){
		 let sum =0; 
	for(num of otherValues){
		// console.log(num);	
		sum+=num;
	 }
	 return (a+sum);
}

const sum=addUnlimited(1,2,3,4,5,6,7,7,8,8);
// console.log(sum);// 51

// NESTED FUNCTION 
// javascript allows devloper to define function inside other function

function outer(){
	console.log("this  is outer function");
	function inner(){
		console.log("this is inner function")
	}
	inner();
}

// outer();// this will print first the outer and then inner r
// js use lifo concept as single threaded lang using stack 

//  this the main reson behind the clouser

//  SCOPE OF THE FUNCTION 

// variable that defined in side of the function cannot access out side of fucntion scope 
// var ,let , const is all are this function scoped

function scope(){
	let a=0;
	const b=0;
	var c=0;

}
// if we try to access these variables outside of the function scope it will give the ref err 

//CLOUSERS 
//a clouser is created when the inner function remmenbers the value of variable that is declred in 
// outer funtion.
// even after the execution finished of outer function 

function clousers(a){
	 return function inner(b){
			console.log(a+b);
	 }
	 
}

const result =clousers(10);

result(20);// it will print 30

// usually the after function is execute the local variables of the function is also deleted 
// but this case the inner function is build the clouser over the outer fucntion so it will remmenter the 
// variables of the outer function 
/* -- data privecy 
-- encapculation /
-- memoization /caching 
--stat handlers  */

// function a(a){

// }

let count=0;

function counter(){

	return function (){
	 count++;
	}	
}

const cout=counter();
console.log(count);

cout();
console.log(count);



const fibo=function(){
	const obj={
		 f1:0,
	f2:1,
	cf:0,
	call:0
	}
	return function(){
		if(obj.call===0){
			obj.call++;
			return obj.f1;
		}
		if(obj.call===1){
			obj.call++;
			return obj.f2
		}
		obj.cf=obj.f2+obj.f1;
		obj.f1=obj.f2;
		obj.f2=obj.cf;
		return obj.cf;
	}
}

const gen=fibo();
let ans=gen();
console.log(gen());
console.log(gen());
console.log(gen());
console.log(gen());


