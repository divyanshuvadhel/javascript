// 4. Predict the output:

console.log(1 + "2" + "2"); //"122"
/*in js java evelute the left to right when (1+"2")
javascript has two usecase of the + operator 
which is mathematical and the string concatintion 
so when + comes and type of both are number then number 
if one the is string standerdlize string cocatination will take place orver the number 
+ is overloded 

why string wins over numeric conversion 
so the resoan can be the numeric value can be esily convertable to the 
string where as the string can not be converted to number 

2-number "2"- string 
"shelow"-string NaN - Number can not  be convert ealsy 
*/


console.log(1 + +"2" + "2");//32
// console.log(+"hello"); if converatbel 

/* 
HOW COME 32 	

for the precence left to right mih +"2" it work implicite convesr to the number 
then number + numbee will give num and then strign 

*/



console.log(1 + -"1" + "0"); //00
 
/* 
same as above

*/


console.log(+"");// falsey value 0
console.log(1 < 2 < 3);// true
/* first 1<2 true<3  3 can not be tue */
console.log(3 > 2 > 1); //
/* firs 3>2 taru  */
// console.log(true<false); false which is like 1>0 always .


