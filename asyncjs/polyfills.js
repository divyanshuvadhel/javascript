// map polyfill
// what map does go throw each element of the array and appyle sothing and return new array 


Array.prototype.myMap=function(callback,thisArgs){
	  // check if callback is a function or not 
		if(typeof callback !== 'function'){
			throw new TypeError(callback +' this is not a function');
		}
		// delclare the array of size args 
		let resultArray=new Array(this.length);
		for(let i=0; i<this.length; i++ ){
				resultArray[i]=callback.call(thisArgs,this[i],i,this);
		}
		return resultArray;
};

/*
let arr=[1,2,3,4,5,6];

let obj={multi:2}

const newArr=arr.myMap(function(value,index,arr){
	console.log(`${value * this.multi}  ${index}  ${arr}`);
},obj);

*/

// polyfill for custom for each 
// what for each doe it mutate the original array 

Array.prototype.myFourEach=function(callback,thisArgs){
	// check if callback is function or not 
	if(typeof callback !=='function'){
		throw new TypeError(callback + 'this is not a function')
	}
	// run the loop 
	for(let i=0;i<this.length; i++){
		if(i in this){
				this[i]=callback.call(thisArgs,this[i],i,this);
		}
	}
}

/*
let arr=[1,2,3,4,5,6];
arr.myFourEach((value,index)=>console.log(value +" " + index));

*/
// filter pollyfill 

// what fillter do :- return new array with element pass test ;
// it takes the callback return new array dont mutaate original array 
// call back have index value and arr it self return the element that pass the test;


Array.prototype.myFilter=function(callback,thisArgs){
	// check for callback if is not a function 
	if(typeof callback !== 'function'){
		throw new TypeError(callback + "this is not a function ");
	}

	// create new array ; 
	 let result = new Array();

	 // run loop for all elemnet 

	 for(let i=0 ;i<this.length; i++){
		  let isPass=callback.call(thisArgs,this[i],i,this);
			if(isPass){
				result.push(this[i]);
			}
	 }
	 return result;
}


// console.log([1,2,3].myFilter((value)=> value>{} ));

// console.log(1<{});d


// reduce pollyfill 
// what do reduce do :- it accumelete the value with nex value;
// call back hase four thing acum intially it will 0  then new aucm will be what ever perform form nex value 

// Array.prototype.myReduce=function(callback,init){
// 	 if(typeof callback!== 'function'){
// 		throw new TypeError(callback+ 'this should be function ');
// 	 }
// 	 let acum=init
// 	 for(let i =0 ; i< this.length ; i++){
// 		  acum=callback(acum,this[i],i,this);
// 	 }
// 	 return acum;
// }



// console.log(addition);


Array.prototype.myReduce = function(callback, initialValue) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    let accumulator = initialValue;
    let startIndex = 0;

    if (arguments.length < 2) {
        if (this.length === 0) {
            throw new TypeError('Reduce of empty array with no initial value');
        }
        accumulator = this[0];
        startIndex = 1;
    }

    for (let i = startIndex; i < this.length; i++) {
        if (i in this) {
            accumulator = callback(accumulator, this[i], i, this);
        }
    }
    return accumulator;
};

const addition=[1,2,3,3].myFilter((acum,value,index,arr)=> acum+value)

// console.log(addition);

const user = {
    name: 'Alice',
    greet() {
        console.log('Hi, ' + this.name);
    }
};

// setTimeout(user.greet.bind(user), 100);  // "Hi, undefined" — this is lost!

// Fixes:
// setTimeout(() => user.greet(), 100);     // Arrow function + closure
// setTimeout(user.greet.bind(user), 100);  // Explicit binding

let newarrr=[1,2,3];
// newarrr.map(console.log)


// debounce 
// what it does :- debounce invoke the function after some time ;
function debounce(callback, wait) {
    let timeoutId;

    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback.apply(this, args);
        }, wait);
    };
}

const debounceAdd=debounce((a,b)=>console.log(a+b)
,1000);
debounceAdd(1,2)