/*  Q5. Rewrite the following using a switch statement, then rewrite it
 again using an object lookup (no if or switch).
 */
function getDayName(dayNum) {
  if (dayNum === 1) return "Monday";
  else if (dayNum === 2) return "Tuesday";
  else if (dayNum === 3) return "Wednesday";
  else return "Invalid";
}

// switcha case version
// in js no function over loading 
function bySwitchCase(dayNum){
	switch (dayNum) {
		case 1:
			return "Monday"
			break;
	  case 2:
			 return "Tuesday"
			 break;
		case 3:
			return "Wenesday"		 
		default:
			return "Invaildin"
			break;
	}
}

// using Object lookUp no if else or switch case 

function geyObject(dayNUm){
	const obj={
		1:"Monday",
		2:"Tuesday",
		3:"Wenesday"
	}
	return obj[dayNUm] || "invaild"
}
console.log(geyObject(1));
