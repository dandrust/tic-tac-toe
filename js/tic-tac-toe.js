$(document).ready(function() {

    // Board object
    var board = {
        state: [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ],
        computerMarker: "",
        humanMarker: "",
        playerTurn: null,

        clear: function() {
            board.state = [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ];
            $(".square").html("&nbsp;");
            $(".square").removeClass("occupied");
        },

        isTerminal: function(board) {
            // Determine winner. return true for computer win, false for player win,
            // 0 for draw, and -1 for non-terminal board

            var diagonal1 = [board[0][0], board[1][1], board[2][2]];
            var diagonal2 = [board[0][2], board[1][1], board[2][0]];
            var col = [];
            var compare = function(arr) {
                if ((arr[0] === arr[1] && arr[1] === arr[2]) && arr[0] !== null) {
                    return true;
                }
            };

            // Check for winner in horizontal and vertical rows
            for (var x = 0; x < 3; x++) {
                col = [board[0][x], board[1][x], board[2][x]];
                if ((compare(board[x]) || compare(col)) === true) {
                    return board[x][x];
                }
            }

            // Check for winner in diagonal rows
            if ((compare(diagonal2) || compare(diagonal1)) === true) {
                return board[1][1];
            }

            // Check for draw
            if (board.reduce(function(a, b) {
                    return a.concat(b);
                }).indexOf(null) === -1) {
                return 0;
            }

            // Default return -1: non-terminal
            return -1;
        },

        logMove: function(moveCoords, player) {
            console.log(moveCoords);
            if (player !== board.playerTurn) {
                return;
            }

            var row = moveCoords[0];
            var col = moveCoords[1];

            // If space is empty
            if (board.state[row][col] === null) {
                // update the board state
                board.state[row][col] = player;

                // update move on screen
                board.update(row, col, player);

                // Check for win
                var isTerminal = board.isTerminal(board.state);
                if (isTerminal !== -1) {
                    board.announceFinish(isTerminal);
                } else {
                    // Switch turn
                    board.toggleTurn();
                }

                // if space is taken
            } else {
                console.log("this space is already taken.  choose another move");
            }
        },

        toggleTurn: function() {
            board.playerTurn = !board.playerTurn;
            if (board.playerTurn) {
                // Make it seem that the computer is thinking
                window.setTimeout(function() {
                    AI.makeMove(board.state);
                }, Math.floor(Math.random() * 2000 + 2500));
            }
            var agent = board.playerTurn ? "Computer" : "Human";
            if (agent === "Computer") {
                message.writeMessage(agent + " is thinking...");
            } else {
                message.writeMessage(agent + "'s turn");
            }
        },

        announceFinish: function(endResult) {
            var toDisplay = ""
            if (typeof endResult === "boolean") {
                if (endResult) {
                    toDisplay = "computer wins!";
                } else {
                    toDisplay = "human wins!";
                }
            } else if (endResult === 0) {
                toDisplay = "It's a draw!";
            }

            message.writeMessage(toDisplay);
            window.setTimeout(function() {
                message.clearMessage();
                board.playAgain(null);
            }, 2000)
        },

        playAgain: function(val) {

            if (val === null) {
                message.writeMessage("Play Again?");
                message.writeOptions("&nbsp;&nbsp;Yes&nbsp;&nbsp;", "&nbsp;&nbsp;No&nbsp;&nbsp;");
                message.showOptions();
                message.setOptionsTarget(function(val) {
                    board.playAgain(val);
                });
            } else {
                message.clearMessage();
                message.hideOptions();
                if (val === "Y") {
                    board.startGame();
                } else if (val === "N") {
                    message.writeMessage("(refresh page to play again)");
                }
            }




        },

        update: function(row, col, player) {
            $(".s" + row + "" + col).html(player ? board.computerMarker : board.humanMarker);
            $(".s" + row + "" + col).addClass("occupied");
        },

        chooseMarker: function(val) {
            console.log("here!");
            if (val === null) {
                message.writeMessage("Choose your marker:");
                message.writeOptions("&nbsp;&nbsp;X&nbsp;&nbsp;", "&nbsp;&nbsp;O&nbsp;&nbsp;");
                message.showOptions();
                message.setOptionsTarget(function(val) {
                    board.chooseMarker(val);
                });
                return;
            } else if (val === "X") {
                board.computerMarker = "O";
                board.humanMarker = "X";

            } else if (val === "O") {
                board.computerMarker = "X";
                board.humanMarker = "O";

            }

            message.hideOptions();
            message.clearMessage();
            board.coinToss();

        },

        startGame: function() {
            // Set variables
            board.clear();
            board.playerTurn = null;
            board.chooseMarker(null);
        },

        coinToss: function() {
            var firstPlayer = "";
            if (Math.floor(Math.random() * 2 + 1) === 1) {
                firstPlayer = "Computer";
                // Set to oppostite because toggleTurn call below will reverse
                board.playerTurn = false;
            } else {
                firstPlayer = "Human";
                // Set to oppostite because toggleTurn call below will reverse
                board.playerTurn = true;
            }

            message.writeMessage(firstPlayer + " will play first");
            window.setTimeout(function(firstPlayer) {
                message.clearMessage();
                board.toggleTurn();
            }, 1000);
        },

    };

    // Message object
    var message = {
        messageBox: $(".message1"),
        optionBox1: $(".option1"),
        optionBox2: $(".option2"),
        options: $(".option1, .option2"),
        optionsTarget: null,

        writeMessage: function(string) {
            message.messageBox.html(string);
        },

        clearMessage: function() {
            message.messageBox.html("&nbsp;")
        },

        writeOptions: function(message1, message2, target) {
            message.optionBox1.html(message1);
            message.optionBox2.html(message2);

        },

        showOptions: function() {
            message.options.removeClass("hidden");
        },

        hideOptions: function() {
            message.options.addClass("hidden");
        },

        setOptionsTarget(targetFunction) {
            message.optionsTarget = targetFunction;
        }

    };

    // Computer AI object
    var AI = {
        findNextMove: function(currentBoard, player, depth) {

            // Base case: there is a winnner or a draw (terminal board)

            var isTerminal = board.isTerminal(currentBoard);
            //console.log(isTerminal);
            if (typeof isTerminal === "boolean") {
                //console.log("It's boolean!")
                if (isTerminal) {
                    //console.log("computer won");
                    return [1];
                } else {
                    //console.log("player won");
                    //console.log("returning -1!")
                    return [-1];
                }
            } else if (isTerminal === 0) {
                //console.log("draw");
                return [0];
            }

            var compareVal;
            var bestVal = null;
            var bestCoords = [];

            // Loop through rows
            for (var x = 0; x < 3; x++) {
                // Loop through columns
                for (var y = 0; y < 3; y++) {

                    // Check if space is empty
                    if (currentBoard[x][y] === null) {

                        // Set the space to the current player's marker
                        currentBoard[x][y] = player;

                        // Generate next move based on hypothetical move just made
                        compareVal = AI.findNextMove(currentBoard, !player, depth + 1)[0];
                        //console.log(compareVal);

                        // Determine if the value is optimal at this stage, and save it if it is
                        if (bestVal === null || ((player && compareVal > bestVal) || (!player && compareVal < bestVal))) {
                            //console.log("found a good one!");
                            bestVal = compareVal;
                            bestCoords = [x, y];
                            //console.log(bestCoords);
                        }

                        // Change it back empty
                        currentBoard[x][y] = null;
                    }
                }

            }
            return [bestVal, bestCoords]
        },

        makeMove: function(currentBoard) {
            board.logMove(AI.findNextMove(board.state, true, 0)[1], true);
        }
    };

    // Event handlers
    $(".square").on("click", function(event) {
        var squareID = event.target.className.split(" ")[1];
        var row = parseInt(squareID[1]);
        var col = parseInt(squareID[2]);
        board.logMove([row, col], false);

    });
    $(".option1, .option2").on("click", function() {
        message.optionsTarget($(this).html().slice(12, 13));
    });

    board.startGame();



});
