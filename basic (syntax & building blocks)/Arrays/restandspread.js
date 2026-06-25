// rest parmeter and spread operator

const arr=["a","b","c"];

//both rest and spread use the same symbol ...

//if dots are at the left side of the equal it mean it is perameter

// console.log(arr);
const [...rest]=arr; // create the clone of the arr and not mutate the original
// console.log(rest,arr);

const[a,b,...other]=arr;
// console.log(a,b,arr,other);

//if ... is on the right side of the = then it is spread

const newArr=[arr,...arr];// it first element of the 
//newArr will be the arr it self and the second one will be 
//spreded values of the arr in individual string 
// console.log(newArr,arr);// so dont mutate the original copy of the array

// ============ so wecan use the spread oparator to merge the two arrays=========

const groupOne=["1",2,3,4];
const groupTwo=[5,6,[1,2],"8"];

const merged=[...groupOne,...groupTwo];

console.log(merged);// it is spreading the elementto 
// it will be string  


