document.addEventListener('DOMContentLoaded', () => {
            // Game elements
            const gameBoard = document.getElementById('game-board');
            const scoreDisplay = document.getElementById('score');
            const highScoreDisplay = document.getElementById('high-score');
            const finalScoreDisplay = document.getElementById('final-score');
            const gameOverScreen = document.getElementById('game-over');
            const startBtn = document.getElementById('start-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const resetBtn = document.getElementById('reset-btn');
            const restartBtn = document.getElementById('restart-btn');
            const speedSlider = document.getElementById('speed-slider');
            const upBtn = document.getElementById('up-btn');
            const downBtn = document.getElementById('down-btn');
            const leftBtn = document.getElementById('left-btn');
            const rightBtn = document.getElementById('right-btn');
            
            // Game variables
            const gridSize = 20;
            let snake = [{x: 10, y: 10}];
            let food = {x: 5, y: 5};
            let direction = 'right';
            let nextDirection = 'right';
            let gameInterval;
            let gameSpeed = 150;
            let score = 0;
            let highScore = localStorage.getItem('snakeHighScore') || 0;
            let gameRunning = false;
            let gamePaused = false;
            
            // Initialize the game
            highScoreDisplay.textContent = highScore;
            generateFood();
            renderGame();
            
            // Event listeners
            startBtn.addEventListener('click', startGame);
            pauseBtn.addEventListener('click', pauseGame);
            resetBtn.addEventListener('click', resetGame);
            restartBtn.addEventListener('click', restartGame);
            speedSlider.addEventListener('input', updateSpeed);
            
            // Direction buttons
            upBtn.addEventListener('click', () => changeDirection('up'));
            downBtn.addEventListener('click', () => changeDirection('down'));
            leftBtn.addEventListener('click', () => changeDirection('left'));
            rightBtn.addEventListener('click', () => changeDirection('right'));
            
            // Keyboard controls
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDirection('up');
                if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDirection('down');
                if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDirection('left');
                if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDirection('right');
                if (e.key === ' ') togglePause();
            });
            
            // Game functions
            function startGame() {
                if (gameRunning) return;
                gameRunning = true;
                gamePaused = false;
                gameOverScreen.classList.remove('active');
                gameInterval = setInterval(move, gameSpeed);
                startBtn.disabled = true;
                pauseBtn.disabled = false;
            }
            
            function pauseGame() {
                if (!gameRunning || gamePaused) return;
                clearInterval(gameInterval);
                gamePaused = true;
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            }
            
            function resumeGame() {
                if (!gameRunning || !gamePaused) return;
                gameInterval = setInterval(move, gameSpeed);
                gamePaused = false;
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
            
            function togglePause() {
                if (!gameRunning) return;
                if (gamePaused) {
                    resumeGame();
                } else {
                    pauseGame();
                }
            }
            
            function resetGame() {
                clearInterval(gameInterval);
                snake = [{x: 10, y: 10}];
                direction = 'right';
                nextDirection = 'right';
                score = 0;
                scoreDisplay.textContent = score;
                generateFood();
                renderGame();
                gameOverScreen.classList.remove('active');
                gameRunning = false;
                gamePaused = false;
                startBtn.disabled = false;
                pauseBtn.disabled = false;
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
            
            function restartGame() {
                resetGame();
                startGame();
            }
            
            function updateSpeed() {
                gameSpeed = 300 - speedSlider.value + 80;
                if (gameRunning && !gamePaused) {
                    clearInterval(gameInterval);
                    gameInterval = setInterval(move, gameSpeed);
                }
            }
            
            function changeDirection(newDirection) {
                // Prevent reversing direction
                if (
                    (newDirection === 'up' && direction !== 'down') ||
                    (newDirection === 'down' && direction !== 'up') ||
                    (newDirection === 'left' && direction !== 'right') ||
                    (newDirection === 'right' && direction !== 'left')
                ) {
                    nextDirection = newDirection;
                }
            }
            
            function move() {
                direction = nextDirection;
                
                // Move the snake
                const head = {...snake[0]};
                
                switch (direction) {
                    case 'up':
                        head.y -= 1;
                        break;
                    case 'down':
                        head.y += 1;
                        break;
                    case 'left':
                        head.x -= 1;
                        break;
                    case 'right':
                        head.x += 1;
                        break;
                }
                
                // Check for collisions with walls
                if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
                    gameOver();
                    return;
                }
                
                // Check for collisions with self
                for (let i = 0; i < snake.length; i++) {
                    if (head.x === snake[i].x && head.y === snake[i].y) {
                        gameOver();
                        return;
                    }
                }
                
                // Add new head
                snake.unshift(head);
                
                // Check for food collision
                if (head.x === food.x && head.y === food.y) {
                    // Increase score
                    score += 10;
                    scoreDisplay.textContent = score;
                    
                    // Generate new food
                    generateFood();
                } else {
                    // Remove tail if no food was eaten
                    snake.pop();
                }
                
                renderGame();
            }
            
            function generateFood() {
                // Generate random position for food
                let newFood;
                let foodOnSnake;
                
                do {
                    foodOnSnake = false;
                    newFood = {
                        x: Math.floor(Math.random() * gridSize),
                        y: Math.floor(Math.random() * gridSize)
                    };
                    
                    // Check if food is on snake
                    for (let segment of snake) {
                        if (segment.x === newFood.x && segment.y === newFood.y) {
                            foodOnSnake = true;
                            break;
                        }
                    }
                } while (foodOnSnake);
                
                food = newFood;
            }
            
            function renderGame() {
                // Clear the game board
                gameBoard.innerHTML = '';
                
                // Create game elements
                for (let y = 0; y < gridSize; y++) {
                    for (let x = 0; x < gridSize; x++) {
                        const cell = document.createElement('div');
                        cell.style.gridColumn = x + 1;
                        cell.style.gridRow = y + 1;
                        
                        // Check if cell is part of snake
                        let isSnake = false;
                        for (let i = 0; i < snake.length; i++) {
                            if (snake[i].x === x && snake[i].y === y) {
                                isSnake = true;
                                cell.classList.add('snake');
                                if (i === 0) cell.classList.add('head');
                                break;
                            }
                        }
                        
                        // Check if cell is food
                        if (!isSnake && x === food.x && y === food.y) {
                            cell.classList.add('food');
                        }
                        
                        gameBoard.appendChild(cell);
                    }
                }
                
                // Add game over screen back
                gameBoard.appendChild(gameOverScreen);
            }
            
            function gameOver() {
                clearInterval(gameInterval);
                gameRunning = false;
                
                // Update high score
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('snakeHighScore', highScore);
                    highScoreDisplay.textContent = highScore;
                }
                
                // Show game over screen
                finalScoreDisplay.textContent = score;
                gameOverScreen.classList.add('active');
            }
        // Start the game automatically
        startGame();
        });