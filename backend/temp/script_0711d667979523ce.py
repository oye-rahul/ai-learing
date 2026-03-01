// JavaScript Example
console.log("Hello from JavaScript!");

function greet(name) {
    return `Hello, ${name}!`;
}

console.log(greet("World"));// script.js

// 1. Get references to HTML elements
const statusDisplay = document.querySelector('#status');
const gameBoard = document.querySelector('#board');
const resetButton = document.querySelector('#reset-button');
const cells = document.querySelectorAll('.cell'); // Get all 9 cell divs

// 2. Initialize game state variables
let gameActive = true; // Is the game currently being played?
let currentPlayer = 'X'; // Who's turn is it? 'X' or 'O'
let gameState = ['', '', '', '', '', '', '', '', '']; // Represents the 3x3 board
                                                    // Each element is '', 'X', or 'O'

// 3. Define messages for the status display
const winningMessage = () => `Player ${currentPlayer} has won!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `It's Player ${currentPlayer}'s turn`;

// 4. Set initial status message
statusDisplay.innerHTML = currentPlayerTurn();

// 5. Define win conditions (all possible ways to win)
const winningConditions = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal from top-left
    [2, 4, 6]  // Diagonal from top-right
];

// 6. Handle a cell being played (when a user clicks a cell)
function handleCellPlayed(clickedCell, clickedCellIndex) {
    // Update the game state array with the current player's mark
    gameState[clickedCellIndex] = currentPlayer;
    // Update the HTML content of the clicked cell
    clickedCell.innerHTML = currentPlayer;
}

// 7. Handle player change
function handlePlayerChange() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Toggle between 'X' and 'O'
    statusDisplay.innerHTML = currentPlayerTurn(); // Update status display
}

// 8. Check for game result (win or draw)
function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        // If any of the cells in a winning condition are empty, continue
        if (a === '' || b === '' || c === '') {
            continue;
        }
        // If all three cells match and are not empty, we have a winner!
        if (a === b && b === c) {
            roundWon = true;
            break; // No need to check other conditions
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage(); // Display win message
        gameActive = false; // Stop the game
        return; // Exit the function
    }

    // If no one won, check for a draw (all cells filled and no winner)
    let roundDraw = !gameState.includes(''); // True if no empty cells remain
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage(); // Display draw message
        gameActive = false; // Stop the game
        return;
    }

    // If no win and no draw, continue the game by changing player
    handlePlayerChange();
}

// 9. Main function to handle a cell click
function handleCellClick(event) {
    const clickedCell = event.target; // The actual div element that was clicked
    // Get the data-cell-index from the clicked cell (e.g., "0", "1", etc.)
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    // Check if the cell is already played or if the game is not active
    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return; // Do nothing if cell is filled or game is over
    }

    // If valid move, proceed
    handleCellPlayed(clickedCell, clickedCellIndex); // Update board and cell
    handleResultValidation(); // Check for win/draw and switch player
}

// 10. Handle game reset
function handleRestartGame() {
    gameActive = true; // Reactivate the game
    currentPlayer = 'X'; // Reset to Player X
    gameState = ['', '', '', '', '', '', '', '', '']; // Clear the board state
    statusDisplay.innerHTML = currentPlayerTurn(); // Update status message

    // Clear the content of all cells visually
    cells.forEach(cell => cell.innerHTML = '');
}

// 11. Add Event Listeners
// Listen for clicks on each cell
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
// Listen for clicks on the reset button
resetButton.addEventListener('click', handleRestartGame);