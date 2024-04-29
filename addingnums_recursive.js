
const prompt = require('prompt-sync')()
const input = Number.parseInt(prompt("n = "))
let a =0;
function add(n){

    if(n<1)
    {
        return a
    }
    else{
a = a + n + n-1;
console.log(a)
n = n-2
return add(n)
    }
}

const result = add(input)
console.log("result is ",result)