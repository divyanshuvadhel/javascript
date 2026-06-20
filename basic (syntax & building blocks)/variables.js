// variable is  the reserved space in memory that u can use to story data.
// declartion of variables 
// type of variables in js nnssbb
//number null string boolean bigint symbol undefined -primitives
let name = "divyanshu";// string 
let age=	22 //number
let isMarried = false;//boolean
let salary = null;// console.log(name);
// console.log(age);
// console.log(isMarried);
// console.log(salary);	
// console.log(typeof name);


// sting vs number 

let score1=50;
let score2="50";
console.log(score1==score2);// true 
console.log(score1===score2);// false it check type of data as well

// additon between number and concatination btwn string s

let str1="110"
let str2="divyesh";

// console.log(str1+str2);

// naming convvention is camelCase 
// also _ can be used but preferd camleCase convation 

// let name of --not acceteble 
// let name_of_game== true
// let nameOfGame-- prefferd 

// let vs const 
// let and const can not redeclare 
// let can reasign cannot reassign 

let a=10;
a=30; // allowed 

const c=10;
// c=13;// not allowed reassigning to the constant var


// we can not redeclare 
// const c=20; // breaks here c is already declared ;

// let a=40;

// use cases let can use when the value is not fixed like score of the match 
// const can be use like persons account number 

// console.log(typeof(null));// gives the object its bug that is theire from begining of the js 
// null=00000 empty all zerros so object typecode was set to 000 

console.log("st"*20);// it will give not anumber 
console.log("1"+1);// it will 11 string concatie
console.log(1+"1");// IT WILL ALSO SAME 11
console.log('1' * 3)// it forces to pultifilcation of this number 

// what type will be of this forms 

console.log(typeof("st"*2));//number 
console.log(typeof("1"*2));//number 
console.log(typeof("1"+2));//string 
console.log(typeof("1"-2));//number 
 




