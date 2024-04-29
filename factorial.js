const prompt = require('prompt-sync')()
const n = Number.parseInt(prompt('n = '))
let fact = 1;
function factorial(n){
    if(n==1|| n==0){
        return fact
    }

    fact = fact*n;
    n = n-1;
    console.log(fact)
    return factorial(n)
}
const result = factorial(n);
console.log("result",result)
