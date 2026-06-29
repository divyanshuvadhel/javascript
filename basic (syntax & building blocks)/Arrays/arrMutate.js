// array mutate methods
// for the adding elements we can use push and unshift 
// modify the original array
// push() method for the adding at the end

const arr=[1,23,4];

function modi(array){
		array[0]="hellow";
}

modi(arr);
console.log(arr);// it is modifying the original object 


arr.push("push");// it return the new length of arrr
// console.log(arr);

// unshift() to the element at the start of arr

const retu=arr.unshift("unshift");// it also return new length
// console.log(arr);

// to remove the elements we can use pop() and shift()
// also modify the original array 

const ele=arr.pop(2)// it remove from the last index and return that elemet
// console.log(newarr);
// if we pass the number still the last index ele remove

// shift( )is use to remove ele from 0 index

arr.shift();
// console.log(arr);

// copeing array 
// using slice() or [...arr] spread operator

const clone=arr.slice()// without arguements it will copy the entire array
// return the brand new array 
// whithout mutating the original aray
// if we pass an arguements star and end then it copy that part of 
// the array and return it as new array  
// // it does not include the last index

const students=['a','b','c','d'];

const cloneStudent=students.slice(0,3);
// console.log(cloneStudent);

// spread oparetor 
const cloneStudents1=[...cloneStudent];
// it will return the shallow copy of the array and 
// it is mordern way to copying the array 

//------- isArray method ----------
// finds out is object is arrary or not 
// returns true or false

// console.log(Array.isArray([]));// true

// modify the length of array 

let modify=["a","-","-"];
// console.log(modify);
modify.length=-1;// it will give the err invalid length like that 
modify.length=2;// 
// console.log(modify);
// it will shrik and remove other elements 


/// fastest method to empty array 

// modify.length=0; it will remove the all the element 

