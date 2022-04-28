class Player{
    //Currently very empty because
    //I dont know what to save first, or even do here

    constructor(playerData, playerSocket, disconnectHandler){
        if(!playerData || !playerSocket || !disconnectHandler){
            throw "Missing params. Player cannot be initialized";
        }
        this.data = playerData;
        this.socket = playerSocket;
        this.disconnectHandler = disconnectHandler;
    }

}

module.exports = Player;