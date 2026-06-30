// simple clouser 

function counter(starting ){
	  return function x (){
			return starting++;
	 }
}

const count=counter(0);

console.log(count());
console.log(count());

const name="alice"

function printName(){
	console.log(name);
}

function printOntherName(){
	let name ="boby"
	printName();
}

printName();

printOntherName();// becouse of the lexical scope it will print the alice

// momoizetion 

function memoization(fn){
	const cache=new Map(); 
	return function(...args){
			const key=JSON.stringify(args);
			if(cache.has(key)){
				console.log("found in cach");
				return cache.get(key);
			}
			console.log("computing....");
			const result =fn(...args);
			cache.set(key,result);
			return result;
	 }
}

function add(a,b){
	return a+b;
}


const addFunction=memoization(add);
console.log(addFunction(2,3));
console.log(addFunction(2,4));

console.log(addFunction(2,3));
