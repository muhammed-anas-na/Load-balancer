module.exports = function weighteAlgorithm(servers){
    let weighted_server = 0;
    console.log(servers);
    for(let i=1;i<servers.length;i++){
        if(servers[weighted_server].weight < servers[i].weight) weighted_server = i;
    }
    return weighted_server;
}