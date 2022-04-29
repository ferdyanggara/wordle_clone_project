const Game = require("./gameClass")

class GameManager{

    static #manager = null;

    #gameDictionary = {};
    #socket

    static getGameManager(socket){
        if(!GameManager.#manager == null){
            GameManager.#manager = new GameManager();
            this.#socket = socket;
        }
        return GameManager.#manager
    }

    createGame(player){
        
    }
}