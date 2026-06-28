// Q7. What is the output? Explain.

for (var i = 0; i < 3; i++) {
  (function(i){
    setTimeout(() => console.log(i), 100);
  })(i)
}

// var so 3,3,3

//  how to fix it ?
/* 

firstly we should know how it came

settime out calls teh formed clourser with outer loop rememdbers value of i taht was 3 

it not bing each i with the setmitout also becouse for var no new enviroment ford 

if we just use let istead of var we can solve these or we can use iffe that will bind cuurent i value 
wieht settimeiout

*/

for (let i = 0; i < 3; i++) {
  setTimeout(()=>{
    console.log(i);
    
  },1000);  
}
