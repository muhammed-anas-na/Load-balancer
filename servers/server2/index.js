const Express = require('express');
const app = Express();

app.use('/',(req,res)=>{
    res.json({message:"This is server 3002"})
})
app.listen(3002,()=> console.log("Server started at port 3002"))