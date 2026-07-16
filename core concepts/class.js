class animal{
	constructor(name){
		this.name=name;
	}

	speakName(){
		console.log(`my name is ${this.name}`);
	}
}


// const dog=new animal("sheru");
const dog2 =new animal("shimaba")
// dog.speakName();
dog2.speakName();


// the new keyword step by step internals

// when create new object form calss 
// new animal("lion");

function newanimal(constuctor,...args){
			// step.1 create new empy object 
			const obj={};
			// step.2 link obj prototype with constructor prototype
			Object.setPrototypeOf(obj,constuctor.prototype);
			
			// step 3. call the construotr with bound this with object 

			const result=constuctor.appy(obj,args);

			// step 4. if constucore retuns the object so use it else retunr obh

			return (result!== null && (typeof result === 'object' || typeof result === 'function '))? result: obj;

}


class dog extends animal{
	constructor(name, bread){
		super(name);
	  this.bread=bread;
	}

	 speakName(){
		super.speakName();		
	}

  tellBread(){
		 console.log(this.bread);
	}
}


const goldenDog=new dog("sheru","golden retriver");


goldenDog.speakName()
goldenDog.tellBread()




class button {
	constructor(lable){
		this.lable=lable;
	}

	click(){
		console.log(this.lable);
	}
}


const btn=new button("enter");

const fn=btn.click.bind(btn)

setTimeout(fn,100)