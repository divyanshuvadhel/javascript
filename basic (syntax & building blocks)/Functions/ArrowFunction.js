// compact and the mordern way to write function 
// traditional fucntion expresssion 
const fn=function (){};

// arrow functions

const arFun=()=>{};

//single statment arrow function 
const sFun=()=> "helow";
// no explecite return 
// single parameter arrow function 
const pFun=a=>a+10;
// arrow funciton can not bind their own this they inherit from its 
// surrounding lexical scop 

// FUNCTION VS NORMAL FUNCTION 

  // this ->
	// arrow funcion dont have their own this binding 
	// insted they inherit from outer lexical scope
	
	// --> this 
	// normal function bind this dynamically at call time 

	//--> can used as constructor 
	//-> no , it can not use as the constructor
	// it can not use new keyword ;

	// -->  normal function can use as constructor it can use new 

