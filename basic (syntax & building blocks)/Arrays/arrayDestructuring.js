// destructuring 

// instead of assigning arr[0]== this and that 
const elements=["⭐","0"]

// const firstEle=elements[0];
// const secondEle=elements[1];

// instead of these use destructure 

const[firstEle,secondEle,thirdEle]=elements;
// or we can make defoult value to each elemets as wele
// const[firstEle="startEmoji",secondEle="number"]=elements
// console.log(thirdEle); undifined

// we can skip values as well 
const [first,,third]=elements;


