document.addEventListener("DOMContentLoaded", function () {
    const board = document.getElementById('board');
    const message = document.getElementById('message');
    const restartBtn = document.getElementById('restartBtn');
    const vsPlayerBtn = document.getElementById('vsPlayer');
    const vsAIBtn = document.getElementById('vsAI');
    const levelSelect = document.getElementById('level');
    const roundsSelect = document.getElementById('rounds');
    const startGameBtn = document.getElementById('startGame');
    const optionsContainer = document.getElementById('options');
    const boardContainer = document.getElementById('boardContainer');
    const playerXScoreEl = document.getElementById('playerXScore');
    const playerOScoreEl = document.getElementById('playerOScore');
    const backBtn = document.getElementById('backBtn');
    const playerXNameInput = document.getElementById('playerXName');
    const playerONameInput = document.getElementById('playerOName');
    const playerNamesContainer = document.getElementById('playerNames');
    const playerXDisplay = document.getElementById('playerXDisplay');
    const playerODisplay = document.getElementById('playerODisplay');

    const backsound = document.getElementById('backsound');
    const soundWin = document.getElementById('sound-win');
    const soundLose = document.getElementById('sound-lose');
    const soundMove = document.getElementById('sound-move');

    let currentPlayer = 'X';
    let gameMode = 'player'; // 'player' or 'ai'
    let aiLevel = 1; // 1: Easy, 2: Medium, 3: Hard
    let rounds = 1; // Number of rounds
    let currentRound = 0;
    let isGameOver = false;
    let playerXScore = 0;
    let playerOScore = 0;
    let playerXName = 'Player X';
    let playerOName = 'Player O';

    // Initialize board
    const squares = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.row = i;
            square.dataset.col = j;
            square.addEventListener('click', () => {
                if (!isGameOver && !square.textContent) {
                    handleMove(square);
                }
            });
            board.appendChild(square);
            squares.push(square);
        }
    }

    // Add event listeners to buttons
    vsPlayerBtn.addEventListener('click', () => {
        gameMode = 'player';
        levelSelect.disabled = true;
        vsPlayerBtn.classList.add('selected');
        vsAIBtn.classList.remove('selected');
        playerNamesContainer.style.display = 'block'; 
        startGameBtn.disabled = false;
    });

    vsAIBtn.addEventListener('click', () => {
        gameMode = 'ai';
        levelSelect.disabled = false;
        vsPlayerBtn.classList.remove('selected');
        vsAIBtn.classList.add('selected');
        playerNamesContainer.style.display = 'none';
        startGameBtn.disabled = false;
    });

    levelSelect.addEventListener('change', (e) => {
        aiLevel = parseInt(e.target.value);
    });

    roundsSelect.addEventListener('change', (e) => {
        rounds = parseInt(e.target.value);
    });

    startGameBtn.addEventListener('click', () => {
        playerXName = playerXNameInput.value || 'Player X';
        playerOName = playerONameInput.value || 'Player O';
        playerXDisplay.textContent = playerXName;
        playerODisplay.textContent = playerOName;
        optionsContainer.style.display = 'none';
        boardContainer.style.display = 'flex';
        restartGame();
    });

    restartBtn.addEventListener('click', () => {
        restartGame();
    });

    function restartGame() {
        isGameOver = false;
        message.textContent = '';
        currentPlayer = 'X';
        currentRound = 0;
        playerXScore = 0;
        playerOScore = 0;
        updateScores();
        squares.forEach(square => {
            square.textContent = '';
            square.classList.remove('blink');
        });
        backsound.play();
        if (gameMode === 'ai' && currentPlayer === 'O') {
            makeAiMove();
        }
    }

    function handleMove(square) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        square.textContent = currentPlayer;
        soundMove.play();
        if (checkWin(row, col)) {
            message.textContent = `${currentPlayer === 'X' ? playerXName : playerOName} wins this round!`;
            isGameOver = true;
            updateScore(currentPlayer);
            if (currentPlayer === 'X') {
                soundWin.play();
            } else {
                soundLose.play();
            }
            backsound.pause();
            currentRound++;
            if (currentRound < rounds) {
                setTimeout(resetBoard, 2000);
            } else {
                setTimeout(() => {
                    message.textContent += ` Final Score - ${playerXName}: ${playerXScore}, ${playerOName}: ${playerOScore}`;
                }, 2000);
            }
        } else if (checkDraw()) {
            message.textContent = 'Draw!';
            isGameOver = true;
            currentRound++;
            if (currentRound < rounds) {
                setTimeout(resetBoard, 2000);
            } else {
                setTimeout(() => {
                    message.textContent += ` Final Score - ${playerXName}: ${playerXScore}, ${playerOName}: ${playerOScore}`;
                }, 2000);
            }
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (gameMode === 'ai' && currentPlayer === 'O') {
                setTimeout(makeAiMove, 1500);
            }
        }
    }

    function checkWin(row, col) {
        const player = currentPlayer;
        const winPatterns = [
            [squares[row * 3], squares[row * 3 + 1], squares[row * 3 + 2]],
            [squares[col], squares[col + 3], squares[col + 6]],
            [squares[0], squares[4], squares[8]],
            [squares[2], squares[4], squares[6]]
        ];

        for (const pattern of winPatterns) {
            if (pattern.every(square => square.textContent === player)) {
                pattern.forEach(square => square.classList.add('blink'));
                return true;
            }
        }

        return false;
    }

    function checkDraw() {
        return squares.every(square => square.textContent !== '');
    }

    function makeAiMove() {
        let bestMove;
        let bestScore = -Infinity;

        for (let square of squares) {
            if (square.textContent === '') {
                square.textContent = currentPlayer;
                let score = minimax(squares, 0, false);
                square.textContent = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = square;
                }
            }
        }

        if (bestMove) {
            handleMove(bestMove);
        }
    }

    function minimax(board, depth, isMaximizing) {
        const scores = {
            X: -1,
            O: 1,
            draw: 0
        };

        if (checkWinCondition(board, 'O')) {
            return scores['O'];
        } else if (checkWinCondition(board, 'X')) {
            return scores['X'];
        } else if (checkDrawCondition(board)) {
            return scores['draw'];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let square of board) {
                if (square.textContent === '') {
                    square.textContent = 'O';
                    let score = minimax(board, depth + 1, false);
                    square.textContent = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let square of board) {
                if (square.textContent === '') {
                    square.textContent = 'X';
                    let score = minimax(board, depth + 1, true);
                    square.textContent = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function checkWinCondition(board, player) {
        const winPatterns = [
            [board[0], board[1], board[2]],
            [board[3], board[4], board[5]],
            [board[6], board[7], board[8]],
            [board[0], board[3], board[6]],
            [board[1], board[4], board[7]],
            [board[2], board[5], board[8]],
            [board[0], board[4], board[8]],
            [board[2], board[4], board[6]]
        ];

        return winPatterns.some(pattern => pattern.every(square => square.textContent === player));
    }

    function checkDrawCondition(board) {
        return board.every(square => square.textContent !== '');
    }

    function updateScore(player) {
        if (player === 'X') {
            playerXScore++;
        } else {
            playerOScore++;
        }
        updateScores();
    }

    function updateScores() {
        playerXScoreEl.textContent = playerXScore;
        playerOScoreEl.textContent = playerOScore;
    }

    function resetBoard() {
        isGameOver = false;
        message.textContent = '';
        currentPlayer = 'X';
        squares.forEach(square => {
            square.textContent = '';
            square.classList.remove('blink');
        });
        backsound.play();
        if (gameMode === 'ai' && currentPlayer === 'O') {
            makeAiMove();
        }
    }

    backBtn.addEventListener('click', () => {
        optionsContainer.style.display = 'flex';
        boardContainer.style.display = 'none';
        backsound.pause();
        backsound.currentTime = 0;
    });

    const pixelArts = document.querySelectorAll('.pixel-art1, .pixel-art2, .pixel-art3, .pixel-art4');

    function moveImageRandomly(element) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const imageWidth = element.offsetWidth;
        const imageHeight = element.offsetHeight;

        const randomX = Math.floor(Math.random() * (screenWidth - imageWidth));
        const randomY = Math.floor(Math.random() * (screenHeight - imageHeight));

        element.style.left = randomX + 'px';
        element.style.top = randomY + 'px';
    }

    pixelArts.forEach(moveImageRandomly);

    setInterval(() => {
        pixelArts.forEach(moveImageRandomly);
    }, 450);

    const buttons = document.querySelectorAll('.sound-button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const sound = button.getAttribute('data-sound');
            const audio = new Audio(sound);
            audio.play();
        });
    });
});
