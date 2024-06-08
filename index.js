const avalibleServers = require("./config.json").servers; //This is the list of servers
const healtConfig = require("./config.json").healtCheck; // Health check configrations

const Express = require("express");
const cron = require("node-cron"); //Used Schedule a task
const Table = require("cli-table3");
const axios = require("axios");
const roundRobinAlgorithm = require("./roundRobin"); //Algorithm to find the next server
const logger = require("./logger");
const weighteAlgorithm = require("./weighteAlgorithm");

const app = Express();
app.use(Express.json());

let chalk;
(async () => {
  chalk = (await import("chalk")).default; //Chalk is used to print colored output in the terminal

  var table = new Table({
    //Creating a table with Time, Total servers, Healthy servers and Dead servers
    head: [
      chalk.white("Time"),
      chalk.blue("Total Servers"),
      chalk.green("Healthy Servers"),
      "Dead Servers",
    ],
  });

  let healthyServers = []; //This Array is used to store all the HealthyServers, that we can redirect the traffic.
  let current = -1; //Used to track the server which we want to send the request. (Round Robin Algorithm).

  healthyServers.push(...avalibleServers);

  const healthCheck = async () => {
    //Function used to continusly check the health state of the avalible servers.
    try {
      console.log(
        chalk.blue(
          `----- Health check run at every ${healtConfig.healthCheckTimeout} seconds -----`
        )
      );
      for (let i = 1; i <= avalibleServers.length; i++) {
        const curr = avalibleServers[i - 1];
        try {
          console.log(`${curr.host}${healtConfig.healthCheckEndPoint}`)
          //Sending a request to the backend server to validate if it is still running or not.
          const res = await axios.get(
            `${curr.host}${healtConfig.healthCheckEndPoint}`
          );

          //This two line of code is to make the a server as healthy server once it goes down and then restarts.
          const index = healthyServers.indexOf(curr);
          if (index < 0) healthyServers.push(curr);
        } catch (error) {
          //When a server is down it will be removed from the healthyServer array.
          const index = healthyServers.indexOf(curr);
          if (index > -1) healthyServers.splice(index, 1);

          logger.error(
            `healthCheckError - > serverNumber -> ${curr.port} , errorMessage: ${error.message}`
          );
        }
      }

      const healthyServersCount = healthyServers.length;
      const deadServersCount = avalibleServers.length - healthyServers.length;

      table.splice(0, table.length);
      table.push([
        //Updating the table data with new server data.
        new Date().toTimeString(),
        avalibleServers.length,
        healthyServersCount,
        deadServersCount,
      ]);

      console.log(table.toString());
    } catch (error) {
      console.log(error);
    }
  };

  //This function is used to send the actual request to the backend servers and handle the response.
  const makeRequestToServer = async (req, res) => {
    try {
      const { data } = await axios({
        //Routiing the original request from load balancer to actual servers.
        method: req.method,
        url: `${healthyServers[current].host}${req.originalUrl}`,
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
  };

  //This function is used to handle the incoming request and select the appropriate server to send. It passes the requeset and response to makeRequestTOServer function and the original request is send by it.
  const handleRequest = async (req, res) => {
    logger.info("Handling request");
    logger.info(
      `Received request from ${req.ip}\nHost: ${
        req.hostname
      }\nUser-Agent: ${req.get("User-Agent")}\nPayload-size:${
        JSON.stringify(req.body).length
      }`
    );
    const payLoadSize = JSON.stringify(req.body).length;
    if (payLoadSize > 500) {
      //If the payload size is more than 500 then the request will be forwarded to the most weighted server.
      current = weighteAlgorithm(healthyServers);
    } else {
      current = roundRobinAlgorithm(current, healthyServers.length); //This function will return the next healthy server which we can send the traffic.
    }
    try {
      if (current == null) {
        return res.json({
          success: false,
          error: "All Servers are dead !😵",
          message:
            "There is no healthy servers avalible. Make sure the url in cofig.json file is correct 🙄",
        });
      }
      return makeRequestToServer(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  //Handling all the incoming request from client.
  app.all("*", (req, res) => handleRequest(req, res));

  app.listen(3000, () => {
    console.log("Load Balancer up and running at port 3000");
    // const healthCheckCronJob = cron.schedule(
    //   //This is used to call the healthCheck function after a specific timeout
    //   `*/${healtConfig.healthCheckTimeout} * * * * *`,
    //   () => {
    //     healthCheck();
    //   }
    // );
  });
})();
