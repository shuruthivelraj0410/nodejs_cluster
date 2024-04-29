const prompt = require('prompt-sync')()


function fibonacci(n){
    if(n<=1){
        return n ;

    }
    else{
      let  fibo = fibonacci(n-1)+fibonacci(n-2)
      return fibo
    }
}



module.exports = fibonacci