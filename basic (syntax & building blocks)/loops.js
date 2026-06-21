// for looop 

/* for(initiall : condition : increment/other){
	body 
}
	*/

	// for(let a=0; a<11; a++){
	// 	console.log(a);

	// }// print o-10

	// we can declare multiple variables as well 

	for(let a=10 , b=1;  b<11; b++){
			console.log(`${a} X ${b} = ${a*b}`)
	}
	// it will print the table of 1


	// let vs var  in loop  clouser bug 

	for(var i=0; i<3; i++){

		setTimeout(()=>console.log(i),1000);
	}

	// may be i=0 -> settime out ,1s -> 3,3,3 
	// first time -> i=0  and ccallback1 get reffrence of the i not value i
	//  second time -> i=1  and ccallback2 get reffrence of the i not value i
	// third time -> i=2  and ccallback3 get reffrence of the i not value i

	// after the 1s the they print i now then i=3; so they print 333 
	// var is function scoped  so each time loop runs 