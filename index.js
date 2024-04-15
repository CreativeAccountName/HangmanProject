import wordBank from "./word-bank.js";
import prompt from "readline-sync";
//prompt.setDefaultOptions({ caseSensitive: false });

let playerStat = { win: 0, loss: 0, rounds: 0 }; // Creates a global object that keeps track of wins and losses.
let gameState = { isPlaying: true, isGuessing: false }; // Creates a global object that keeps track of the player's wins and losses.

// Initializes and stores the initial board state.
const boardSetup = () => {
	// Default board state. Initialized in this way so gallows can be iterated upon without losing access to this state or rebuilding the matrix elsewhere.
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

	// Creates a copy of the secret word, splits it into an array of strings, and creates an array with placeholder underscores to display partially filled in text as players guess letters correctly.
	gData.finalAns = structuredClone(gData.secret).split("");

	// Now that this array is the same length as the secret word, underscores replace its values so it can be drawn to the board after each guess is checked.
	gData.finalAns.forEach((value, index) => {
		if (value !== "_") gData.finalAns[index] = "_";
	});
	return gData;
};

// Creates a global object that holds data related to the current round. setup() parameters include the "wordBank" array and a callback to the "fetchRandom" function, which returns a random index value from wordBank.
let gameData = setup(wordBank, fetchRandom);

//Parses player input.
const parseAns = (gData, matrix, render) => {
	//Creates a variable to store an upper-case version of the player's answer. Then if it matches the secret word, the game ends with the player win condition triggered. Currently, the only input accepted outside of letters of the alphabet is the secret word because of how the limit option functions in readline-sync.
	let ansComp = gData.playerAns.toLocaleUpperCase();
	let isWordMatch = gData.secret === ansComp;

	if (!gData.isNew) {
		console.log(`Oops! You've already guessed "${gameData.playerAns}"!`);
		return render(gData, matrix);
	}

	// If it's a new guess, then a copy of the secret word is turned into an array searched for a letter matching the player's answer.
	else if (gData.isNew) {
		// If player guesses the word as a string, the game ends immediately.
		if (isWordMatch) {
			gData.hasWon = true;
			return render(gData, matrix);
		}

		//Otherwise, the guess is added to gData.oldAns, a new array is built based on the secret word, and then the new array is searched for any matches to the player's guess.
		const secretArray = structuredClone(gData.secret.split(""));
		gData.isCorrect = secretArray.includes(ansComp);
		// If there is no match, then the map case changes, the remaining number of incorrect guesses reduces, and the player is informed that their guess was incorrect.
		if (!gData.isCorrect) {
			console.log(`Sorry! The word doesn't contain "${gData.playerAns}".`);
			gData.ansInc += 1;
		}

		// If there is a match, then for each index value of the secret word that matches the final answer that is still "_", gData.finalAns[index] is overwritten to reflect the new information.
		else if (gData.isCorrect) {
			let i = 0;
			console.log(`Yes! The word contains "${gData.playerAns}"!`);
			for (let index of secretArray) {
				if (index.includes(ansComp) && gData.finalAns[i] === "_") {
					gData.finalAns[i] = gData.playerAns;
				}
				i++;
			}
		}
		let finalComp = gData.finalAns.join("").toLocaleUpperCase();

		//This checks whether each letter in the secret word has been guessed correctly. If so, game ends immediately with the player win condition triggered.
		if (finalComp === gData.secret) {
			gData.hasWon = true;
		}
		gData.oldAns.push(gData.playerAns);

		return render(gData, matrix);
	}
};

// Takes the original graphics matrix and gameData, then makes changes before joining and drawing a deep copy version based on that initial matrix layout.
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
			break;
		case 7:
			matrix[3][7] = " ";
			matrix[4][7] = "/";
			matrix[3][9] = " ";
			matrix[4][9] = "\\";
			matrix[5][7] = " ";
			matrix[5][8] = "‖";
			matrix[5][9] = " ";
			gData.hasLost = true;
			break;
		default:
			console.log(`\n\n... I've no idea how you broke my render iteration code, but I haven't crashed yet, \nso let's pretend nothing ever happened, okay?\n\n`);
	}

	// If the parser function flagged that the player has won or lost the game, one of these will run to display the end state and end the isGuessing loop. In each case, two nested arrays in the matrix are replaced.
	if (gData.hasWon) {
		playerStat.win += 1;
		gameState.isGuessing = false;
		matrix.splice(
			8,
			2,
			[" ", " ", " ", "|", " ", "G", "A", "M", "E", " ", "O", "V", "E", "R", " ", "|", " ", " ", " "],
			[" ", " ", " ", "|", " ", "Y", "O", "U", " ", "W", "I", "N", "!", " ", " ", "|", " ", " ", " "]
		);
	} else if (gData.hasLost) {
		playerStat.loss += 1;
		gameState.isGuessing = false;
		matrix.splice(
			8,
			2,
			[" ", " ", " ", "|", " ", "G", "A", "M", "E", " ", "O", "V", "E", "R", " ", "|", " ", " ", " "],
			[" ", " ", " ", "|", " ", "Y", "O", "U", " ", "L", "O", "S", "E", "!", " ", "|", " ", " ", " "]
		);
	}

	let matMap = matrix.map((index) => index.join("")).join("\n"); // Turns a copy of the matrix into a string that draws each former nested array on a new line.
	console.log(`\n${matMap}\n    ${gData.finalAns.join(" ")}\n\n`); // Draws the gallows and displays the current final answer status.
	console.log(`Previous Guesses: ${gData.oldAns.join(" ")}`);

	// If the player guessed incorrectly for the last time, then gameState.isGuessing will have been set to false before it was passed here by the parser function. If that happens, then tempTries will never initialize, and the player will not be informed how many more times they can incorrectly guess before they lose.
	if (gameState.isGuessing) {
		let tempTries = 6 - gData.ansInc; // Used to determine whether to use singular or plural case in the remaining tries message.

		if (tempTries === 6) {
			console.log(`You can guess incorrectly a total of 6 times.`);
		} else if (6 > tempTries && tempTries > 1) {
			console.log(`You can guess incorrectly ${tempTries} more times.`);
		} else if (tempTries === 1) {
			console.log(`You can guess incorrectly ${tempTries} more time.`);
		} else {
			console.log(`Careful! You have ${tempTries} incorrect guesses left!`);
		}
	}

	//Win and loss messages.
	if (gData.hasWon) {
		console.log(`Congrats, you've won! The word was "${gData.secret}".`);
	}
	if (gData.hasLost) {
		console.log(`Sorry, you've lost. The word was "${gData.secret}".`);
	}

	return gData;
};

// Asks if the user wants to start the game. If yes, then the game will run. If not, the game will run the shutdown script.
console.log(
	`\n∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎\n\n\n\n\n\n\n Welcome to the Hangman Guessing Game!\n---------------------------------------\n\nPress CTRL+C to stop at any time.\n\n\n\n\n\n∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎\n\n`
);

// Asks the user if they want to play the game. If so, the gameState.isPlaying while loop runs until the user decides to stop
let startGame = prompt.question(`Would you like to start the game? Y/N: `, { limit: ["y", "n"], limitMessage: `I asked for "Y" or "N": `, trueValue: ["y"], falseValue: ["n"] });
if (startGame === true) {
	gameState.isGuessing = true;
} else if (startGame === false) {
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
	while (gameState.isGuessing) {
		gameData.playerAns = prompt.question(`Guess a letter: `, {
			limit: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", `${gameData.secret}`],
			limitMessage: "\nSorry, I didn't quite catch that. Could you try something else? ",
		});
		console.log(`\n`); // Here for formatting purposes.

		// Creates uppercase and lowercase variable strings based on the players' answer, then checks gameData.oldAns for both upper and lowercase versions already included in the array.
		let hasAnsUp = gameData.oldAns.includes(gameData.playerAns.toLocaleUpperCase());
		let hasAnsDown = gameData.oldAns.includes(gameData.playerAns.toLocaleLowerCase());

		// If there is a match from either string variable, gameData.isNew is set to true, and duplicate answers will not count against the player nor will they be considered when it's time to draw the game again.
		if (hasAnsUp || hasAnsDown) {
			gameData.isNew = false;
		} else {
			gameData.isNew = true;
		}

		parseAns(gameData, gallows, drawGame);
	}

	// If the round is over, this will ask the player if they want to play again and display the number of rounds they've won and lost. If they do, gameData will be reset with a new secret word, the gallows matrix will be reset, and the gameState.isGuessing boolean will be set to true. Otherwise, the player will be shown a final stats page with an exit message, which they can linger on until they hit a key to exit the program.
	if (!gameState.isGuessing) {
		console.log(`Wins: ${playerStat.win} | Losses: ${playerStat.loss} \n`);
		let newGame = prompt.question(`Would you like to play again? Y/N: `, {
			limit: ["Y", "N"],
			limitMessage: `I asked for "Y" or "N":\n`,
			trueValue: ["y"],
			falseValue: ["n"],
		});

		switch (newGame) {
			case true:
				gameData = setup(wordBank, fetchRandom);
				gameState.isGuessing = true;
				break;
			case false:
				gameState.isPlaying = false;
				let winPercent = (playerStat.win / playerStat.rounds) * 100;
				let percentRound = Number(winPercent.toFixed(4));
				prompt.keyInPause(
					`\n################\n\nFinal Stats: \n  Total Rounds: ${playerStat.rounds}\n  Wins: ${playerStat.win}\n  Losses: ${playerStat.loss}\n  Win %: ${percentRound}%\n\n################\nThanks for playing!\n\nPress the "any" key to exit: `,
					{ hideEchoBack: true, mask: " ", defaultInput: " " }
				);
				break;
		}
	}
}
