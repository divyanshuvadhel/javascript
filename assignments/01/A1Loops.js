// Print numbers 1 to 50, but skip multiples of 3 (use continue).
// so i have to print like 1,2,3,4,5,skip 6,7,8,skip 9 ,10 so on..
/* 
for(let i=1; i<51; i++){
	
	if(i%3==0)continue;
	console.log(i);
}
 */
// Find the largest number in this array using a loop:

/* let nums = [12, 45, 3, 89, 23, 67];

function max(nums){
	let max=nums[0];
for(let i=0; i<nums.length; i++){
	 if(max<nums[i]) max=nums[i];
}
return max;
} */

/* 
Print this pattern using nested loops:
*
**
***
****
*****
*/

/* function printPettern(n){
	for(let i=1; i<=n;i++){
		let str="";
		for(let j=n;j>i;j--){
			str+="* ";
		}
		console.log(str)
	}
}

printPettern(5); */

/*Challenge (combines ev erything): Write a program that:
Takes an array of ages: [5, 17, 25, 70, 12, 45, 64]
Loops through it
Uses conditions to classify each as child/teen/adult/senior (reuse Q8 logic)
Counts how many are in each category
Prints a summary like: */


function count(arr){
 let count={child:0,teen:0,adult:0,senior:0}
	for(per of arr){
			// console.log(per);	
		checkAge(per,count)
	}

	console.log("child :" ,count.child);
	console.log("teen :" ,count.teen);
	console.log("adult :" ,count.adult);
	console.log("senior :" ,count.senior);
	
}

function checkAge(age,count){
	switch (true) {
		case age<13:
	    		count.child++;
			break;
		case  age >12 && age< 20:
			// console.log("teen")
			count.teen++;
			break;
		case  age>=20 && age < 60:
		//  console.log("adult")
		 count.adult++;
		  break;
		default:
		//  console.log("senior")
		 count.senior++;
	}
	
	}

let arr=[5,17,25,70,45,12,64];
count(arr);



