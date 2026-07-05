// callback is function that passed as an argument to the onther function then it invok inside the outer funtion 

function fu(callback){
	callback();
}

function add(){
  console.log("hellow");
}
fu(add);

 // funcitons are first class citizen in the javascript 
 // why-- pass as an args,they return as value , also stored in variables
 
 // synchronus callbacks

// executes imidiatly before outer function retruns ;

// sync functions are the foundation of funcitona programing js 


// asynchronus callbacks
// it executes after some operation are finished 
//it does not block the main thread 

// setTimeout(()=>console.log("after one sec",1000));

// console.log("immeiadlty ");// executes first befor setTime out 

// if we like do 1 milli sec still it will execute leter 
// setTimeout(()=>console.log("after one sec"),10);

// for(let i=0; i<1000; i++){
// 	console.log(i);
// }
// console.log("immeiadlty ");// executes first befor setTime out 

// event litstiner are also the async functions

//so above we print the 0- 1000 so 10 ms passed long before the timer is experide the 
// stack not emty event loop checks if the stack is emty the it takes the task from microtask quew and 
// push in th call stack and execute it .

// higher order functions 
// funciton that takes onther function as an arg or return the function as value 


function loggings(fun){
	return function (...args){
		  console.log("calling the function with args ",...args);
			const result=fun(...args);
			console.log("rreturn ing the result ",result);
			return result ;
	}
}


const ad=(a,b)=> a+b;

const logAdd=loggings(ad);
logAdd(2,3)
// console.log(logAdd(2,3));


function multyplyBy(factor){
	return function (number){
		return number*factor;
	}
}

const three=multyplyBy(3);
console.log(three(9));

// err first callback 
// error first conveincetioanoj
// this is pretetern where the first argument of the callback is r
// reserved for the err object 

///

// write own callback based api 

function fetchUser(userId,callback){
	//1. check whether callbakc is function or not 
		if(typeof callback!== 'function'){
			throw new Error('callback must be a function ');
		}
	// 2. validate userId 
	 if(typeof userId!=='number' || userId<=0){
		// alway throw err asycn to avoid zalgo 
		  setTimeout(()=> callback(new Error('userId is invailid ')));
	 }

	 //3 . alway call callback only once 
	 let called=false;
	 function safeCallback(err,data){
			if(called) return;
			called=true;
			callback(err,data);
	 }
	 // perform async work

	 setTimeout(()=>{
		safeCallback(null,{ id: userId, name: 'Alice' })
	 },1000)



}

fetchUser(0,(err,data)=>{
	if(err){
		console.log(err);
	}
	console.log(data);
})