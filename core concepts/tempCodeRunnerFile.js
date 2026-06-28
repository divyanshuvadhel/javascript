
let value = "global";

function check() {
  console.log(value);   // global
  let value = "local";
  console.log(value);   // local
}
check();