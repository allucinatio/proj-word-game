// What will I need and why?
// express -- installed
const express = require('express');
const path = require('path');
// mustache express
const mustache = require('mustache-express');
// fs for the words -- installed
// words will hold the word bank
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
// morgan to log routes -- installed
const morgan = require('morgan');
// express-session to make a session happen -- installed
const session = require('express-session');
// body-parser to handle req.body
const bodyParser = require('body-parser');
// express-validator to check the user input
// https://newline.theironyard.com/cohorts/6/courses/5/req.sessionective_lessons/47
const expressValidator = require('express-validator');
const app = express();

app.engine('mustache',mustache())
app.set('view engine','mustache')
app.set('views',['./views','./views/admin'])

app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: 'ironyard',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(morgan('combined'));

// var req.session = new req.sessionect();

var start = true;
// displays on page


// req.session.word = getRandomWord();

// how will I be using routers?
// only for hard mode

// When a user that is not in a current game arrives at your root page, your app must select a word at random from the list of words in the file
  // there are 235887 array items

function gameSetup(req){
  req.session.solutionArray = [];
  // array of each character in the random word
  req.session.playerArray = [];
  // array of "_"s and guesses that match req.session.solutionArray
  req.session.playerStatus = "";
  // ^ req.session.status
  // ^ turns req.session.playerArray into a string without ","s, displays on page
  req.session.lettersGuessed = "";
  // ^ req.session.guesses
  // ^ stores each guess, displays on page
  req.session.matchIndex = [];
  // ^ indexes of matches between req.session.solutionArray and user's req.body.letter
  req.session.wasMatch = false;
  req.session.word = getRandomWord();
  console.log("Our word is: " + req.session.word);
  makeArrays(req);
  console.log("User guesses array: " + req.session.playerArray);
  console.log("Solution array: " + req.session.solutionArray);
};

function getRandomWord(){
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  return words[getRandomInt(0, 235887)];
};

// Store the word the user is trying to guess in a session.

function makeArrays(req){
  req.session.solutionArray = Array.from(req.session.word);
  req.session.playerArray = req.session.solutionArray.map(function(x) {
    return x = "_";
  });
};

// On the page, show the number of letters in the word like so:
// _ _ _ _ _ _ _
    // display each element of the array, which should all be _

function currentGuesses(req){
  req.session.playerStatus = req.session.playerArray.join(" ");
  if (req.session.solutionArray.join(" ") === req.session.playerArray.join(" ")) {
    playerWin(req);
  };
  if (req.session.wasMatch === false) {
    req.session.turns -= 1;
  }
};

function processLetter(req, res){
  req.session.wasMatch = false;
  req.session.matchIndex = {};
  console.log("The player guessed: " + req.body.letter);
  // check if guess has already been guessed

  req.session.lettersGuessed += req.body.letter + ", ";
  req.session.guesses = req.session.lettersGuessed;
  // reset the index of matches
  req.session.matchIndex = [];
  // get index from req.session.solutionArray of matches to req.body.letter
  req.session.solutionArray.forEach(function(element, index){
    if (element === req.body.letter) {
      req.session.matchIndex.push(index);
    }
  });

  // push req.body.letter to the matching indexes in req.session.playerStatus
  // index is for solutionArray, i is for req.session.playerStatus
  // req.session.solutionArray[index] is each letter and its index

  console.log("req.session.matchIndex: " + req.session.matchIndex);
  req.session.solutionArray.forEach(function(element, index){
    for (var i = 0; i < req.session.matchIndex.length; i++) {
      let tempIndex = req.session.matchIndex[i];
      if (req.session.solutionArray[index] === req.session.solutionArray[tempIndex]){
        req.session.wasMatch = true;
        console.log("Matching pair!! " + req.session.wasMatch);
        // replace the _ in req.session.playerArray with the character from req.session.solutionArray[tempIndex] at req.session.solutionArray[index]
        req.session.playerArray.splice(index, 1, req.session.solutionArray[tempIndex]);
      }
    }
  });
  // if (req.session.wasMatch === true) {
  //   console.log("There was a match, and req.session.wasMatch is "+req.session.wasMatch);
  // } else if (req.session.wasMatch === false) {
  //   console.log("There were no matches, and req.session.wasMatch is "+req.session.wasMatch);
  // }
  console.log("findIndex of player's guess: " + req.session.matchIndex);
  console.log("String of player's guesses: " + req.session.lettersGuessed);
};



// "If the user guesses the same letter twice, do not take away a guess. Instead, display a message letting them know they've already guessed that letter and ask them to try again."
  // come back to this once you've set up the code for the above
  // check the user's guess array for the guessed character and trigger the error if there's a match

// "The game should end when the user constructs the full word or runs out of guesses. If the player runs out of guesses, reveal the word to the user when the game ends."
    // check the answer array against the guess array, a win happens if they match
    // check the guesses count, if it reaches 0, end the game and switch out the guesses & _s with the word array


function gameOver(req){
  console.log("Lose!");

  playAgain(req);
};

function playerWin(req){
  console.log("Win!")
  playAgain(req);
};

// "When a game ends, ask the user if they want to play again. The game begins again if they reply positively."
  //

function playAgain(req){

};

app.get('/', function(req, res){
  if (start === true){
   start = false;
   req.session.turns = 9;

   gameSetup(req);
  }
  console.log("Turns is now: " + req.session.turns);
  if (req.session.turns >= 0) {
    currentGuesses(req);
  } else {
    gameOver(req);
  }
  console.log("Current player status: " + req.session.playerStatus);
  res.render('index', { game : req.session });
});


// "Ask the user to supply one guess (i.e. letter) at a time, using a form. This form should be validated to make sure only 1 letter is sent. This letter can be upper or lower case and it should not matter. If a user enters more than one letter, tell them the input is invalid and let them try again."
  // use express validator to make sure only 1 letter is sent, return an error or something if the input is invalid


app.post('/', function(req, res){
  req.checkBody("letter", "You must enter one letter, a-z").isAlpha();
  var errors = req.validationErrors();
  // need to still figure out validation
    if (errors) {
      var html = errors;
      res.send(html);
    } else {
      req.session.wasMatch = false;
      processLetter(req, res);
    }
  console.log(req.session);
  res.redirect('/');
});


app.listen(3000, function () {
  console.log('App listening on port 3000!')
});
