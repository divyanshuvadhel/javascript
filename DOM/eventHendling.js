// event --> things that heepens when user interect with the page like crolldown , click ,mouse over etch.
// event handler --> what heppens afterward we fires the event. this handler is resposible for that .
// evnet loop -> js is single threaded lang . event loop continusly watches over the 
// stack if the stack is empty then it place the task from event que to stack and process it 

// onclick() this litstioner will  overwrite the old litioner and handerl 

// litsener --> kind of function or method that watches over the events 

const btn=document.getElementById('action-btn');

btn.onclick=function(event){
	console.log("clicked !");
}

// if we over write old one with new one 

btn.onclick=()=> console.log("over write !");





// addevent litsners

// it hase the three parameter fisrt one is the type like click or scoll or mouse over , second is event hendlor which is function , therd is options 
// so btn over hire where the this event atteched to .

btn.addEventListener('click',function(event){
	console.log("clicked");
})

btn.addEventListener('click',function(event){
	console.log("onther event click ");
})

//it one element have the multiple events atchhe it does not over write existing one .

// parameter -- 1. event type 2.event handler , 3 options --> object /boolean for capture pasive 


// event object--> when event is fire the browser autometically give the event objec to the our event heander as an argument .

// which have type , target, current etc . 

btn.addEventListener('click',function(e){
	console.log(e)	
	console.log(e.target);// element that was clicked 
	console.log(e.currentTarget);// element that event atteched to .
	console.log(e.type);
	console.log(e.clientX);
	console.log(e.clientY);
	
})

const clickMe=document.getElementById('parent');

clickMe.addEventListener('click',function(event){
	console.log(event.target);// where event fires 
	console.log(event.currentTarget);// where the listiner attched wich is prent
	console.log('parent is clicked');
	// event.stopPropagation();
	
	
},{capture:true})

clickMe.parentElement.addEventListener('click',function(e){
	console.log('grandParetn is clicked');
})

clickMe.firstElementChild.addEventListener('click',function(){
		console.log('child clicked');

});

// by defoult it is bubller up thing 
