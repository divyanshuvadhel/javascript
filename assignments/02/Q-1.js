// q.1 
console.log(typeof null);// object 
// if the type of null is object then how it is object .
// __> when js was created vlaue were stored in memory with the type tage

/* typetage    | bainary repe
  object - 000
	int - 001 
	strin 010

	 now problem is  inter null is 0x 00000 which is binary 00000000
	 	the first bits are000 and type of the object is also 000

		so now the null gives the object 

		why did they not fixed it --
		so many website were built with this bug it could be break;

		null instanceof Object  false//
		 so actull type of the null is null and it is primitve 
		 
		 */

	console.log(typeof undefined); //undefined is primitive 

	// undefined meen no value hase assign yet .
	
	console.log(null==undefined);
	// might be true then how 

	/* undefined mean value is missigng or not set yet.
	 null is like specificcaly set to null /nothing.
	  
	 it's loose equality check then it js specically true ;

	 does not convert them in number or string 

	 why its added devloper can compare undefined value with in sigle statement 
	 like null=nothing undfined is also similer nothing 

	 === checks for type also not jus emptyness
	 */

	 
	
	



