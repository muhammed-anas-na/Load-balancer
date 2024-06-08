# Load Balancer

This project is a basic implementation of a load balancer using NodeJS and ExpressJS. The load balancer distributes incoming requests across multiple servers to ensure efficient utilization of resources and improved system reliability.

![Example Image](image.png)


## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/muhammed-anas-na/wasserstoff.git

   
2. **Install dependencies:**

   ```bash
   cd wasserstoff
   npm install

# Usage

1. **Configure the config.json file:**
Configure the file with the list of servers and health check properties.

2. **Start the Load Balancer server:**
   ```bash
   npm start

- Load balancer will continusly check weather the server is healthy or not. And send the incomming traffic to the appropriate healthy servers using Round Robin algorithm.


[DOCKER HUB](https://hub.docker.com/repository/docker/anasna/load-balancer)
```bash
   docker pull anasna/load-balancer
