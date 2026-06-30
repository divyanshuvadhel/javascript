// impliment map from scrach

// take the arr callback do some things in array element and return 
// the new array with changes 

const arr=[1,2,3,4,5];

// const newArr=arr.map((value,index,arr)=>{
// 	return ++value;
// })

// console.log(newArr);


function customMap(arr,func){
	 	// it will run the function for the arr ech element 
    let result=[];	 
 	 	for(let i=0;i<arr.length;i++){
		 	 result[i]=func(arr[i],i,arr);
 	 	}
		return result;
  				 
}

const newResArr=customMap(arr,(value,index,ar)=>{
	  return ++value;
})


// console.log(newResArr);


// function sayName(name){
// 	 this.name=name
// 	 console.log(this.name)
// }

// const obj={
// 	name:"mahek",
// 	sayName
// }
// console.log(obj);

// obj.sayName("kuku");

// console.log(obj);

// filter from scrach 
// filter take array and apply if condintion and return true or false
// return new array with element that pass the condition 



function myFilter(arr,func){
	 let result=[];
	 for(let i=0;i<arr.length;i++){
		  let pass=func(arr[i],i,arr);
			if(pass) result.push(arr[i]);
		}
	 return result;
}


const ages=[20,20,12,50];

const arr1=myFilter(ages,(value)=>value>=18);

// console.log(arr1);

// my reduce 
// arr.reduce -> what it does 
// it have acum,value ,index, arritseft
// acum we can give starting and acum with curent value new acum will the cur+acum 


// const total=ages.reduce((ac,value,index,arr)=>{},0)
// console.log(total);


function myReduce(arr,func,intitailVal){
	
		let result=intitailVal || 0;
	  for(let i=0;i<arr.length;i++){
				  result=func(result,arr[i],i,arr)
				
				}
		return result;
}
const numbers=[1,2,3];

const result=myReduce(numbers,(acum,currentVal,index,arr)=>acum+currentVal,0);
console.log(result);

// create a function that verify function can run only one time 

function onlyOnce(func){
	let once=true;
	return function(){
		if(once){
			func();
			once=false;
		}
	}
}

function hey(){
	console.log("im run only for one time ");
	
}

const onlyonec=onlyOnce(hey);
onlyonec();
onlyonec();

// memoize 

function memoize(fun){
		  const cache=new Map();
	return function(...args){
			const key=JSON.stringify(args);
			if(cache.has(key)){
				 console.log("found in caches");
			  return cache.get(key);
			}

			console.log("computing...");
			const result=fun.apply(this,args);
			cache.set(key,result);
		  return result;
	}
}

 const add=memoize((a,b)=>a+b);

//  console.log(add(2,3));
//  console.log(add(2,3));
//  console.log(add(2,3));
//  console.log(add(3,2));
 

// debounce ()

function debounce(fun,delay){ 
		let timerId;
	 return function (...arg){
		   clearTimeout(timerId);
			 timerId=setTimeout(()=>fun(arg,delay))
	 }
}

const debounceSearch=debounce((searchStr)=>console.log(searchStr),100);


// throtling 

function throtling(func,coolDownTime){
	let isCollingDown=false;
	return function (...args){
		// if it is colling down then we can return from over here
		if(isCollingDown){
			console.log("colling down");
		 	return;
		}
		// we can use this funciton 
		func(...args);
		isCollingDown=true;
   // setting up the colling down counter

	 setTimeout(()=>isCollingDown=false,coolDownTime);
	}
}


function addition(a,b){return a+b};


const throAdd=throtling(addition,1000);


throAdd(10,10);
throAdd(10,10);
throAdd(10,10);

// zip with 

// it takes two array and funciton that will tell what u want to do with arrya elemnts 

function zipwith(arr1,arr2,func){
	 let res=[];
	 for(let i=0;i<arr1.length;i++){
		res.push(func(arr1[i],arr2[i]));
	 }
	 return res;
}


const zipArr=zipwith([1,2,3,3,5,7],[4,5,6,2],(a,b)=>a+b);

console.log(zipArr);
