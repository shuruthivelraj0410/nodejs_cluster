const express = require('express')
const totalCpus = require('os').cpus().length
const cluster = require('cluster');
const child_process = require('child_process')

console.log("totalCPU count : ",totalCpus);
if(cluster.isMaster){
    const worker1 = require('child_process').fork('./worker/worker1')
    const worker2 = require('child_process').fork('./worker/worker2')
    console.log("My master process id id ",process.pid);
    console.log("worker1 id : ",worker1.pid)
    console.log("worker2 id : ",worker2.pid)
    worker1.on('message',(number)=>{
    console.log("worker1 processing number : ",number)
    })
    worker2.on('message',(number)=>{
    console.log("worker2 processing number : ",number)
    })
    cluster.on('online',(worker)=>{
    worker.on('message',(number)=>{
    if(number%2===0){
        worker1.send(number)
    }
    else{
        worker2.send(number)
    }
    })
    })
    for(let i=0;i<totalCpus-2;i++){
       let worker = cluster.fork()
       console.log("other workers process ids : ",worker.process.pid) 
    }
}
else{
    const app = express();
    app.get('/',function(req,res){
        let number = req.query.number
        process.send(number);
        console.log("this process id received ur request : ",process.pid)
        res.send("your request received successfully");

    })
    app.listen(3000,()=>{
        console.log('listening to 3000')
    })
}
