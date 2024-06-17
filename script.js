let word1 = '';
let word2 = '';
let currentGuess = '';
let attempts = [];
let score = 0;
let word1Guessed = false;
let word2Guessed = false;
let gameCompleted = false;

async function fetchRandomWords() {
    try {
        const response = await fetch('https://random-word-api.herokuapp.com/word?length=5&number=2');
        const words = await response.json();
        word1 = words[0].toUpperCase();
        word2 = words[1].toUpperCase();
        console.log("Two words are: ", word1, word2);
    } catch (error) {
        console.error('Error fetching random words:', error);
    }
}

async function createGrid(id) {
    const grid = document.getElementById(id);
    for (let i = 0; i < 6 * 5; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        grid.appendChild(cell);
    }
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    const keys = 'QWERTYUIOPASDFGHJKL'.split('');
    keys.push('↵');
    const remaining = "ZXCVBNM".split('');
    keys.push(...remaining);
    keys.push('⌫');
    keys.forEach(key => {
        const keyElement = document.createElement('div');
        keyElement.className = 'key';
        keyElement.dataset.key = key;
        keyElement.innerText = key;
        keyElement.addEventListener('click', () => handleKeyPress(key));
        keyboard.appendChild(keyElement);
    });
}

async function handleKeyPress(key) {
    if (gameCompleted) {
        alert('Game completed. Please restart to play again.');
        return;
    }

    if (key === '↵') {
        if (currentGuess.length === 5) {
            if (await isWordValid(currentGuess)) {
                attempts.push(currentGuess);
                checkGuess(currentGuess);
                currentGuess = '';
                updateGrid();
                checkGameCompletion();
            } else {
                alert('Word not found in dictionary. Please try another word.');
            }
        }
    } else if (key === '⌫') {
        currentGuess = currentGuess.slice(0, -1);
    } else if (currentGuess.length < 5 && /^[a-zA-Z]$/.test(key)) {
        currentGuess += key.toUpperCase();
    }
    updateGrid();
}

async function isWordValid(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        return !data.title; // If there's no title, it means the word is found.
    } catch (error) {
        console.error('Error checking word:', error);
        return false;
    }
}

function checkGuess(guess) {
    const result1 = checkWord(guess, word1);
    const result2 = checkWord(guess, word2);
    console.log(`Guess: ${guess}, Result1: ${result1}, Result2: ${result2}`);

    if (result1.every(r => r === 'correct') && !word1Guessed) {
        score += 1;
        word1Guessed = true;
        updateScore();
    }
    if (result2.every(r => r === 'correct') && !word2Guessed) {
        score += 1;
        word2Guessed = true;
        updateScore();
    }

    if (word1Guessed && word2Guessed) {
        markGameCompleted();
    }
}

function checkWord(guess, word) {
    let result = [];
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === word[i]) {
            result.push('correct');
        } else if (word.includes(guess[i])) {
            result.push('present');
        } else {
            result.push('absent');
        }
    }
    return result;
}

function updateGrid() {
    const grid1Cells = document.querySelectorAll('#grid1 .cell');
    const grid2Cells = document.querySelectorAll('#grid2 .cell');
    const allCells = [grid1Cells, grid2Cells];

    allCells.forEach((cells, gridIndex) => {
        cells.forEach((cell, index) => {
            const guessIndex = Math.floor(index / 5);
            const letterIndex = index % 5;
            if (guessIndex < attempts.length) {
                cell.innerText = attempts[guessIndex][letterIndex];
                const word = gridIndex === 0 ? word1 : word2;
                const result = checkWord(attempts[guessIndex], word)[letterIndex];
                cell.className = `cell ${result}`;
            } else if (guessIndex === attempts.length) {
                cell.innerText = currentGuess[letterIndex] || '';
                cell.className = 'cell';
            } else {
                cell.innerText = '';
                cell.className = 'cell';
            }
        });
    });
}

function updateScore() {
    document.getElementById('score').innerText = `Score: ${score}`;
}

function checkGameCompletion() {
    if (attempts.length >= 6 || (word1Guessed && word2Guessed)) {
        markGameCompleted();
    }
}

function markGameCompleted() {
    gameCompleted = true;
    document.getElementById('completion-message').innerHTML = `<p>Your Score: ${score} Game Completed </br> Correct words:${word1} and ${word2}`;
    document.getElementById('completion-message').style.color = 'green';
}

async function initializeGame() {
    createGrid('grid1');
    createGrid('grid2');
    createKeyboard();
    await fetchRandomWords();
    updateGrid();
}

// Modal functionality
const modal = document.getElementById('info-modal');
const infoButton = document.getElementById('info-button');
const closeButton = document.querySelector('.close-button');

infoButton.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', initializeGame);
document.addEventListener('keydown', (e) => {
    if (e.key === '↵') {
        handleKeyPress('↵');
    } else if (e.key === '⌫') {
        handleKeyPress('⌫');
    } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
    }
});
