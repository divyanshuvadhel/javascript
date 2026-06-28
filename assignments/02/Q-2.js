// Q2. What will console.log(a) print and why?
var a = 1;
let b = 2;
const c = 3;
{
  var a = 10;
  let b = 20;
  const c = 30;
  console.log(a, b, c);
}
console.log(a, b, c);

console.log(a);

// what itll will print 

/* first 
 var declare which is var a,letb const c 
let and const are the blockscop ok 
variables can not redeclare 
for the blick scop all the variable are redecare so 
expact var is not block scop so
and it can be redeclare as well 
first  a-1
then redeclare a-10 
fiest log -- 10,20,30

second log which is -- 10,2,3
third log a-- 10 it is redeclare  other block scop 
doesnot meter with outer variables outer scop can not acces sinnner variable 

*/ 
console.log(NaN==NaN);// origin might be from the def soruc 

let arr=["helo"];
let obj={valueOf(){a:2}}// gives NaN
let arr1=[0];

// console.log(Number(obj));// 

// empty array and epty sitng gives 0 
// console.log(Number(arr)==Number(""));// origin is deff so false 
// console.log(Number(arr)==Number(arr1)); //origin is same 

// conversation of types 
// Number()-- convert first using ToPrimitive alogo
