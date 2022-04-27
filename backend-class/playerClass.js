class Player{
    //Currently very empty because
    //I dont know what to save first, or even do here

    constructor(playerData, playerSocket, disconnectHandler){
        if(!playerData || !playerSocket || !disconnectHandler){
            throw "Missing params. Player cannot be initialized";
        }
        this.playerData = playerData;
        this.playerSocket = playerSocket;
        this.disconnectHandler = disconnectHandler;
    }

    get info(){
        return this.playerData;
    }

    get socket(){
        return this.playerSocket;
    }

}

module.exports = Player;