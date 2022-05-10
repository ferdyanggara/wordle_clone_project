const fs = require("fs")

class ScoreDictionary{

    #highScore = {}; //should be only 3 person

    static #instance = null;

    // base data should be { player : string, score : _ }
    constructor(){
        this.#highScore = JSON.parse(fs.readFileSync("./data/score.json"));
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
            this.#highScore[scoreData.score] = {
                players : [scoreData.player],
                stats : {
                }
            }

            this.#highScore[scoreData.score].stats[scoreData.player] = this.getStats(scoreData);
            // let totalGuess = 0;
            // for(let i = 0; i < scoreData.stat.count; i++){
            //     totalGuess += scoreData.stat.count[i]
            // }
            // this.#highScore[scoreData.score] = [{
            //     player : scoreData.player,
            //     avgGuess : totalGuess / scoreData.score
            // }]
        }
        else{
            if(!(this.#highScore[scoreData.score].players.includes(scoreData.player))){
                this.#highScore[scoreData.score].players.push(scoreData.player);

                this.#highScore[scoreData.score].stats[scoreData.player] = this.getStats(scoreData);
            }
        }   
        fs.writeFileSync("./data/score.json", JSON.stringify(this.#highScore));
    }

    getStats(scoreData){
        let totalGuess = 0;
        for(let i = 0; i < scoreData.stat.count.length; i++){
            totalGuess += scoreData.stat.count[i];
        }
        return {
            totalGuess : totalGuess,
            score : scoreData.score,
            avgGuess : totalGuess / scoreData.score,
            avgGuessPerScore : toz
        };
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
        
        for(let i = 0; i < topKey.length; i++){
            for(let j = 0; j < this.#highScore[topKey[i]].players.length; i++){
                if(result.length >= n){
                    return result;
                }
                const target =this.#highScore[topKey[i]].players[j];
                result.push({
                    player : target,
                    stat : this.#highScore[topKey[i]].stats[target]
                })
            }
        }

        return result;
    }
}

const temp = ScoreDictionary.getInstance();

temp.addScoreData({
    player : "ferdy",
    currentWord : "yeeha",
    score : 20,
    stat : {
        attempt : [1,2,3,4,5,6], //hardcode
        count : [1,10,2,5,3,4]
    }
});
temp.addScoreData({
    player : "test1",
    currentWord : "yeeha",
    score : 15,
    stat : {
        attempt : [1,2,3,4,5,6], //hardcode
        count : [1,1,2,3,3,4]
    }
});
temp.addScoreData({
    player : "test2",
    currentWord : "yeeha",
    score : 10,
    stat : {
        attempt : [1,2,3,4,5,6], //hardcode
        count : [1,3,2,2,3,1]
    }
});

console.log(temp.getTopN(2));


module.exports = ScoreDictionary;