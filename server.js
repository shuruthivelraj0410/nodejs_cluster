const express = require('express');
const fibonacci = require('./fibnacci')
const cluster = require('cluster')
const totalCpus = require('os').cpus().length

console.log("no of cpus : ",totalCpus)
if(cluster.isMaster){
   for(let i =0;i<totalCpus;i++){
       cluster.fork()
   } 
   cluster.on("online",(worker)=>{
   console.log("wokers who got activated",worker.id+"---->"+worker.process.pid)
   })
   cluster.on("exit",(worker)=>{
   console.log("workers who died",worker.id+"----->"+worker.process.pid+"--job-->")
  cluster.fork();
   console.log("new worker forked --->",worker.process.pid)
   })
}
else{
const app = express();
app.get('/',(req,res)=>{
    const number = fibonacci(Number.parseInt(req.query.number));
    res.send(`RESULT IS :${number}`)
    console.log("who has accepted",cluster.worker.id+"-------->"+cluster.worker.process.pid)
})
app.listen(2000,()=>{
    console.log("listening to the port no 2000")
})

}
