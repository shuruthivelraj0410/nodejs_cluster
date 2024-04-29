# nodejs_cluster

As we all know, Node JS is single threaded event-driven JavaScript runtime. When we run any CPU intensive operation, Node will not be able to take advantage of all the cores of our machine. This is where we will use Node JS cluster to run Node JS in multiple cores.

Node operations :
Non - blocking operations  (Mathematical calculations or any processing logic)
Blocking operations ( Database operations, network operations, File I/O operations)

Non-Blocking operations:
L1,L2,L3 cache
RAM

Blocking operations :
Disk
Network

Blocking operations take more cycles than non blocking operations to complete its work.
JS is a single threaded operation which has exactly one tag execution

How does it work?



In nodejs we have an event loop . Whenever we send a request to an application the request is killed on an event queue. The event loop looks into event queue picks the operation and place into execution stack(blocking operations)

If an operation requested is a non-blocking operation , the operation will be processed into the execution stack and the response will be sent to the caller.

Those blocking operations in worker thread will be simply evacuated by the eventloop . And the event loop will continue to run after evacuation too.
This is how our callback functions will get processed.
 Call back is a non blocking function. Once the call back is triggered the response will be sent back to the caller immediately.

Nodejs is clever enough to handle blocking and non-blocking operations separately but still do we need Nodejs cluster?
As discussed nodejs is a single threaded.And even if a multicore code runs in nodejs ….Its specifically run only one block of code out of all.

Example:
Let's design a simple program that calculates the fibonacci series since it is simple mathematical calculation it is considered  as a non blocking operation. If we give low range number such as 2,3,10,15,20 we can get response immediately.whereas when we give higher range numbers like 1234,2159,2341 the response gets delayed ..How about giving 20 request (array) of higher range numbers.

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

const prompt = require('prompt-sync')()
const n =  Number.parseInt(prompt('n = '))


function fibonacci(n){
   if(n<=1){
       return n ;


   }
   else{
     let  fibo = fibonacci(n-1)+fibonacci(n-2)
     return fibo
   }
}


const result = fibonacci(n)
console.log(result)


module.exports = fibonacci

Process:


localhost/?number = 55 and localhost/?number=2 is simultaneously made to run .Nodejs won't process the 2 and go for 55 coz it wont utilise all cores fully.. As per norms it completes the first request of 55 and then goes for 2. Nodejs utilises the resources in eventloop.Nodejs is a single stack execution(above is the proof).Next req will always be in waiting stage util its 1st req gets completed .






NODEJS CLUSTER :




Working :




IPC - inter process communication channel
IPC allows you to pass messages between parent and child process also vice versa



HOW TO FORK MULTIPLE CHILD PROCESS AND DISTRIBUTE THE LOAD OF INCOMING PROCESS TO THIS PROCESS:

Cluster is an inbuilt module of node js.Using this module we can take full advantage of multicore systems. Also through this package we can create many child processors which share the same port and all incoming requests can be distributed.

totalCPUs is a package which returns an array of objects which contains the informations about each logical CPU code.

refer:

https://www.arubacloud.com/tutorial/how-to-use-cluster-to-increase-node-js-performance.aspx#HowtheClustermoduleworksonNode.js
Cluster is a master process.

When ever a new worker is forked by master cluster the new worker should respond master by online status

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





LOAD TESTING IN NODEJS CLUSTER APPLICATION:

Previously we tested node cluster using multiple browser request but it dint explains us regarding or works to solve multiple processor’s usage.

To perform load testing we have 2 utilities:
First utility:




Loadtest report :






Artillery reports:

Refer : https://www.artillery.io/docs





PROCESS MANAGER2 :

WHY SHOULDN'T WE USE OUR OWN CREATED CLUSTER (previous code):

When we deploy our child process in the production there is a high risk of the child process getting killed.starting this kill process with no downtime has to be handled carefully.
Other reasons are restarting one or more child processes for any reason.
The most important thing about a cluster is to keep our application alive forever.This can't be achieved with hands on code in application.

Here PM2 keeps the child process alive in production forever.













HOW TO COMMUNICATE BETWEEN MASTER AND CHILD PROCESS:

NODE PACKAGE USED: child_process
This package has ability to spawn or fork new child process.Fork() is one of the method inside child_process which is widely used and it gets a path as a input to execute in a separate process.






Here the child_process module creates 2 child processes. And The master process forks the child process to get activated and assigns the logical task to do.



Worker1.js

const fibo = require('../fibnacci')


process.on('message',(number)=>{
   let result =fibo(number)
   console.log("work done by process",process.pid)
   console.log("result is : ",result)
   process.send(result)
})

Worker2.js

const fibo = require('../fibnacci')


process.on('message',(number)=>{
   let result =fibo(number)
   console.log("work done by process",process.pid)
   console.log("result is : ",result)
   process.send(result)
})

Server_message.js

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




When we made our application run through pm2. This won't get supported via pm2 coz we dont have such modules inside pm2. Pm2 internally makes use of nodejs cluster modules and pm2 distributes the load of all incoming requests.
Now how can we establish the communication between the processes of pm2?

This is where we use open source message broker RabbitMQ


Producer is an application which publishes the message.this published messages will get stored inside rabbit MQ. The consumers who need the message should subscribe to RabbitMQ queues .Then the consumers are able to read messages. RabbitMq can be used where some web applications have long running tasks.
Example : purchase order system where the users will enter details of order.After that we will have several processes to be done with the process of the order.
These tasks involve confirmation, dispatching and shipping the orders.
We can store the details of order in the rabbitMQ .Then the consumers will be able to take details of order from the message queue.









How to install rabbitMQ in ubuntu :
https://www.vultr.com/docs/install-rabbitmq-server-ubuntu-20-04-lts/?utm_source=performance-max-apac&utm_medium=paidmedia&obility_id=16876059738&utm_adgroup=&utm_campaign=&utm_term=&utm_content=&gclid=Cj0KCQjwnvOaBhDTARIsAJf8eVPYz9RZAjVPaaa7iSzUygqQrYf18k2D5J97a0sR0fjru5cdjmvQLgwaAox7EALw_wcB

https://computingforgeeks.com/how-to-install-latest-rabbitmq-server-on-ubuntu-linux/

Open http://localhost:15672/ in your browser.
Username : guest 
Password : guest

You will get a rabbitMQ dashboard like this :




PM2 is responsible for creating and managing the process. In such way in this above architecture PM2 creates 2 processor (Express App instance 1 and 2 ) this is responsible for accepting the request inside the application.This 2 processors will act as Producers when they receive the request it will get stored in queue of RabbitMQ.And PM2 again will 2 processor which will act as the consumers(Worker - 1 and 2).These consumers will receive the messages from the queues. 



RabbitMQ is the most popular open source message broker. RabbitMQ is lightweight and easy to deploy. It supports multiple messaging protocols. RabbitMQ has decent performance and a strong community. If your requirement is to process thousands of messages per second, I would suggest you go for something like RabbitMQ.
I have seen people jumping to Kafka without going through their requirement properly. No doubt Kafka gives better performance and features than messaging queues like RabbitMQ, but it is quite complex to set up. The Kafka server uses Zookeeper for cluster membership and routing. Setting up both servers will be unnecessary if the payload isn’t that high.
There can be multiple producers and consumers to a queue. But in normal use cases, we don’t need multiple producers, as putting messages into a queue is quite simple and fast. But consuming a message from the queue and performing a task based on the message normally takes time. Thus we tend to implement multiple consumers for a queue, so that when a consumer is busy, the other consumer can read from the queue and perform the task.
Doing a task can take a few seconds. You may wonder what happens if one of the consumers starts a long task and dies with it only partly done. In this case, if the worker crashes, we will lose the message it was just processing. In order to make sure a message is never lost, RabbitMQ supports message acknowledgments.
An ack(nowledgement) is sent back by the consumer to tell RabbitMQ that a particular message has been received, processed, and that RabbitMQ is free to delete it. RabbitMQ will understand that a message wasn’t processed fully and will re-queue it. If there are other consumers online at the same time, it will then quickly deliver it to another consumer.
Refer : https://betterprogramming.pub/implementing-rabbitmq-with-node-js-93e15a44a9cc
Difference between amqplib and amqplib/callback_api:
Amqplib -> uses promise method  veras amqplib/callback_api uses callback method otherwise both are same to be used.
Refer : https://amqp-node.github.io/amqplib/channel_api.html
channel.assertQueue -> the channel owns the queue and makes use of it
channel.sendToQueue -> the consumer sends the result, message or acknowledgement to the queue.
The Buffer. from() method creates a new buffer filled with the specified string, array, or buffer.
Input :
var buf = Buffer.from('abc');
console.log(buf);
O/P:
[34 64 68 4 2 56]







