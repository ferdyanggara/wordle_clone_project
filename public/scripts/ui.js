
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
            const username = $("#roomId").val().trim();
  
            // TODO: SEND API REQUEST TO CREATE A NEW GAME
            // GamePortal.joinGame(id,
            //     () => {
            //         hide();
            //         UserPanel.update(Authentication.getUser());
            //         UserPanel.show();
                    
  
            //         
            //     },
            //     (error) => { $("#matchmaking-message").text(error); }
            // );
        });

        $("#createGame").on("click", (e) => {
            // TODO: POST REQUEST ON CREATE RANDOM GAME (ROOM ID CAN BE CREATED ON SERVER SIDE)
                        // TODO: SEND API REQUEST TO CREATE A NEW GAME
            // GamePortal.createGame(
            //     () => {
            //         hide();
            //         UserPanel.update(Authentication.getUser());
            //         UserPanel.show();
                    
  
            //         
            //     },
            //     (error) => { $("#matchmaking-message").text(error); }
            // );
        })

        $("#quickJoin").on("click", (e) => {

            // TESTING TO GO TO GAME
            hide();
            // TODO: SEND API REQUEST FOR QUICK JOIN  
            // GamePortal.quickJoin(
            //     () => {
            //         hide();
            //         UserPanel.update(Authentication.getUser());
            //         UserPanel.show();
                    
  
            //         
            //     },
            //     (error) => { $("#matchmaking-message").text(error); }
            // );
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



const UI = (function() {
  // This function gets the user display
  const getUserDisplay = function(user) {
      return $("<div class='field-content row shadow'></div>")
          .append($("<span class='user-avatar'>" +
            Avatar.getCode(user.avatar) + "</span>"))
          .append($("<span class='user-name'>" + user.name + "</span>"));
  };

  const components = [SignInForm, UserPanel, MatchMaking, ProjectIntroduction];


  // This function initializes the UI
  const initialize = function() {
      // Initialize the components
      for (const component of components) {
          component.initialize();
      }
  };

  return { getUserDisplay, initialize };
})();
