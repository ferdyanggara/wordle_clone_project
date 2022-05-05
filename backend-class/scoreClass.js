const fs = require("fs")

class ScoreDictionary{

    #highScore = {}; //should be only 3 person

    static #instance = null;

    // base data should be { player : string, score : _ }
    constructor(){
        this.#highScore = JSON.parse(fs.readFileSync("../data/score.json"));
    }

    static getInstance(){
        if(this.#instance == null){
            this.#instance = new ScoreDictionary();
        }
        return this.#instance;
    }

    addScoreData(scoreData){
        if(scoreData == undefined){
            return;
        }
        if(this.#highScore[scoreData.score] == undefined){
            this.#highScore[scoreData.score] = [scoreData.player]
        }
        else{
            if(scoreData.player in this.#highScore[scoreData.score]){
                this.#highScore.push(scoreData.player)
            }
        }   
        fs.writeFileSync("../data/score.json", JSON.stringify(this.#highScore));
    }

    getTopN(n){
        // lazy implementation
        console.log(this.#highScore)
        const topKey = Object.keys(this.#highScore);
        console.log(topKey)
        topKey.sort((a,b) => {
            return b - a 
        });

        const result = [];
        for(let i = 0 ; i < (topKey.length > n ? n : topKey.length) ; i++){
            result.push({
                score : topKey[i],
                player : this.#highScore[topKey[i]]
            });
        }
        return result;
    }
}

const temp = ScoreDictionary.getInstance();

module.exports = ScoreDictionary;