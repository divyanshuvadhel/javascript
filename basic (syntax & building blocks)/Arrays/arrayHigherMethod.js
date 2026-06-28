// higher methods are those who can take callbacks are parameter or return the callbacks;

const employees = [
    { name: "Bob", dept: "Engineering", salary: 6000 },
    { name: "Alex", dept: "HR", salary: 4000 },
    { name: "Ravi", dept: "Engineering", salary: 7000 },
    { name: "Tom", dept: "Sales", salary: 5500 },
    { name: "John", dept: "Engineering", salary: 8000 }
];

// object.groupBy

// it take object and return new object 

const department=Object.groupBy(employees,(employee)=>{
	return employee.dept;
})
// console.log(department);


// filter()
// takes the callback 
// return the array that are not filtered out 

const fe=employees.filter((value,index,arrayItSelf)=>{
		// return  value.dept=0;
		// return value.salary+=2; it will increament ech salary by 2 
		return value.salary>7000;
})
// can not early exit return only return from the function not form fileter it selft 
// what ever the result of the condtion we retrun base on true or false 
// console.log(employees );
// if we dont hold the value it will perform but wornt do anything or any err
// it not mutate the original array 

// console.log(fe);


// map() does not mutate and it runs for every element and 
// no eraly exit 

const newImploryee=employees.map((value,index,arr)=>{
	return value.salary>7000;
})
// return  new array with transfrormed elemets 

// console.log(newImploryee);

// reduce() it counts the sum of the sally 


const red=employees.reduce((acu,value,index,arr)=>{
	 return acu+value.salary;
},0)
console.log(red);



