const express = require('express');
const fibonacci = require('./fibnacci')
const app = express();
app.get('/',(req,res)=>{
    const number = fibonacci(Number.parseInt(req.query.number));
    res.send(`RESULT IS :${number}`)
    
})
app.listen(2000,()=>{
    console.log("listening to the port no 2000")
})