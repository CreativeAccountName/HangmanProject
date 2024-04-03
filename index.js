import wordBank from "./word-bank.js";
import prompt from "readline-sync";

let playerStat = { win: 0, loss: 0, rounds: 0 }; // creates a global object that keeps track of wins and losses.
let gameState = { isPlaying: true, isGuessing: false }; //could roll gameStats into this directly, honestly
// let gallows = []; // Array that will eventually hold the current board state.

//Initializes and stores the initial board state.
const boardSetup = () => {
	//Default board state. Initialized in this way so gallows can be iterated upon without losing access to this state or rebuilding the matrix elsewhere.
	const matrix = [
		[" ", " ", " ", " ", " ", " ", " ", " ", "#", "=", "=", "=", "=", "|", " ", " ", " ", " ", " "],
		[" ", " ", " ", " ", " ", " ", " ", " ", "|", " ", "\\", " ", " ", "|", " ", " ", " ", " ", " "],
		[" ", " ", " ", " ", " ", " ", " ", " ", "|", " ", " ", "\\", " ", "|", " ", " ", " ", " ", " "],
		[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "\\", "|", " ", " ", " ", " ", " "],
		[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "|", " ", " ", " ", " ", " "],
		[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "|", " ", " ", " ", " ", " "],
		[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "|", " ", " ", " ", " ", " "],
		[" ", " ", " ", "|", "=", "=", "=", "=", "=", "=", "=", "=", "=", "=", "=", "|", " ", " ", " "],
		[" ", " ", " ", "|", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "|", " ", " ", " "],
		[" ", " ", " ", "|", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "|", " ", " ", " "],
		[" ", " ", " ", "|", "=", "=", "=", "=", "=", "=", "=", "=", "=", "=", "=", "|", " ", " ", " "],
	];
	return matrix;
};
// Creates and stores a matrix that functions as the current board state.
let gallows = boardSetup();

// Pulls a random word from the imported wordBank array.
const fetchRandom = (array) => {
	let min = 0;
	let max = array.length - 1;
	let index = Math.floor(Math.random() * (max - min + 1) + min);
	return array[index].toUpperCase();
};

// Define parameters used for each round.
const setup = (bank, fetch) => {
	let gData = {
		playerAns: "", // Should always either be one letter of the alphabet OR the correct word. Anything else should be rejected.
		isCorrect: false, // If this is false, the draw function will iterate its switch case checker variable by one (up to 6) add a add a body part to the gallows.
		isNew: true, // If this is false, the answer parser should throw an error, return nothing, and prevent the parser from collecting the answer or penalizing the player.
		ansInc: 0, // Value determines how the game board is rendered. The higher the number, the fewer guesses remaining.
		secret: `${fetch(bank)}`, // Calls the random word generator.
		oldAns: [], // Collects all of the letters previously guessed for the round.
		finalAns: [], // An array that displays correctly guessed letters in their proper position in the secret word.
		hasWon: false, // Boolean that, when true, lets the code execute the win condition code.
		hasLost: false, // As hasWon, but for when the player loses the round.
	};

	//Creates a copy of the secret word, splits it into an array of strings, and creates an array with placeholder underscores to display partially filled in text as players guess letters correctly.
	gData.finalAns = structuredClone(gData.secret).split("");

	// Now that this array is the same length as the secret word, underscores replace its values so it can be drawn to the board after each guess is checked.
	gData.finalAns.forEach((value, index) => {
		if (value !== "_") gData.finalAns[index] = "_";
	});

	//use the function that takes a string and creates a new array out of the string variable;
	return gData;
};

// Creates a global object that holds data related to the current round. setup() parameters include the "wordBank" array and a callback to the "fetchRandom" function, which returns a random index value from wordBank.
let gameData = setup(wordBank, fetchRandom);

//Parses player input.
const parseAns = (gData, matrix, render) => {
	// If player guesses correct word as a string, game ends immediately.
	if (gData.playerAns === gData.secret) {
		gData.hasWon = true;
		return render(gData, matrix);
	}

	// If this is true, then the checker continues. Otherwise, the player will receive an error and asked for another answer they haven't yet given.
	gData.isNew = !gData.oldAns.includes(gData.playerAns);
	// Checks whether player just repeated a previous guess.

	if (!gData.isNew) {
		console.log(`Oops! You've already guessed "${gData.playerAns}"!`);
		return render(gData, matrix);
	}

	// If it's a new guess, it's added to gData.oldAns. Then a copy of the secret word is turned into an array searched for a letter matching the player's answer.
	else if (gData.isNew) {
		const secretArray = structuredClone(gData.secret.split(""));
		gData.isCorrect = secretArray.includes(gData.playerAns);
		// If there is no match, then the map case changes and the number of incorrect guesses left reduces.
		if (!gData.isCorrect) {
			console.log(`Sorry, but ${gData.playerAns} isn't part the word!`);
			gData.ansInc += 1;
		}

		// If there is a match, then for each index value of the secret word that matches in the final answer that isn't already changed, gData.finalAns[index] is overwritten to reflect the new information.
		else if (gData.isCorrect) {
			let i = 0;
			for (let index of secretArray) {
				if (index.includes(gData.playerAns) && gData.finalAns[i] === "_") {
					gData.finalAns[i] = index;
				}
				i++;
			}
		}

		//This checks whether each letter in the secret word has been guessed correctly. If so, game
		if (gData.finalAns.join("") === gData.secret) {
			gData.hasWon = true;
		}
		gData.oldAns.push(gData.playerAns);
	} // end of if gData.isNew
	return render(gData, matrix);
};

// Takes the original graphics and gameData, then makes changes before drawing a deep copy version based on
const drawGame = (gData, matrix) => {
	// Changes the appearance of the gallows based on the number of incorrect guesses made by the player.
	switch (gData.ansInc) {
		case 0: // This should still be the default board state.
			break;
		case 1:
			matrix[3][8] = "O";
			break;
		case 2:
			matrix[4][8] = "|";
			break;
		case 3:
			matrix[5][9] = "\\";
			break;
		case 4:
			matrix[5][7] = "/";
			break;
		case 5:
			matrix[3][9] = "/";
			break;
		case 6:
			matrix[3][7] = "\\";
			gData.hasLost = true;
			break;
		default:
			console.log(`\n\n... I've no idea how you broke my render iteration code, but I haven't crashed yet, \nso let's pretend nothing ever happened, okay?\n`);
	}

	console.log(`Previous Guesses: ${gData.oldAns.join(" ")}`);

	// If the parser function flagged that the player has won or lost the game, one of these will run to display the end state and end the isGuessing loop.
	if (gData.hasWon) {
		playerStat.win += 1;
		gameState.isGuessing = false;
		matrix.splice(
			8,
			2,
			[" ", " ", " ", "|", " ", "G", "A", "M", "E", " ", "O", "V", "E", "R", " ", "|", " ", " ", " "],
			[" ", " ", " ", "|", " ", "Y", "O", "U", " ", "W", "I", "N", "!", " ", " ", "|", " ", " ", " "]
		);
		// matrix.splice(10, 1, [" ", " ", " ", "|", " ", " ", "Y", "O", "U", " ", "W", "I", "N", " ", " ", "|", " ", " ", " "]);
	} else if (gData.hasLost) {
		playerStat.loss += 1;
		gameState.isGuessing = false;
		matrix.splice(
			8,
			2,
			[" ", " ", " ", "|", " ", "G", "A", "M", "E", " ", "O", "V", "E", "R", " ", "|", " ", " ", " "],
			[" ", " ", " ", "|", " ", "Y", "O", "U", " ", "L", "O", "S", "E", "!", " ", "|", " ", " ", " "]
		);
		// matrix.splice(10, 1, [" ", " ", " ", "|", " ", " ", "Y", "O", "O", " ", "L", "O", "S", "E", " ", "|", " ", " ", " "]);
	}

	let matMap = matrix.map((index) => index.join("")).join("\n"); // Turns a copy of the matrix into a string that draws each former nested array on a new line.
	console.log(`\n${matMap}\n    ${gData.finalAns.join(" ")}\n\n`); // Draws the gallows and displays the current final answer status.

	// If the round is over, this isn't necessary.
	let tempTries = 6 - gData.ansInc;
	if (gameState.isGuessing) {
		console.log(`You can guess incorrectly ${tempTries} more time(s).`);
	}

	return gData;
}; // Game loop doesn't end even if gameState.isGuessing = false. This is likely because the finalAns filling code- or much of the parser- is setting flags correctly.

console.log(`Welcome to the Hangman Guessing Game! Press CTRL+C to stop at any time.\n\n`);
let rawStart = prompt.question(`Would you like to start the game? Y/N: `, { limit: ["Y", "N"], limitMessage: `Just "Y" or "N," please.` });
let startGame = rawStart.toUpperCase();
if (startGame === "Y") {
	gameState.isGuessing = true;
} else if (startGame === "N") {
	gameState.isPlaying = false;
	console.log(`Common mistake. Have a good day!`);
}
// Keeps the program active. When the player decides they don't want to play again, the cycle is broken. Then they are given final statistics for the session,a message of gratitude for playing the game, and the program ends.
while (gameState.isPlaying) {
	//Renders the initial game screen.
	playerStat.rounds++;
	gallows = boardSetup();
	drawGame(gameData, gallows);

	// Keeps the player in the game loop for the round until they either run out of guesses or complete the word.
	// Note: if time allows, maybe add a limit option to the answer prompt that's an exact match for the secret word? THat would improve the gameplay.
	while (gameState.isGuessing) {
		let rawGuess = prompt.question(`Guess a letter: `, {
			//prettier-ignore
			limit: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",`${gameData.secret}`],
			limitMessage: "Oops! That's not a valid guess. Please try again.",
		});
		gameData.playerAns = rawGuess.toUpperCase();
		// console.clear(); <= Try using this if you want to clean things up a bit. It should clear the console after the player input is accepted
		parseAns(gameData, gallows, drawGame);
	}

	// If the round is over, this will ask the player if they want to play again. If they do,
	if (!gameState.isGuessing) {
		console.log(`Wins: ${playerStat.win} | Losses: ${playerStat.loss} \n`);
		let rawNew = prompt.question(`Would you like to play again? Y/N: `, {
			limit: ["Y", "N"],
		});
		let newGame = rawNew.toUpperCase();

		switch (newGame) {
			case "Y":
				gameData = setup(wordBank, fetchRandom);
				gameState.isGuessing = true;
				break;
			case "N":
				gameState.isPlaying = false;
				let winPercent = (playerStat.win / playerStat.rounds) * 100;
				let percentRound = Number(winPercent.toFixed(4));
				prompt.question(
					`\n################\n\nFinal Stats: \n  Total Rounds: ${playerStat.rounds}\n  Wins: ${playerStat.win}\n  Losses: ${playerStat.loss}\n  Win %: ${percentRound}%\n\n################\n\nThanks for playing!\n Press the any key to exit.`
				);
				break;
		}
	}
}

//Still requires: loop for the full game;
//-Welcome Message //

//-loop for each session; // Yup!

//-answer parser function; // Maybe done

//-graphics function that changes the image based on number of incorrect guesses and checks whether the user won or lost or already guessed that character or guessed an invalid character. If they won or lost, add 1 to the appropriate tally, inform them of the end condition, and prompt them to hit enter to continue before tossing them to the play again prompt.

//-Check to see if player wants to go again, where a yes resets the gameData and gameState objects and run the game again. Or, if not, close the program with a goodbye message. ----I think I got this done
