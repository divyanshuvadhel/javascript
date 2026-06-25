// falsey value only 8 
// 0,false,-0,nan ,bingint zero 0n "undefine","",null
// ele every thing is truthy value
// "0","false",[],{}," ";

// if else statement 
/* if(condition){
	 condtion true then execute these block	
} else{
	condition is falsy 
	then theis
}

*/
// scoping trap 

if(1){

	let x=9;
	var b=0;
}
// console.log(b);// not eerr

// it x would var then it will leak out of block scop 
// becose var is the function scop 
// console.log(x);//reffrence err

function aa(){
	function ba(){
		var b=2;
	}
	
	var a=10;
	console.log('aa is finished');
	console.log(b);
		
}
aa();
// it will print 0 becose the aa never look b inside the ba functaio  the resion
// these the aa can llook up to globle not to the its own child function 
// also somehow it looks to aa still b is not availbel for aa first its function scoped 
// other the b is only availbel to that function when function ba is executed the lexical scope of 
// ba is also destroyed so their is no longer b .
// console.log(a); // gives reffrence arr

// logical opertors //

// a && b --> if a is flasy value the return flase it never checks for the b even if its true;
// a || b --> if a is truthy value then it will return true .. never checks for other value b'

// isLoggedIn && showDashboard();
// if the user is logged in it never eveluate the showDashboard functionl.

// it return value not just boolean 

let x="" && " a";
// console.log(x); // it will return 0 false bcose it never looked after b;

// console.log(" " && "a"); // return a 
// console.log(""&& 2) ; // return 0 one falsey valu 
// console.log(" "&& 2) ; // return 2 becose it both are truthy value so it return me b 


console.log("" || "helow");// it will return  hellow ("" --> flasy || " helow"--> truthy )
console.log("" || -0);// it will return  hellow ("" --> flasy || -0 seconde )

// ?? only use when we should want to pass "",false, and 0 but null / undifine 

let name="hellow";

name ??="divyesh";// it will only assign divyesh to the name is name is null or undifine

console.log(name);

// optional chaining ?. 
//it is the safe way to access the property or the medthod that might be null or undefined;

// User.photo --> if it not their it will thro undifine insted of the use
// User?.phto --> will simply say it undifine

// ternury operator

// condition ? if true: false

3<0 ? console.log("hi"): console.log("bhag bsdk");// it will print bhag bhosdina


