const Express = require('express');
const app = Express();
app.get('/fast-response' , (req,res)=>{
    const startTime = Date.now();
    setTimeout(()=>{
        const endTime = Date.now(); // Record the end time
        const responseTime = endTime - startTime; // Calculate the response time
        
        res.json({
            success:true,
            message:"Fast response Endpoint",
            responseTime:`${responseTime} ms`
        })
    })
})

app.get('/slow-response' , (req,res)=>{
    const startTime = Date.now();
    setTimeout(()=>{
        const endTime = Date.now(); // Record the end time
        const responseTime = endTime - startTime; // Calculate the response time

        res.json({
            success:true,
            message:"Slow response Endpoint",
            responseTime:`${responseTime} ms`
        })
    },1000)
})
app.get('/',(req,res)=>{
    res.json({message:"This is server 3002"})
})
app.listen(3002,()=> console.log("Server started at port 3002"))