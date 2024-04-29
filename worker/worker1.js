const fibo = require('../fibnacci')

process.on('message',(number)=>{
    let result =fibo(number)
    console.log("work done by process",process.pid)
    console.log("result is : ",result)
    process.send(result)
})