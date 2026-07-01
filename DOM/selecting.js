// getelement by id 
// getElementById()  it use to select one element with that ide;

const navigation=document.getElementById('navigation');
// console.log(navigation);

// get element by class name ;
// it select all elments by that calss name ;
// it return a html collections

const navItem=document.getElementsByClassName('nav-item');
// console.log(navItem);// which is array like;

// getElement by tag namel
//collect the all elemnt with tath html tag an dreturns the live htmlcollection 

const divs=document.getElementsByTagName('div');
// console.log(divs);

//createElement

// it create the elemtn in hemory not in dom yet 
const line=document.createElement('p');
// line.textContent="hello this line were creeted by js "
// if the 
// text contect treets html as a plain text xss safe 
// line.textContent="<i>italic</i>"

// innerHTML parse the html and repatin the subbrance 

//  line.innerHTML="<i>italic</i>"





// line.textContent="hello this line were creeted by js "
line.className="line"
// now where we want to append this 
divs[0].appendChild(line);



/// modifiying the atrributes
