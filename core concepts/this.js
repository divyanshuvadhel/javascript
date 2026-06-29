function fn(){
	console.log(this.name);
}

const obj1={name:"jahnvi",fn};
const obj2={name:"shiya",fn}

// obj.fn();
// obj2.fn();

// same function but diffrent name and this how this runtime binding


function b(name){
	this.name=name;
}


// b("sweta");

// console.log(this);


const obj={name:"shashitaru",gret(){
	console.log(`hellow ${this.name}`);
	
}}

const a= obj.gret

// a();// undefined it lost its this this only metters where it callse

obj.gret();// sharitaru a

a();// for this undifined implicite binding 

// implicite kbinid with nested object 

const componey={
	name:"code x",
	ceo:{
		name:"Me",
		fn(){console.log(this.name);
		}
	}
}

componey.fun=componey.ceo.fn;

console.log(componey);

componey.ceo.fn();

componey.fun();

function introduce(greeting) {
  console.log(`${greeting}, I'm ${this.name}`);
}

const name="Alice" ;
introduce.call(name, "Hello"); // "Hello, I'm Alice"
