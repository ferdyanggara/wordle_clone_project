import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]

console.log(rightGuessString)

function initBoard() {
    // Player board
    let board = document.getElementById("game-board"); 

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var svgNS = svg.namespaceURI;
        svg.setAttribute('width', 275);
        svg.setAttribute('height', 57);
        svg.setAttribute('class', 'letter-row');
        
        for (let j = 0; j < 5; j++) {
            let g = document.createElementNS(svgNS,'g');
            g.setAttribute('class', 'letter-box');

            let rect = document.createElementNS(svgNS,'rect');
            rect.setAttribute('x', 50*j + 5*j + 1);
            rect.setAttribute('y', i + 1);
            rect.setAttribute('width', 50);
            rect.setAttribute('height', 50);
            rect.setAttribute('fill','white');
            rect.setAttribute('stroke', 'grey');
            rect.setAttribute('stroke-width', 1);
            rect.setAttribute('rx', 2);
            rect.setAttribute('ry', 2);
            g.append(rect)

            let text = document.createElementNS(svgNS,'text');
            text.setAttribute('x', 13 + 50*j + 5*j + 1);
            text.setAttribute('y', 40 + i);
            text.setAttribute('font-size', 40);
            text.setAttribute('fill', 'black')
            text.textContent = "";
            g.append(text)

            svg.appendChild(g);
            // rect.className = "letter-box"
        }

        board.appendChild(svg);
    }

    // Opponent board
    let opp_board = document.getElementById("opponent-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var svgNS = svg.namespaceURI;
        svg.setAttribute('width', 275);
        svg.setAttribute('height', 57);
        svg.setAttribute('class', 'letter-row');
        
        for (let j = 0; j < 5; j++) {
            let g = document.createElementNS(svgNS,'g');
            g.setAttribute('class', 'letter-box');

            let rect = document.createElementNS(svgNS,'rect');
            rect.setAttribute('x', 50*j + 5*j + 1);
            rect.setAttribute('y', i + 1);
            rect.setAttribute('width', 50);
            rect.setAttribute('height', 50);
            rect.setAttribute('fill','white');
            rect.setAttribute('stroke', 'grey');
            rect.setAttribute('stroke-width', 1);
            rect.setAttribute('rx', 2);
            rect.setAttribute('ry', 2);
            g.append(rect)

            // <text x="62" y="48" font-size="40" fill="black">A</text>
            let text = document.createElementNS(svgNS,'text');
            text.setAttribute('x', 13 + 50*j + 5*j);
            text.setAttribute('y', 40 + i);
            text.setAttribute('font-size', 40);
            text.setAttribute('fill', 'black');
            // text.textContent = "";
            g.append(text)

            svg.appendChild(g);
            // rect.className = "letter-box"
        }
        opp_board.appendChild(svg);
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter - 1]
    // box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}

function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)

    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != 5) {
        toastr.error("Not enough letters!")
        return
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not in list!")
        return
    }

    
    for (let i = 0; i < 5; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey'
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i]) {
                // shade green 
                letterColor = 'green'
            } else {
                // shade box yellow
                letterColor = 'yellow'
            }

            rightGuess[letterPosition] = "#"
        }

        let delay = 250 * i
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX')
            //shade box
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right! Game over!")
        guessesRemaining = 0
        return
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: "${rightGuessString}"`)
        }
    }
}

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    // let row = document.querySelector("svg.letter-row")[6 - guessesRemaining];
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]

    let box = row.children[nextLetter].children[1];
    console.log(box);
    // box.textContent = pressedKey;

    animateCSS(box, "pulse");
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextLetter += 1;
}

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

initBoard();