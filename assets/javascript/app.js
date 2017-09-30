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
const playersRef = database.ref("players");
const messageRef = database.ref("/messages");
let player;
let playerCount = 0;
let player1;
let player2;

// Check for connected players
const connectedRef = firebase.database().ref(".info/connected");
connectedRef.on("value", function (snap) {
    if (snap.val() === true) {
        console.log("connected");
        
        const con = connectionsRef.push(true);
        con.onDisconnect().remove();
      
        updatePlayer1();
        updatePlayer2();
        clearMessages();
    }
});

//session storage
//store each player's data in their own session
//convert to string


$("#start").on("click", function () {
    event.preventDefault();
    player = $("#playerName").val().trim();
    addPlayer();
    console.log(player);
    $("#playerName").val("");
    
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


//decide who is player1 or player2 by date added. earliest is player 1
database.ref("players").orderByChild("dateAdded").on("value", function (snapshot) {
    let sv = snapshot.val();
    console.log(sv);
    console.log("this is in the fiirst database ref before displaying RPS");
    $("#playerOneName").text(snapshot.child("player1/name").val());
    $("#playerTwoName").text(snapshot.child("player2/name").val());
    
    // player1 = snapshot.child("player1/name").val();
    // player2 = snapshot.child("player2/name").val();
    
    // Wait until two players are logged in
    if ((snapshot.child("player1/name").val() !== null) && (snapshot.child("player2/name").val() !== null)) {
        // Display rock paper sicscor choices
        $("#playerOneRPS").html("<p class = RPS>Rock</p>" + "<p class = RPS>Paper</p>" + "<p class = RPS>Scissors</p>");
        $("#playerTwoRPS").html("<p class = RPS>Rock</p>" + "<p class = RPS>Paper</p>" + "<p class = RPS>Scissors</p>");
    }
    else {
        $("#playerOneRPS").empty();
        $("#playerTwoRPS").empty();
    }
});

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
            $("#arena").html(`<h2> ${snapshot.child("players").child("player1/name").val()} Has Won!</h2>`);
            
            setTimeout(function () {
                updatePlayer1HasChosen();
                updatePlayer2HasChosen();
                $("#arena").empty();
            }, 2000)
        }
        else {
            console.log("player 2 wins");
            $("#arena").html(`<h2> ${snapshot.child("players").child("player2/name").val()} Has Won!</h2>`);
            
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

function addPlayer() {
    playersRef.once("value").then(function (snapshot) {
        console.log(snapshot.numChildren());
        if (snapshot.numChildren() === 0) {
            //increases playerCount so next player will be player 1
            playerCount++;
            console.log(playerCount);
            
            database.ref("/players/player1").set({
                name: player,
                onlineStatus: false,
                // connectedKey: database.ref("/connections").child().key,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });
        }
        else if (snapshot.numChildren() === 1) {
            //increases playerCount so it will be 2
            playerCount++;
            console.log(playerCount);
            
            database.ref("/players/player2").set({
                name: player,
                onlineStatus: false,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });
        }
    })
}

listenForMessage();

// sessionStorage.clear();
//
// if (playerCount === 0) {
//
// }
// else {
//
// }

// $("#playerOneName").text(sessionStorage.getItem("player1"));
// $("#playerTwoName").text(sessionStorage.getItem("player2"));

