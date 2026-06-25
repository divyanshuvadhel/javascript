// to merget the array 
const greetings=["good morning","goo night","good day"];
const day=["tuesday","friday"];
// i want to merge these array in to single one 
// use .concate()

const newArr=day.concat(greetings);// first are the day 
// const newArr=greetings.concat(day);// first aret the greetings 
// console.log(newArr,greetings);
// it not change the original array

// also we can use the ... oparator 

const spread=[...day,...greetings]
// console.log(spread);

//.join()method = Array to String 
// it joins the arrays element in to one string 
// saperated by the ,s defout we can pass the value as well 


// const string=spread.join(); string saparaed with ,
// console.log(string,spread); 
const string=spread.join("");
// it will one string without spaces if element has space it will print it.
// console.log(string,spread);
// it does not mutate the arrya


//indexOf-- give the first occurence of elemet 
// lastIndexof() -- give last position othe ele

// .include() return the true if ele ment present in array or false
// .at(index) pass the index if give element at the index 

// .fill(fill,start ,end)-- fill- is element 
// start- is the index where to start filling 
// end is the index to where to stop filling 

const empty=[1,2];
// 
// const a=empty.fill(["h"],-1,10); 
// console.log(empty);//it mutate the original arrray as well it return the new array
// console.log();
// it also accept the negative index and it evalut lik arr.length+ index = start it ends
// empty.fill("h",-1,2);
// console.log(empty);
 
//if array is empty the result will be empty 

// spice().. spice method can cut out the portion of array or delet the element it changes th original aray 

const arrrr=[1,2,3,4,5,6,8];

// arrrr.splice(0,2)// 
// start= from which index 
// ends meas how many elemts should be delet not index 

// arrrr.splice(0); it will dele all the element after the startpoint if we dont give the element Count 
const part =arrrr.splice(1,5);// it also return the deleted elements as an array 
// console.log(arrrr,part);

// we can also repalce the elements 

const del=part.splice(0,0,"hi");
console.log(part,del);








