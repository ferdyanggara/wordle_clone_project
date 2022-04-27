const WORDS = require("./words")

class WordDictionary{

    #wordDatabase;
    #wordNumber;

    constructor(){
        this.#wordDatabase = {}
        this.#wordNumber = WORDS.length;
        WORDS.forEach(value => {
            this.#wordDatabase[value] = true
        });
    }

    static #theDictionary =  null;

    static getDictionary(){
        if(!WordDictionary.#theDictionary){
            WordDictionary.#theDictionary = new WordDictionary();
        }
        return WordDictionary.#theDictionary;
    }

    checkIfWordExist(word){
        return word in this.#wordDatabase;
    }

    checkDifferences(word1, word2){
        const result = [];
        let isCorrect = true;

        if(word1.length !== word2.length){
            return null;
        }

        for(let i = 0; i < word1.length; i++){
            if(word1[i] === word2[i]){
                result.push({
                    letter : word1[i],
                    position : i,
                    status : "correct"
                });
            }
            else{
                isCorrect = false;
                const foundIndex = word2.indexOf(word1[i]);
                result.push({
                    letter : word1[i],
                    position : i,
                    status : foundIndex !== -1 ? "found" : "wrong"
                });
            }
        }
        return {
            correct : isCorrect,
            data : result
        };
    }

    getRandomWord(){
        return Object.keys(this.#wordDatabase)[Math.floor(Math.random() * this.#wordNumber)]
    }

}


// const test = WordDictionary.getDictionary()
// console.log(test.checkIfWordExist("which"))
// console.log(test.checkIfWordExist("asjkd"))

// console.log(test.checkDifferences("aabbc", "abcde"))
// console.log(test.getRandomWord())

module.exports = WordDictionary;