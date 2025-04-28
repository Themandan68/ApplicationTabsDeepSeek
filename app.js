// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all tabs and set tic-tac-toe as default
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Show tic-tac-toe tab by default
    document.getElementById('tictactoe').classList.add('active');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show the selected tab content
            document.getElementById(tabId).classList.add('active');
            this.classList.add('active');
        });
    });
    
    // Initialize all components
    initTicTacToe();
    initNotes();
    initCalculator();
    
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});

// Tic-Tac-Toe Game
function initTicTacToe() {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset-game');
    
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Load game state from localStorage
    function loadGameState() {
        const savedGame = localStorage.getItem('ticTacToeGame');
        if (savedGame) {
            const gameData = JSON.parse(savedGame);
            gameState = gameData.gameState;
            currentPlayer = gameData.currentPlayer;
            gameActive = gameData.gameActive;
            
            // Update the board display
            cells.forEach((cell, index) => {
                cell.textContent = gameState[index];
            });
            
            // Update status
            if (!gameActive) {
                status.textContent = `Player ${gameData.winner} wins!`;
            } else {
                status.textContent = `Player ${currentPlayer}'s turn`;
            }
        }
    }
    
    // Save game state to localStorage
    function saveGameState(winner = null) {
        const gameData = {
            gameState,
            currentPlayer,
            gameActive,
            winner
        };
        localStorage.setItem('ticTacToeGame', JSON.stringify(gameData));
    }
    
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }
        
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        
        checkResult();
    }
    
    function checkResult() {
        let roundWon = false;
        
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const a = gameState[winCondition[0]];
            const b = gameState[winCondition[1]];
            const c = gameState[winCondition[2]];
            
            if (a === '' || b === '' || c === '') {
                continue;
            }
            
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }
        
        if (roundWon) {
            status.textContent = `Player ${currentPlayer} wins!`;
            gameActive = false;
            saveGameState(currentPlayer);
            return;
        }
        
        const roundDraw = !gameState.includes('');
        if (roundDraw) {
            status.textContent = 'Game ended in a draw!';
            gameActive = false;
            saveGameState('Draw');
            return;
        }
        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        status.textContent = `Player ${currentPlayer}'s turn`;
        saveGameState();
    }
    
    function resetGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        status.textContent = `Player ${currentPlayer}'s turn`;
        
        cells.forEach(cell => {
            cell.textContent = '';
        });
        
        saveGameState();
    }
    
    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    resetButton.addEventListener('click', resetGame);
    
    // Load game state when the tab is initialized
    loadGameState();
}

// Notes Application
function initNotes() {
    const notesList = document.getElementById('notes-list');
    const noteEditor = document.getElementById('note-editor');
    const newNoteBtn = document.getElementById('new-note');
    const saveNoteBtn = document.getElementById('save-note');
    const deleteNoteBtn = document.getElementById('delete-note');
    
    let notes = [];
    let currentNoteId = null;
    
    // Load notes from localStorage
    function loadNotes() {
        const savedNotes = localStorage.getItem('notesApp');
        if (savedNotes) {
            notes = JSON.parse(savedNotes);
            renderNotesList();
        }
    }
    
    // Save notes to localStorage
    function saveNotes() {
        localStorage.setItem('notesApp', JSON.stringify(notes));
    }
    
    // Render the notes list
    function renderNotesList() {
        notesList.innerHTML = '';
        
        notes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note.content.substring(0, 10) + (note.content.length > 10 ? '...' : '');
            li.setAttribute('data-id', note.id);
            
            li.addEventListener('dblclick', () => {
                currentNoteId = note.id;
                noteEditor.value = note.content;
            });
            
            notesList.appendChild(li);
        });
    }
    
    // Create a new note
    function createNewNote() {
        currentNoteId = Date.now().toString();
        noteEditor.value = '';
        noteEditor.focus();
    }
    
    // Save the current note
    function saveCurrentNote() {
        if (!noteEditor.value.trim()) return;
        
        if (currentNoteId) {
            const existingNoteIndex = notes.findIndex(note => note.id === currentNoteId);
            
            if (existingNoteIndex !== -1) {
                // Update existing note
                notes[existingNoteIndex].content = noteEditor.value;
            } else {
                // Add new note
                notes.push({
                    id: currentNoteId,
                    content: noteEditor.value
                });
            }
            
            saveNotes();
            renderNotesList();
        }
    }
    
    // Delete the current note
    function deleteCurrentNote() {
        if (!currentNoteId) return;
        
        notes = notes.filter(note => note.id !== currentNoteId);
        saveNotes();
        renderNotesList();
        noteEditor.value = '';
        currentNoteId = null;
    }
    
    // Event listeners
    newNoteBtn.addEventListener('click', createNewNote);
    saveNoteBtn.addEventListener('click', saveCurrentNote);
    deleteNoteBtn.addEventListener('click', deleteCurrentNote);
    
    // Load notes when the tab is initialized
    loadNotes();
}

// Calculator Application
function initCalculator() {
    const calculator = document.querySelector('.calculator');
    const keys = calculator.querySelector('.calculator-keys');
    const display = calculator.querySelector('.calculator-screen');
    
    let firstOperand = null;
    let operator = null;
    let waitingForSecondOperand = false;
    
    // Load calculator state from localStorage
    function loadCalculatorState() {
        const savedState = localStorage.getItem('calculatorState');
        if (savedState) {
            const state = JSON.parse(savedState);
            display.value = state.displayValue || '0';
            firstOperand = state.firstOperand;
            operator = state.operator;
            waitingForSecondOperand = state.waitingForSecondOperand;
        }
    }
    
    // Save calculator state to localStorage
    function saveCalculatorState() {
        const state = {
            displayValue: display.value,
            firstOperand,
            operator,
            waitingForSecondOperand
        };
        localStorage.setItem('calculatorState', JSON.stringify(state));
    }
    
    function inputDigit(digit) {
        if (waitingForSecondOperand) {
            display.value = digit;
            waitingForSecondOperand = false;
        } else {
            display.value = display.value === '0' ? digit : display.value + digit;
        }
        saveCalculatorState();
    }
    
    function inputDecimal() {
        if (waitingForSecondOperand) {
            display.value = '0.';
            waitingForSecondOperand = false;
            return;
        }
        
        if (!display.value.includes('.')) {
            display.value += '.';
        }
        saveCalculatorState();
    }
    
    function handleOperator(nextOperator) {
        const inputValue = parseFloat(display.value);
        
        if (operator && waitingForSecondOperand) {
            operator = nextOperator;
            return;
        }
        
        if (firstOperand === null) {
            firstOperand = inputValue;
        } else if (operator) {
            const result = calculate(firstOperand, inputValue, operator);
            display.value = String(result);
            firstOperand = result;
        }
        
        waitingForSecondOperand = true;
        operator = nextOperator;
        saveCalculatorState();
    }
    
    function calculate(firstOperand, secondOperand, operator) {
        switch (operator) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '*':
                return firstOperand * secondOperand;
            case '/':
                return firstOperand / secondOperand;
            case 'sqrt':
                return Math.sqrt(secondOperand);
            case 'pow':
                return Math.pow(firstOperand, secondOperand);
            default:
                return secondOperand;
        }
    }
    
    function resetCalculator() {
        display.value = '0';
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = false;
        saveCalculatorState();
    }
    
    keys.addEventListener('click', e => {
        const { target } = e;
        const { value } = target;
        
        if (!target.matches('button')) return;
        
        switch (value) {
            case '+':
            case '-':
            case '*':
            case '/':
            case 'sqrt':
            case 'pow':
                handleOperator(value);
                break;
            case '=':
                if (operator && !waitingForSecondOperand) {
                    const inputValue = parseFloat(display.value);
                    const result = calculate(firstOperand, inputValue, operator);
                    display.value = String(result);
                    firstOperand = null;
                    operator = null;
                    waitingForSecondOperand = false;
                    saveCalculatorState();
                }
                break;
            case 'all-clear':
                resetCalculator();
                break;
            case '.':
                inputDecimal();
                break;
            default:
                if (Number.isInteger(parseFloat(value))) {
                    inputDigit(value);
                }
        }
    });
    
    // Load calculator state when the tab is initialized
    loadCalculatorState();
}
