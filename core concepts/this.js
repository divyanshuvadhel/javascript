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

// const name="Alice" ; 

// introduce.call(name, "Hello"); // "Hello, I'm Alice"


const obje = {
  value: 1,
  getValue() {
    console.log(this.value);
    return this; // Enable chaining
  },
  addOne() {
    this.value++;
    return this;
  }
};

// console.log(obje.value);
// obje.getValue().addOne(); // 1, then 2
// console.log(obje.value);
// obje.addOne().getValue();
// console.log(obje.value);


var name="Alice" ; 

const objectA={
  name:"riyan",
  getName:function(){
    console.log(this.name);
  },
  getBYarr:()=>console.log(this.name),
  obj:{
    name:"alice",
    getName:function(){
      console.log(this.name);
    }
  }

}


objectA.getName();// print the ryan 
// objectA.getBYarr();
objectA.obj.getName()


function bound(name){
  console.log(this.name);  
}
const x=new bound("nmae")


this.a=10;

function addintion(b){
  console.log(this);
}

