const Express = require('express');
const app = Express();

app.use('/',(req,res)=>{
    res.json({message:"This is server 3003"})
})

app.listen(3003,()=> console.log("Server started at port 3003"))