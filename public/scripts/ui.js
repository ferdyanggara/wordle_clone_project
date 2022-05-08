
const ProjectIntroduction = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Populate the avatar selection
        // Avatar.populate($("#register-avatar"));
        
        // Hide it
        $("#intro-overlay").hide();
  
        // Submit event for the intro form
        $("#intro-close").on("click", (e) => {
            hide();
            Authentication.validate(
                () => {
                    SignInForm.hide();
                    UserPanel.update(Authentication.getUser());
                    MatchMaking.show();
                },
                () => { 
                    SignInForm.show(); }
            );
        });
    };
  
    // This function shows the form
    const show = function() {
        $("#intro-overlay").fadeIn(500);
    };
  
    // This function hides the form
    const hide = function() {
        $("#intro-overlay").fadeOut(500);
    };
  
    return { initialize, show, hide };
  })();

const SignInForm = (function() {
  // This function initializes the UI
  const initialize = function() {
      // Populate the avatar selection
      // Avatar.populate($("#register-avatar"));
      
      // Hide it
      $("#signin-overlay").hide();

      // Submit event for the signin form
      $("#signin-form").on("submit", (e) => {
          // Do not submit the form
          e.preventDefault();

          // Get the input fields
          const username = $("#signin-username").val().trim();
          const password = $("#signin-password").val().trim();

          // Send a signin request
          Authentication.signin(username, password,
              () => {
                  hide();
                  // show the matchmaking overlay 
                  MatchMaking.show();
                  console.log('connecting to socket')
                  Socket.connect();
              },
              (error) => { $("#signin-message").text(error); }
          );
      });

      // Submit event for the register form
      $("#register-form").on("submit", (e) => {
          // Do not submit the form
          e.preventDefault();

          // Get the input fields
          const username = $("#register-username").val().trim();
          const name     = $("#register-name").val().trim();
          const password = $("#register-password").val().trim();
          const confirmPassword = $("#register-confirm").val().trim();

          // Password and confirmation does not match
          if (password != confirmPassword) {
              $("#register-message").text("Passwords do not match.");
              return;
          }

          // Send a register request
          Registration.register(username, name, password,
              () => {
                  $("#register-form").get(0).reset();
                  $("#register-message").text("You can sign in now.");
              },
              (error) => { $("#register-message").text(error); }
          );
      });
  };

  // This function shows the form
  const show = function() {
      $("#signin-overlay").fadeIn(500);
  };

  // This function hides the form
  const hide = function() {
      $("#signin-form").get(0).reset();
      $("#signin-message").text("");
      $("#register-message").text("");
      $("#signin-overlay").fadeOut(500);
  };

  return { initialize, show, hide };
})();


const Room = (function() {
    const initialize = function() {
        $("#room-overlay").hide();
  
        $("#room-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            const gameId = $("#roomId").val().trim();

            RoomPortal.startRoom(gameId,
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();
                },
                (error) => { $("#room-message").text(error); }
            );

        });
    };
  
    const show = function() {
        $("#room-overlay").fadeIn(500);
    };
  
    const hide = function() {
        $("#room-form").get(0).reset();
        $("#room-message").text(""); 
        // $("#register-message").text("");
        $("#room-overlay").fadeOut(500);
    };
  
    return { initialize, show, hide };
  })();
  
const MatchMaking = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Populate the avatar selection
        // Avatar.populate($("#register-avatar"));
        
        // Hide it
        $("#matchmaking-overlay").hide();
  
        // TODO: Submit event for join game id  
        $("#matchmaking-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();
  
            // Get the input fields
            const gameId = $("#roomId").val().trim();
  
            // TODO: SEND API REQUEST TO JOIN A GAME
            GamePortal.joinGame(gameId,
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();
                },
                (error) => { $("#matchmaking-message").text(error); }
            );

        });

        $("#createGame").on("click", (e) => {
            // TODO: POST REQUEST ON CREATE RANDOM GAME (ROOM ID CAN BE CREATED ON SERVER SIDE)
                        // TODO: SEND API REQUEST TO CREATE A NEW GAME
            GamePortal.createGame(
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();
                },
                (error) => { $("#matchmaking-message").text(error); }
            );
            
        })

        $("#quickJoin").on("click", (e) => {
            
            // TESTING TO GO TO GAME
            // TODO: SEND API REQUEST FOR QUICK JOIN  
            GamePortal.quickJoin(
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();
                },
                (error) => { $("#matchmaking-message").text(error); }
            );

            

        })

    };
  
    // This function shows the form
    const show = function() {
        $("#matchmaking-overlay").fadeIn(500);
    };
  
    // This function hides the form
    const hide = function() {
        $("#matchmaking-form").get(0).reset();
        $("#matchmaking-message").text(""); 
        // $("#register-message").text("");
        $("#matchmaking-overlay").fadeOut(500);
    };
  
    return { initialize, show, hide };
  })();


// USER PANEL 

const UserPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                    SignInForm.show();
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            $("#user-panel .user-name").text(user.name);
        }
        else {
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const GameUI = (function() {
    const MAXGUESS = 6;
    const LETTERLIMIT = 5;
    let guessesRemaining = 6;

    let gameId = "";
    let playerName = "";
    let enemyName = ""

    const initialize = () => {
        // init player game board
        let board = document.getElementById("game-board"); 
        for (let i = 0; i < 6; i++) {
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            var svgNS = svg.namespaceURI;
            svg.setAttribute('width', 275);
            svg.setAttribute('height', 57);
            svg.setAttribute('class', 'my-letter-row');
            
            for (let j = 0; j < 5; j++) {
                let g = document.createElementNS(svgNS,'g');
                g.setAttribute('class', 'my-letter-box');

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

        // init enemy game board
        let opp_board = document.getElementById("opponent-board");
        for (let i = 0; i < 6; i++) {
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            var svgNS = svg.namespaceURI;
            svg.setAttribute('width', 275);
            svg.setAttribute('height', 57);
            svg.setAttribute('class', 'opp-letter-row');
            
            for (let j = 0; j < 5; j++) {
                let g = document.createElementNS(svgNS,'g');
                g.setAttribute('class', 'opp-letter-box');

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

    const startGame = (gameData, playerData, enemyData) => {
        gameId = gameData;
        playerName = playerData;
        enemyName = enemyData;
        let typedWord = [];
        // full setup game data

        // reset all boards including player and enemy
        for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
            let myRow = document.getElementsByClassName("my-letter-row")[i]
            let oppRow = document.getElementsByClassName("opp-letter-row")[i]
            for (let j = 0; j < 5; j++) {
                let delay = 250 * i
                // clear My Board =============================================
                let box = myRow.children[j].children[1];
                box.textContent = "";
               
                setTimeout(()=> {
                    box.classList.remove("filled-box");
                    row.children[j].children[0].setAttribute('fill', "white");
                }, delay)

                // clear Enemy Board ==========================================
                box = oppRow.children[j].children[1];
                box.textContent = "";

                setTimeout(()=> {
                    box.classList.remove("filled-box");
                    row.children[j].children[0].setAttribute('fill', "white");
                }, delay)
            }
        }

        // reset my keyboard
        $("#keyboard-button").css("background-color", "rgb(242, 133, 93)");

        // keyboard
        document.addEventListener("keyup", (e) => {
            let pressedKey = String(e.key)
            if (pressedKey === "Backspace" && nextLetter !== 0) {
                if(typedWord.length > 0) {
                    typedWord.pop();
                }
            }
            if (pressedKey === "Enter") {
                if(typedWord.length == 5){
                    let word = "";
                    // get the current typed word here
                    for (let i = 0; i < 5; ++i) {
                        word += typedWord[i];
                    }
                    guessesRemaining--;
                    return word;
                }
            }
        
            let found = pressedKey.match(/[a-z]/gi)
            if (!found || found.length > 1) {
                return
            } else {
                if(typedWord.length < 5){
                    typedWord.push(pressedKey.toLocaleLowerCase());

                    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
                    let box = row.children[typedWord.length-1].children[1];
                    // animateCSS(box, "pulse");
                    box.textContent = pressedKey;
                    box.classList.add("filled-box");
                }
                // insert insertLetter() functionality here                
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
    }

    const updateBoard = (id, player, word, nthGuess) => {
        const letterLimit = 5;
        if(nthGuess > MAXGUESS) {
            return;
        }

        const shadeKeyBoard = (letter, color) => {
            let className = "." + letter + "-key"
            let oldColor = $(className).css("background-color");
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }
            $(className).css("background-color", color);
        }

        // INPUT LETTER
        if (id == gameId && word != null) {
            // UPDATE MY BOARD
            if (player == playerName){
                let row = document.getElementById("game-board").children[nthGuess-1];

                // Fill an empty row with "word"
                // for (let i = 0; i < letterLimit; ++i) {
                //     let box = row.children[i].children[1]
                //     box.textContext = word[i].letter;
                // }

                // Change color box
                for (let i = 0; i < letterLimit; ++i) {
                    let letterColor = "gray";
                    if(word[i].status == "found") {
                        letterColor = "yellow";
                    }
                    else if (word[i].status == "correct") {
                        letterColor = "green";
                    }
                    let delay = 250 * i
                    setTimeout(()=> {
                        // animateCSS(box, 'flipInX')
                        row.children[i].children[0].setAttribute('fill', letterColor)
                        shadeKeyBoard(word[i].letter, letterColor)
                    }, delay)
                }

            }
            // UPDATE ENEMY BOARD
            else if (player == enemyName){
                let row = document.getElementById("opponent-board").children[nthGuess-1];
                
                // Fill an empty row with "word"
                for (let i = 0; i < letterLimit; ++i) {
                    row.children[i].children[1].textContext = word[i].letter;
                }

                // Change color box
                for (let i = 0; i < letterLimit; ++i) {
                    let letterColor = "gray";
                    if(word[i].status == "found") {
                        letterColor = "yellow";
                    }
                    else if (word[i].status == "correct") {
                        letterColor = "green";
                    }
                    let delay = 250 * i
                    setTimeout(()=> {
                        // animateCSS(box, 'flipInX')
                        row.children[i].children[0].setAttribute('fill', letterColor)
                        shadeKeyBoard(word[i].letter, letterColor)
                    }, delay)
                }
            }
        }
    }

    const resetBoard = () => {
        // insert function to reset the board based on the player name
        // basically clearBoard()
    }

    const endGame = () => {
        // remove the keyup event/ disable typing
        
    }
    
    return { initialize };
})();


const UI = (function() {
  // This function gets the user display
  const getUserDisplay = function(user) {
      return $("<div class='field-content row shadow'></div>")
          .append($("<span class='user-avatar'>" +
            Avatar.getCode(user.avatar) + "</span>"))
          .append($("<span class='user-name'>" + user.name + "</span>"));
  };

  const components = [SignInForm, UserPanel, MatchMaking, ProjectIntroduction, Room];


  // This function initializes the UI
  const initialize = function() {
      // Initialize the components
      for (const component of components) {
          component.initialize();
      }
  };

  return { getUserDisplay, initialize };
})();

