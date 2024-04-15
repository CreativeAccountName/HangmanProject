# Hangman

Hangman is a game developed for the Spring 2024 Javascript Fundamentals course from CanCode.

# Installation

1. Download the repository or create a fork of your own and then clone the fork.
2. Open in or navigate to the repository's root folder in your preferred terminal interface.
3. In your terminal, enter the following command to add node.js functionality your local copy:

```
npm init -y
```

4. Run the following to install the readline-sync module:

```
npm install --save readline-sync
```

## How to Run:

1. Access your local copy's root folder in your terminal.
2. Still in your terminal, type the following:

```
node .
```

3. The program will then display a splash screen and prompt the user for confirmation before starting the first round. There are two options:
   - To start the game, type "y" and hit enter.
   - To close the game instead, type "n" and hit enter.

## How to Play:

- Each round, the player will be provided a random, hidden word for them to reveal. This word is represented by a series of underscores positioned under the gallows.
- The player is prompted to guess a letter of the alphabet.
- Matching letters in the secret word will replace their corresponding underscores.
- But watch out! Each incorrect guess will put the condemned one step closer to death.
  - The player can incorrectly guess a total of six times without losing the round.

### Winning Condition:

- The player must guess every letter that's present in the secret word. Once there are no underscores remaining, the player wins, and the gallows are updated to display a congratulatory message.

### Losing Condition:

- The player will lose once they have guessed a seventh letter incorrectly, after which the gallows are updated to display a failure message.

## Between Rounds:

Whether the player has won or lost the last round, they will be notified how many wins and losses they've accrued, and they'll be asked to start a new round:

- To start a new round, type "y" and hit enter. This will reset the rounds' values back to their initial states and produce an entirely different random word. Then a new round will begin.
- To quit, type "n" and hit enter. This will display a final score page indicating total number of rounds, wins, losses, and the player's overall win percentage. To exit, just hit any key.
