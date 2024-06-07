const Express = require('express');
const app = Express();

app.use('/',(req,res)=>{
    res.json({message:"This is server 3001"})
})

app.listen(3001,()=> console.log("Server started at port 3001"))