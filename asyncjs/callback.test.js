/* function doSomething(callback) {
  console.log('A');
  callback();
  console.log('B');
}

doSomething(function() {
  console.log('C');
});
console.log('D'); */

// A, then c then b then d

/* function fetchData(callback) {
  setTimeout(() => {
    callback('data');
  }, 0);
  console.log('fetching...');
}

fetchData(function(result) {
  console.log(result);
});
console.log('done');
*/

// fetching ... then done then stakc is empy then it will print data 

/*function getName() {
  return 'Alice';
}

function greet(callback) {
  console.log('Hello, ' + callback());
}

greet(getName);
*/
// never executed callback ;

function makeMultiplier(x) {
  return function(y) {
    return x * y;
  };
}

const triple = makeMultiplier(3);
// console.log(triple(5));
// console.log(triple(10));
// 15 AND 30 

/* Write a function repeat(n, callback) that calls callback exactly 
 n times, passing the current iteration index each time.
*/

function repeat(n,callback){
	 let count=1;
	 while(count<=n){
		callback(count);
		count++;
	 }
}

repeat(4,(i)=>console.log(i));

const fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(function() {
    console.log(i);
  });
}
// fns[0]();
// fns[1]();
// fns[2]();

// 333

// 0,1,2


/* Write delay(ms, callback) that 
waits ms milliseconds, then calls callback.
*/

function delay(ms,cb){
	 // just delay the exution ms 
	 setTimeout(()=>{
		cb();
	 },ms)
}

delay(100,function(){
	console.log("hellow");
});


function dalayedFn(ms,cb){
	return function(...args){
			setTimeout(()=>{
				cb.apply(this,args);
			},ms)
	}
}


const fun=dalayedFn(100,function(hey){
	  console.log(hey);
})

fun("hellow");







