// Initialize Firebase
const config = {
    apiKey: "AIzaSyCBUmCDAvOqKxMe0Rbpu-5UZTrin1SGciU",
    authDomain: "multiplayer-rps-29165.firebaseapp.com",
    databaseURL: "https://multiplayer-rps-29165.firebaseio.com",
    projectId: "multiplayer-rps-29165",
    storageBucket: "",
    messagingSenderId: "667273371838"
};
firebase.initializeApp(config);

const database = firebase.database();
const connectionsRef = database.ref("/connections");
const playersRef = database.ref("/players");
const messageRef = database.ref("/messages");
let player;
let playerCount = 0;
let playerNum = false;
let currentPlayers = null;
let playerOneExists = false;
let playerTwoExists = false;
let playerOneData = null;
let playerTwoData = null;


//session storage
//store each player's data in their own session
//convert to string


$("#start").on("click", function () {
    event.preventDefault();
    if ($("#playerName").val() !== "") {
    player = $("#playerName").val().trim();
    // addPlayer();
        getInGame();
    console.log(player);
    $("#playerName").val("");
    }
});

$("#chatSend").on("click", function () {
    event.preventDefault();
    let chatMessage = $("#chat").val();
    messageRef.push({
        text: chatMessage
    });
    $("#chat").val("");
});

// Store user choice in firebase
// Have user select choice
$(document).find("#playerOne").on("click", ".RPS", function () {
    
    // const player1ChoiceRef = database.ref("choices");
    let player1Choice = $(this).text().trim();
    
    // console.log(`player1 choice ${player1Choice}`);
    database.ref("/choices/player1Choices").set({
        playerChoice: player1Choice,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
    
});

$(document).find("#playerTwo").on("click", ".RPS", function () {
    
    // const player2ChoiceRef = database.ref("choices");
    let player2Choice = $(this).text().trim();
    
    // console.log(`player2 choice ${player2Choice}`);
    database.ref("/choices/player2Choices").set({
        playerChoice: player2Choice,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
});

// Tracks changes in key which contains player objects
database.ref("players").on("value", function(snapshot) {
    
    // length of the 'players' array
    currentPlayers = snapshot.numChildren();
    
    // Check to see if players exist
    playerOneExists = snapshot.child("1").exists();
    playerTwoExists = snapshot.child("2").exists();
    
    // Player data objects
    playerOneData = snapshot.child("player1/name").val();
    playerTwoData = snapshot.child("player2/name").val();
    
    // If theres a player 1, fill in name and win loss data
    if (playerOneExists) {
        $("#playerOneName").text(snapshot.child("1/name").val());
        // $("#player1-wins").text("Wins: " + playerOneData.wins);
        // $("#player1-losses").text("Losses: " + playerOneData.losses);
    }
    else {
        
        // If there is no player 1, clear win/loss data and show waiting
        $("#playerOneName").text("Waiting for Player 1");
        // $("#player1-wins").empty();
        // $("#player1-losses").empty();
        updatePlayer1();
    }
    
    // If theres a player 2, fill in name and win/loss data
    if (playerTwoExists) {
        $("#playerTwoName").text(snapshot.child("2/name").val());
        // $("#player2-wins").text("Wins: " + playerTwoData.wins);
        // $("#player2-losses").text("Losses: " + playerTwoData.losses);
    }
    else {
        
        // If no player 2, clear win/loss and show waiting
        $("#playerTwoName").text("Waiting for Player 2");
        // $("#player2-wins").empty();
        // $("#player2-losses").empty();
        updatePlayer2();
    }
    
    if (playerOneExists && playerTwoExists) {
        // Display rock paper sicscor choices
        $("#playerOneRPS").html("<p class = RPS>Rock</p>" + "<p class = RPS>Paper</p>" + "<p class = RPS>Scissors</p>");
        $("#playerTwoRPS").html("<p class = RPS>Rock</p>" + "<p class = RPS>Paper</p>" + "<p class = RPS>Scissors</p>");
    }
    else {
        $("#playerOneRPS").empty();
        $("#playerTwoRPS").empty();
    }
  
   
});

// //decide who is player1 or player2 by date added. earliest is player 1
// database.ref("players").orderByChild("dateAdded").on("value", function (snapshot) {
//     let sv = snapshot.val();
//     console.log(sv);
//     console.log("this is in the first database ref before displaying RPS");
//     // $("#playerOneName").text(snapshot.child("player1/name").val());
//     // $("#playerTwoName").text(snapshot.child("player2/name").val());
//
//     // Wait until two players are logged in
//     if ((snapshot.child("player1/name").val() !== null) && (snapshot.child("player2/name").val() !== null)) {
//         // Display rock paper sicscor choices
//         $("#playerOneRPS").html("<p class = RPS>Rock</p>" + "<p class = RPS>Paper</p>" + "<p class = RPS>Scissors</p>");
//         $("#playerTwoRPS").html("<p class = RPS>Rock</p>" + "<p class = RPS>Paper</p>" + "<p class = RPS>Scissors</p>");
//     }
//     else {
//         $("#playerOneRPS").empty();
//         $("#playerTwoRPS").empty();
//     }
// });

// Check firebase for user choices
database.ref().on("value", function (snapshot) {
    let player1HasChosen = snapshot.child("choices/player1Choices/playerChoice");
    console.log(player1HasChosen.val() + " player1 choice");
    
    let player2HasChosen = snapshot.child("choices/player2Choices/playerChoice");
    console.log(player2HasChosen.val() + " player2 choice");
    
    // Display each players choice in the arena div
    if ((snapshot.child("choices/player1Choices/playerChoice").exists()) && (snapshot.child("choices/player2Choices/playerChoice").exists())) {
        
        $("#playerOneRPS").html(`<h2>${player1HasChosen.val()}</h2>`);
        $("#playerTwoRPS").html(`<h2>${player2HasChosen.val()}</h2>`);
        
        // Determine winner/loser/tie
        if (player1HasChosen.val() === player2HasChosen.val()) {
            
            console.log("values equal it is a tie");
            $("#arena").html(`<h2> TIE </h2>`);
            
            setTimeout(function () {
                updatePlayer1HasChosen();
                updatePlayer2HasChosen();
                $("#arena").empty();
            }, 2000)
        }
        else if ((player1HasChosen.val() === "Rock" && player2HasChosen.val() === "Scissors" ) || (player1HasChosen.val() === "Scissors" && player2HasChosen.val() === "Paper") || (player1HasChosen.val() === "Paper" && player2HasChosen.val() === "Rock" )) {
            
            console.log("player 1 wins");
            $("#arena").html(`<h2> ${snapshot.child("players").child("1/name").val()} Has Won!</h2>`);
            
            setTimeout(function () {
                updatePlayer1HasChosen();
                updatePlayer2HasChosen();
                $("#arena").empty();
            }, 2000)
        }
        else {
            console.log("player 2 wins");
            $("#arena").html(`<h2> ${snapshot.child("players").child("2/name").val()} Has Won!</h2>`);
            
            setTimeout(function () {
                updatePlayer1HasChosen();
                updatePlayer2HasChosen();
                $("#arena").empty();
            }, 2000)
        }
    }
});

function updatePlayer1() {
    database.ref("players/player1").set(null);
    playerCount = 0;
}

function updatePlayer1HasChosen() {
    database.ref().child("choices/player1Choices/playerChoice").set({
        playerChoice: null
    });
    $("#playerOneRPS").empty().append("<p class = RPS>Rock</p>" + "<p class = RPS>Paper </p>" + "<p class = RPS>Scissors</p>");
}

function updatePlayer2() {
    database.ref("players/player2").set(null);
    // playerCount = 1;
}

function updatePlayer2HasChosen() {
    database.ref().child("choices/player2Choices/playerChoice").set({
        playerChoice: null
    });
    $("#playerTwoRPS").empty().append("<p class = RPS>Rock</p>" + "<p class = RPS>Paper </p>" + "<p class = RPS>Scissors</p>");
}

function listenForMessage() {
    messageRef.on("child_added", function (snapshot) {
        let msg = $(`<p>${snapshot.child("text").val()}</p>`);
        console.log("this is msg " + msg);
        $("#chatBox").append(msg);
    });
}

function clearMessages() {
    messageRef.remove();
}


// Function to get in the game
function getInGame() {
    
    // For adding disconnects to the chat with a unique id (the date/time the user entered the game)
    // Needed because Firebase's '.push()' creates its unique keys client side,
    // so you can't ".push()" in a ".onDisconnect"
    let chatDataDisc = database.ref("/chat/" + Date.now());
    
    // Checks for current players, if theres a player one connected, then the user becomes player 2.
    // If there is no player one, then the user becomes player 1
    if (currentPlayers < 2) {
        
        if (playerOneExists) {
            playerNum = 2;
        }
        else {
            playerNum = 1;
        }
        
        // Creates key based on assigned player number
        playerRef = database.ref("/players/" + playerNum);
        
        // Creates player object. 'choice' is unnecessary here, but I left it in to be as complete as possible
        playerRef.set({
            name: player,
            wins: 0,
            losses: 0,
            choice: null
        });
        
        // On disconnect remove this user's player object
        playerRef.onDisconnect().remove();
        
        // Send disconnect message to chat with Firebase server generated timestamp and id of '0' to denote system message
        chatDataDisc.onDisconnect().set({
            name: player,
            time: firebase.database.ServerValue.TIMESTAMP,
            message: "has disconnected.",
            idNum: 0
        });
        
        // // Remove name input box and show current player number.
        // $("#swap-zone").html("<h2>Hi " + username + "! You are Player " + playerNum + "</h2>");
    }
    else {
        
        // If current players is "2", will not allow the player to join
        alert("Sorry, Game Full! Try Again Later!");
    }
}



$(document).ready( function() {
    clearMessages();
});

listenForMessage();



