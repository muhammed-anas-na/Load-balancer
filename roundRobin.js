//Round Robin Alrogithm used to send the request to next healthy server.
//It make use of two data. First the last server which we send the request and the total number to servers.

const roundRobinAlgorithm = (current , totalServers) => {
    if (totalServers <= 0) return null;
    current = (current + 1) % totalServers;
    console.log("Current ==>",current);
    return current;
};

module.exports = roundRobinAlgorithm;