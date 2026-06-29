let arr = [0,10,20,30];
function greaterThan10(n) { return n > 10; }

let ans=[];
    for(let i=0; i<arr.length;i++){
      let result=fn(arr[i],i);
			console.log(result);	
      if(result) ans.push(arr[i]);
    }



var filter = function(arr, fn) {
    
    return ans;
};

console.log("");



// console.log(filter(arr,greaterThan10));
