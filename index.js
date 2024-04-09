import wordBank from "./word-bank.js";
import prompt from "readline-sync";
prompt.setDefaultOptions({ caseSensitive: false });

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
	//Creates a variable to store an upper-case version of the player's answer. Then if it perfectly matches the secret word, the game ends.
	let ansComp = gData.playerAns.toLocaleUpperCase();
	let isWordMatch = gData.secret === ansComp;

	if (!gData.isNew) {
		console.log(`Oops! You've already guessed "${gameData.playerAns}"!`);
		return render(gData, matrix);
	}

	// If it's a new guess, it's added to gData.oldAns. Then a copy of the secret word is turned into an array searched for a letter matching the player's answer.
	else if (gData.isNew) {
		// If player guesses correct word as a string, game ends immediately.
		if (isWordMatch) {
			gData.hasWon = true;
			return render(gData, matrix);
		}

		const secretArray = structuredClone(gData.secret.split(""));
		gData.isCorrect = secretArray.includes(ansComp);
		// If there is no match, then the map case changes and the number of incorrect guesses left reduces.
		if (!gData.isCorrect) {
			console.log(`Sorry, but "${gData.playerAns}" isn't part the word!`);
			gData.ansInc += 1;
		}

		// If there is a match, then for each index value of the secret word that matches in the final answer that is still "_", gData.finalAns[index] is overwritten to reflect the new information.
		else if (gData.isCorrect) {
			let i = 0;
			console.log(`Yes! "${gData.playerAns}" is part the word!`);
			for (let index of secretArray) {
				if (index.includes(ansComp) && gData.finalAns[i] === "_") {
					gData.finalAns[i] = gData.playerAns;
				}
				i++;
			}
		}
		let finalComp = gData.finalAns.join("").toLocaleUpperCase();
		//This checks whether each letter in the secret word has been guessed correctly. If so, game
		if (finalComp === gData.secret) {
			gData.hasWon = true;
		}
		gData.oldAns.push(gData.playerAns);

		return render(gData, matrix);
	}
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
			console.log(`\n\n... I've no idea how you broke my render iteration code, but I haven't crashed yet, \nso let's pretend nothing ever happened, okay?\n\n`);
	}

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
	console.log(`Previous Guesses: ${gData.oldAns.join(" ")}`);
	// If the round is over, this isn't necessary.
	let tempTries = 6 - gData.ansInc;
	if (gameState.isGuessing) {
		if (tempTries !== 1) {
			console.log(`You can guess incorrectly ${tempTries} more times.`);
		} else {
			console.log(`You can guess incorrectly ${tempTries} more time.`);
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
}; // Game loop doesn't end even if gameState.isGuessing = false. This is likely because the finalAns filling code- or much of the parser- is setting flags correctly.

// Asks if the user wants to start the game. If yes, then the game will run. If not, the game will run the shutdown script.
console.log(
	`\n∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎\n\n Welcome to the Hangman Guessing Game!\n---------------------------------------\n\nPress CTRL+C to stop at any time.\n∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎\n\n`
);

// Asks the user if they want to play the game. If so, the gameState.isPlaying while loop runs until the user decides to stop
let startGame = prompt.question(`Would you like to start the game? Y/N:\n`, { limit: ["y", "n"], limitMessage: `I asked for "Y" or "N":\n`, trueValue: ["y"], falseValue: ["n"] });
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
			limitMessage: "\nOops! That's not a valid guess.",
		});
		console.log(`\n`);
		let hasAnsUp = gameData.oldAns.includes(gameData.playerAns.toLocaleUpperCase());
		let hasAnsDown = gameData.oldAns.includes(gameData.playerAns.toLocaleLowerCase());

		if (hasAnsUp || hasAnsDown) {
			gameData.isNew = false;
		} else {
			gameData.isNew = true;
		}

		parseAns(gameData, gallows, drawGame);
	}

	// If the round is over, this will ask the player if they want to play again. If they do,
	if (!gameState.isGuessing) {
		console.log(`Wins: ${playerStat.win} | Losses: ${playerStat.loss} \n`);
		let newGame = prompt.question(`Would you like to play again? Y/N:\n`, {
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
				prompt.question(
					`\n################\n\nFinal Stats: \n  Total Rounds: ${playerStat.rounds}\n  Wins: ${playerStat.win}\n  Losses: ${playerStat.loss}\n  Win %: ${percentRound}%\n\n################\nThanks for playing!\n\nPress the "any" key to exit: `
				);
				break;
		}
	}
}
