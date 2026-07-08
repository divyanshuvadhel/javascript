// promise is eventull state of asynchronus function or operation
// promise hase three states:
// 1. pending 2. fullfield  3. rejected


// two states are fullfield and rejected that sattles the promise
// after promise state cannote be changed.

const myPromise = new Promise((resolve, rejecte) => {
  setTimeout(() => {
    const data = { id: 1, name: "divyanshu" };
    resolve(data);
  }, 1000);
});

// myPromise.then((value)=> console.log(value));

// console.log("im going to print first");

// promise simulating the fetch req;

function fetchUser(userId) {
  return new Promise((resolve, reject) => {
    // 1 sec deely to get the data from the server

    setTimeout(() => {
      if (userId > 0 && userId === 1) {
        const data = {
          userid: 1,
          name: "Alex Johnson",
          email: "alex.j@example.com",
          isActive: true,
        };
        resolve(data);
      } else {
        reject(new Error("invalaind Input userId"))
      }
    }, 2000);
  });
}



//consuming the promise

// async funvtionl or .then

async function fetData() {
  try {
    console.log("fettching ...");
    const data = await fetchUser(1);
    console.log(data);

  } catch (error) {
    console.log(error);
  }
}

// fetData();

// using .then simpley 

// fetchUser(1)
// 			.then(val=>console.log(val))
// 			.catch(err=>console.log(err))

console.log("A");
new Promise((resolve) => {
  console.log("B");
  resolve("C");
})
  .then(value => console.log(value));
console.log("D");


function getTopPost() {
  return fetch('/api/posts')
    .then(res => res.json())
    .then(posts => posts[0])
    .then(post => fetch(`/api/posts/${post.id}/comments`))
    .then(res => res.json());
}


// REFECTOR USING ASYNC AWAIT 

// async function getTop
async function getPost() {
  const response = await fetch('/api/posts');
  const resTojson = await response.json();
  const data = resTojson[0];
  return data;
  // return fetch('/api/posts')
  //       .then(res => res.json())
  //       .then(posts => posts[0])
  //       .then(post => fetch(`/api/posts/${post.id}/comments`))
  //       .then(res => res.json());
}

// Write a function that fetches user data,
//  but if it fails, returns a default user after 1 retry.

async function getUserData() {
  try {
    // max tries are 2 if first will faild then return defualt user 
    const user = await fetch('api/user')
    const data = await user.json();
    return data;
  } catch (error) {
    console.log(error);
    return { defult: { user: 0, name: guest } }
  }
}

async function sleep(milis) {
  return new Promise((res, rej) => {
    setTimeout(() => res(1), milis)
  })
}

sleep().then(val => console.log(val))

var cancellable = function (fn, args, t) {
  fn(...args)
  let timerId = setInterval(() => fn(...args), t);
  return function cancelFn() {
    clearInterval(timerId);
  }
}


var promiseAll = function (tasks) {

  return new Promise((res, rej) => {


    const result = [];
    const complete = 0;
    const total = tasks.length;

    if (total === 0) {
      return res([]);
    }

    tasks.forEach((p, i) => {
      const promise = p;
      promise
        .then(val => {
          result[i] = val
          complete++;
          if (complete === tasks.length) return res(result);
        })
        .catch(err =>{
          result[i]=err;
          complete++;
          if (complete === tasks.length) return rej(result);
        })

    })
    
  });

};