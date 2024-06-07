const avalibleServers = require('./config.json').servers;
const healtConfig = require('./config.json').healtCheck;
const Express = require('express');
const cron = require('node-cron')
const Table = require('cli-table3')
const axios = require('axios');
const app = Express();

let chalk;
(async () => {
  chalk = (await import('chalk')).default;

  var table = new Table({ head: [chalk.white("Time"), chalk.blue("Total Servers"), chalk.green("Healthy Servers"), "Dead Servers"] });
  
  let healthyServers = [];
  let current = -1;

  healthyServers.push(...avalibleServers);
  
  const healthCheck = async () => {
      try {
          console.log(chalk.blue(`----- Health check run at every ${healtConfig.healthCheckTimeout} seconds -----`));
          for (let i = 1; i <= avalibleServers.length; i++) {
              const curr = avalibleServers[i - 1];
              console.log("currnet ==>",curr);
        try {
            //Sending a request to the backend server to validate if it is still running or not.
            const res = await axios.get(`http://${curr.host}:${curr.port}${healtConfig.healthCheckEndPoint}`);
            
            //This line of code is to make the a server as healthy server once it goes down and then restarts.
            const index = healthyServers.indexOf(curr);
            if (index < 0) healthyServers.push(curr);
        } catch (error) {
          const index = healthyServers.indexOf(curr);
          console.log("Index of dead server =>",index);
          if(index > -1) healthyServers.splice(index, 1);
          console.log(healthyServers);
          console.error(
            `healthCheckError - > serverNumber -> ${curr.port} , errorMessage: ${error.message}`
          );
          
        }
      }

      const healthyServersCount = healthyServers.length;
      const deadServersCount = avalibleServers.length - healthyServers.length;

      table.splice(0, table.length);
      table.push(
        [new Date().toTimeString(), avalibleServers.length, healthyServersCount, deadServersCount]
      );

      console.log(table.toString());
    } catch (error) {
      console.log(error);
    }
  };


  const roundRobinAlgorithm = ()=>{
    if(healthyServers.length <= 0) return null;
    current = (current+1) % healthyServers.length;
    return current;
  }

  const makeRequestToServer = async(req,res) =>{
    console.log("Healthy survers =>",healthyServers[current])
    try {
        const { data } = await axios({
          method: req.method,
          url: `http://${healthyServers[current].host}:${healthyServers[current].port}${req.originalUrl}`,
        });
        return res.status(200).json({
          success: true,
          data,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
  }

  const handleRequest = async (req,res) =>{
    const currentServer = roundRobinAlgorithm();
    try{
      if(currentServer == null) {
        return res.json({
          success: false,
          error: "All Servers are dead !😵",
          message:
            "There is no healthy servers avalible. Make sure the url in cofig.json file is correct 🙄",
        })
      }
      return makeRequestToServer(req,res);
    }catch(error){
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }


app.all("*" , (req,res)=>  handleRequest(req,res));



  app.listen(3000, () => {
    console.log("Load Balancer up and running at port 3000");
    const healthCheckCronJob = cron.schedule(`*/${healtConfig.healthCheckTimeout} * * * * *`, () => {
      healthCheck();
    });
  });


})();
