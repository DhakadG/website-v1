/*
===============================================================================
                          MODERN TIC-TAC-TOE GAME
                        Enhanced Edition - Version 2.0
                        Created by Modern Games Studio
===============================================================================
*/

/**
 * Enhanced Tic-Tac-Toe Game Class
 * Features: Player names, advanced scoring, sound effects, animations
 */
class ModernTicTacToeGame {
    constructor() {
        // DOM Elements - Game Board
        this.boxes = document.querySelectorAll(".box");
        this.gameBoard = document.querySelector("#game-board");
        this.winningLine = document.querySelector("#winning-line");
        
        // DOM Elements - Controls
        this.resetButton = document.querySelector("#reset-btn");
        this.changeNamesButton = document.querySelector("#change-names-btn");
        this.soundToggle = document.querySelector("#sound-toggle");
        this.soundIcon = document.querySelector("#sound-icon");
        this.themeToggle = document.querySelector("#theme-toggle");
        this.fullscreenBtn = document.querySelector("#fullscreen-btn");
        
        // DOM Elements - Modals
        this.setupModal = document.querySelector("#setup-modal");
        this.victoryModal = document.querySelector("#victory-modal");
        this.infoModal = document.querySelector("#info-modal");
        
        // DOM Elements - Setup Modal
        this.player1Input = document.querySelector("#player1-name");
        this.player2Input = document.querySelector("#player2-name");
        this.startGameBtn = document.querySelector("#start-game-btn");
        this.quickStartBtn = document.querySelector("#quick-start-btn");
        
        // DOM Elements - Victory Modal
        this.victoryTitle = document.querySelector("#victory-title");
        this.victoryMessage = document.querySelector("#victory-message");
        this.victoryIcon = document.querySelector("#victory-icon");
        this.winningPattern = document.querySelector("#winning-pattern");
        this.movesCount = document.querySelector("#moves-count");
        this.gameDuration = document.querySelector("#game-duration");
        this.nextRoundBtn = document.querySelector("#next-round-btn");
        this.newGameBtn = document.querySelector("#new-game-btn");
        this.closeModalBtn = document.querySelector("#close-modal-btn");
        
        // DOM Elements - Info Modal
        this.infoBtn = document.querySelector("#info-btn");
        this.closeInfoBtn = document.querySelector("#close-info-btn");
        this.footerInfoBtn = document.querySelector("#footer-info-btn");
        
        // DOM Elements - Display
        this.player1Display = document.querySelector("#player1-display");
        this.player2Display = document.querySelector("#player2-display");
        this.scoreX = document.querySelector("#scoreX");
        this.scoreO = document.querySelector("#scoreO");
        this.turnIndicator = document.querySelector("#turn-indicator");
        this.turnIcon = document.querySelector("#turn-icon");
        this.roundNumber = document.querySelector("#round-number");
        this.gamesPlayed = document.querySelector("#games-played");
        this.totalMoves = document.querySelector("#total-moves");
        
        // Game State
        this.gameState = {
            currentPlayer: 'X',
            gameBoard: Array(9).fill(''),
            gameActive: false,
            gameStartTime: null,
            moveCount: 0,
            round: 1
        };
        
        // Player Data
        this.players = {
            X: { name: 'Player 1', score: 0 },
            O: { name: 'Player 2', score: 0 }
        };
        
        // Game Statistics
        this.stats = {
            gamesPlayed: 0,
            totalMoves: 0,
            gameHistory: [],
            averageGameTime: 0
        };
        
        // Settings
        this.settings = {
            soundEnabled: true,
            theme: 'dark',
            animations: true
        };
        
        // Audio Context
        this.audioContext = null;
        
        // Win Patterns
        this.winPatterns = [
            { indices: [0, 1, 2], name: 'Top Row' },
            { indices: [3, 4, 5], name: 'Middle Row' },
            { indices: [6, 7, 8], name: 'Bottom Row' },
            { indices: [0, 3, 6], name: 'Left Column' },
            { indices: [1, 4, 7], name: 'Middle Column' },
            { indices: [2, 5, 8], name: 'Right Column' },
            { indices: [0, 4, 8], name: 'Main Diagonal' },
            { indices: [2, 4, 6], name: 'Anti Diagonal' }
        ];
        
        // Initialize the game
        this.init();
    }

    /**
     * Initialize the game
     */
    init() {
        this.bindEvents();
        this.loadGameData();
        this.showSetupModal();
        this.updateDisplay();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Game board events
        this.boxes.forEach((box, index) => {
            box.addEventListener('click', () => this.handleBoxClick(index));
            box.addEventListener('mouseenter', () => this.handleBoxHover(box, index));
            box.addEventListener('mouseleave', () => this.handleBoxLeave(box, index));
        });

        // Control button events
        this.resetButton?.addEventListener('click', () => this.resetGame());
        this.changeNamesButton?.addEventListener('click', () => this.showSetupModal());
        this.soundToggle?.addEventListener('click', () => this.toggleSound());
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());
        this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());

        // Setup modal events
        this.startGameBtn?.addEventListener('click', () => this.startGame());
        this.quickStartBtn?.addEventListener('click', () => this.quickStart());

        // Victory modal events
        this.nextRoundBtn?.addEventListener('click', () => this.nextRound());
        this.newGameBtn?.addEventListener('click', () => this.startNewGame());
        this.closeModalBtn?.addEventListener('click', () => this.closeModal());

        // Info modal events
        this.infoBtn?.addEventListener('click', () => this.showInfoModal());
        this.closeInfoBtn?.addEventListener('click', () => this.closeInfoModal());
        this.footerInfoBtn?.addEventListener('click', () => this.showInfoModal());

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Save data on page unload
        window.addEventListener('beforeunload', () => this.saveGameData());

        // Input validation
        this.player1Input?.addEventListener('input', (e) => this.validateInput(e));
        this.player2Input?.addEventListener('input', (e) => this.validateInput(e));
    }

    /**
     * Show setup modal for player names
     */
    showSetupModal() {
        if (this.setupModal) {
            this.setupModal.classList.remove('hide');
            this.player1Input.focus();
        }
    }

    /**
     * Start game with custom names
     */
    startGame() {
        const player1Name = this.player1Input.value.trim() || 'Player 1';
        const player2Name = this.player2Input.value.trim() || 'Player 2';
        
        this.players.X.name = player1Name;
        this.players.O.name = player2Name;
        
        this.hideSetupModal();
        this.initializeGame();
    }

    /**
     * Quick start with default names
     */
    quickStart() {
        this.players.X.name = 'Player 1';
        this.players.O.name = 'Player 2';
        
        this.hideSetupModal();
        this.initializeGame();
    }

    /**
     * Hide setup modal
     */
    hideSetupModal() {
        if (this.setupModal) {
            this.setupModal.classList.add('hide');
        }
    }

    /**
     * Initialize game after setup
     */
    initializeGame() {
        this.gameState.gameActive = true;
        this.gameState.gameStartTime = Date.now();
        this.updateDisplay();
        this.playSound('gameStart');
    }

    /**
     * Handle box click
     */
    handleBoxClick(index) {
        if (!this.gameState.gameActive || this.gameState.gameBoard[index] !== '') {
            return;
        }

        this.makeMove(index);
        this.checkGameResult();
    }

    /**
     * Make a move
     */
    makeMove(index) {
        const box = this.boxes[index];
        
        // Clear preview state
        this.clearBoxPreview(box);
        
        // Update game state
        this.gameState.gameBoard[index] = this.gameState.currentPlayer;
        this.gameState.moveCount++;
        this.stats.totalMoves++;
        
        // Update box display
        box.textContent = this.gameState.currentPlayer;
        box.classList.add(this.gameState.currentPlayer.toLowerCase());
        box.disabled = true;
        
        // Play sound
        this.playSound('move');
        
        // Update statistics
        this.updateStatistics();
    }

    /**
     * Check game result
     */
    checkGameResult() {
        const result = this.getGameResult();
        
        if (result.type === 'win') {
            this.handleWin(result.player, result.pattern);
        } else if (result.type === 'draw') {
            this.handleDraw();
        } else {
            this.switchPlayer();
        }
    }

    /**
     * Get current game result
     */
    getGameResult() {
        // Check for win
        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern.indices;
            if (this.gameState.gameBoard[a] && 
                this.gameState.gameBoard[a] === this.gameState.gameBoard[b] && 
                this.gameState.gameBoard[a] === this.gameState.gameBoard[c]) {
                return { 
                    type: 'win', 
                    player: this.gameState.gameBoard[a], 
                    pattern: pattern 
                };
            }
        }

        // Check for draw
        if (this.gameState.gameBoard.every(cell => cell !== '')) {
            return { type: 'draw' };
        }

        return { type: 'continue' };
    }

    /**
     * Handle win
     */
    handleWin(winner, pattern) {
        this.gameState.gameActive = false;
        
        // Update score
        this.players[winner].score++;
        
        // Highlight winning cells
        this.highlightWinningCells(pattern.indices);
        
        // Show victory modal
        this.showVictoryModal(winner, pattern);
        
        // Update statistics
        this.updateGameStats();
        
        // Play celebration
        this.celebrate();
        this.playSound('win');
    }

    /**
     * Handle draw
     */
    handleDraw() {
        this.gameState.gameActive = false;
        this.showVictoryModal(null, null);
        this.updateGameStats();
        this.playSound('draw');
    }

    /**
     * Switch current player
     */
    switchPlayer() {
        this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnIndicator();
    }

    /**
     * Show victory modal
     */
    showVictoryModal(winner, pattern) {
        const gameTime = this.getGameDuration();
        
        if (winner) {
            this.victoryTitle.textContent = 'Congratulations!';
            this.victoryMessage.textContent = `${this.players[winner].name} Wins!`;
            this.victoryIcon.textContent = '🏆';
            this.winningPattern.textContent = pattern.name;
        } else {
            this.victoryTitle.textContent = "It's a Draw!";
            this.victoryMessage.textContent = 'Great game, everyone!';
            this.victoryIcon.textContent = '🤝';
            this.winningPattern.textContent = 'No winner';
        }
        
        this.movesCount.textContent = this.gameState.moveCount;
        this.gameDuration.textContent = this.formatTime(gameTime);
        
        this.victoryModal.classList.remove('hide');
    }

    /**
     * Continue playing - saves the changes made in the files above
     */
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        this.closeModalButton.addEventListener('click', () => this.closeModal());
        this.soundToggle.addEventListener('click', () => this.toggleSound());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Save game data on page unload
        window.addEventListener('beforeunload', () => this.saveGameData());
    }

    handleBoxClick(index) {
        if (!this.gameActive || this.gameBoard[index] !== '') return;

        // Make move
        this.makeMove(index);
        
        // Check for win or draw
        const result = this.checkGameResult();
        
        if (result.type === 'win') {
            this.handleWin(result.player, result.pattern);
        } else if (result.type === 'draw') {
            this.handleDraw();
        } else {
            this.switchPlayer();
        }
    }

    makeMove(index) {
        this.gameBoard[index] = this.currentPlayer;
        const box = this.boxes[index];
        
        // Clear any preview state
        box.classList.remove('preview');
        box.style.color = '';
        
        // Add visual feedback
        box.textContent = this.currentPlayer;
        box.classList.add(this.currentPlayer.toLowerCase());
        box.disabled = true;

        // Play sound effect
        this.playSound('move');

        // Add to game history
        this.gameHistory.push({
            player: this.currentPlayer,
            position: index,
            timestamp: Date.now()
        });
    }

    checkGameResult() {
        // Check for win
        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern;
            if (this.gameBoard[a] && 
                this.gameBoard[a] === this.gameBoard[b] && 
                this.gameBoard[a] === this.gameBoard[c]) {
                return { 
                    type: 'win', 
                    player: this.gameBoard[a], 
                    pattern: pattern 
                };
            }
        }

        // Check for draw
        if (this.gameBoard.every(cell => cell !== '')) {
            return { type: 'draw' };
        }

        return { type: 'continue' };
    }

    handleWin(winner, winningPattern) {
        this.gameActive = false;
        this.scores[winner]++;
        
        // Highlight winning cells
        winningPattern.forEach(index => {
            this.boxes[index].classList.add('winning');
        });

        // Update score display
        this.updateScoreDisplay();
        
        // Show victory modal
        this.showVictoryModal(winner, 'win');
        
        // Play victory sound and celebration
        this.playSound('win');
        this.celebrate();
    }

    handleDraw() {
        this.gameActive = false;
        this.showVictoryModal(null, 'draw');
        this.playSound('draw');
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnIndicator();
    }

    updateTurnIndicator() {
        this.turnIndicator.textContent = `Player ${this.currentPlayer}'s Turn`;
        this.turnIndicator.style.background = this.currentPlayer === 'X' 
            ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)'
            : 'linear-gradient(135deg, #4ecdc4 0%, #7fecec 100%)';
    }

    updateScoreDisplay() {
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
        
        // Add pulse animation to updated score
        const updatedScore = this.currentPlayer === 'X' ? this.scoreX : this.scoreO;
        updatedScore.style.animation = 'none';
        updatedScore.offsetHeight; // Trigger reflow
        updatedScore.style.animation = 'pulse 0.6s ease-out';
    }

    showVictoryModal(winner, type) {
        if (type === 'win') {
            this.victoryTitle.textContent = 'Congratulations!';
            this.victoryMessage.textContent = `Player ${winner} Wins!`;
            this.victoryIcon.textContent = '🏆';
        } else {
            this.victoryTitle.textContent = "It's a Draw!";
            this.victoryMessage.textContent = 'Great game, everyone!';
            this.victoryIcon.textContent = '🤝';
        }
        
        this.victoryModal.classList.remove('hide');
    }

    closeModal() {
        this.victoryModal.classList.add('hide');
    }

    resetGame() {
        this.gameBoard = Array(9).fill('');
        this.gameActive = true;
        this.currentPlayer = 'X';
        this.gameHistory = [];
        
        // Reset boxes
        this.boxes.forEach(box => {
            box.textContent = '';
            box.disabled = false;
            box.className = 'box';
            box.style.color = '';
        });
        
        this.updateTurnIndicator();
        this.closeModal();
        this.playSound('reset');
    }

    startNewGame() {
        this.resetGame();
    }

    handleBoxHover(box, index) {
        if (!this.gameActive || this.gameBoard[index] !== '') return;
        
        // Show preview of move
        if (!box.classList.contains('preview')) {
            box.style.color = this.currentPlayer === 'X' ? 'rgba(255, 107, 107, 0.5)' : 'rgba(78, 205, 196, 0.5)';
            box.textContent = this.currentPlayer;
            box.classList.add('preview');
        }
    }

    handleBoxLeave(box, index) {
        // Remove preview if box is empty
        if (this.gameBoard[index] === '' && box.classList.contains('preview')) {
            box.textContent = '';
            box.style.color = '';
            box.classList.remove('preview');
        }
    }

    handleKeyPress(e) {
        // Handle ESC key to close modal
        if (e.key === 'Escape') {
            this.closeModal();
        }
        
        // Handle number keys (1-9) for box selection
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
            this.handleBoxClick(num - 1);
        }
        
        // Handle R key for reset
        if (e.key.toLowerCase() === 'r') {
            this.resetGame();
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
        this.playSound('toggle');
        
        // Save preference
        localStorage.setItem('ticTacToeSound', this.soundEnabled);
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        
        try {
            // Initialize audio context if needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resume audio context if suspended (required for some browsers)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const sounds = {
                move: { freq: 800, duration: 0.1 },
                win: { freq: 1000, duration: 0.3 },
                draw: { freq: 400, duration: 0.3 },
                reset: { freq: 600, duration: 0.15 },
                toggle: { freq: 500, duration: 0.1 }
            };
            
            const sound = sounds[type];
            if (!sound) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(sound.freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }

    celebrate() {
        // Enhanced confetti celebration
        const celebration = () => {
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffa726']
                });
            }
        };
        
        celebration();
        setTimeout(celebration, 300);
        setTimeout(celebration, 600);
        
        // Add screen flash effect
        document.body.style.animation = 'flash 0.5s ease-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }

    saveGameData() {
        try {
            const gameData = {
                scores: this.scores,
                soundEnabled: this.soundEnabled,
                gameHistory: this.gameHistory.slice(-10) // Keep last 10 games
            };
            localStorage.setItem('ticTacToeData', JSON.stringify(gameData));
        } catch (error) {
            console.warn('Failed to save game data:', error);
        }
    }

    loadGameData() {
        try {
            const savedData = localStorage.getItem('ticTacToeData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.scores = data.scores || { X: 0, O: 0 };
                this.soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
                this.gameHistory = data.gameHistory || [];
                
                this.updateScoreDisplay();
                this.soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
            }
            
            // Load sound preference from separate storage if available
            const soundPref = localStorage.getItem('ticTacToeSound');
            if (soundPref !== null) {
                this.soundEnabled = soundPref === 'true';
                this.soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
            }
        } catch (error) {
            console.warn('Failed to load game data:', error);
            // Set defaults if loading fails
            this.scores = { X: 0, O: 0 };
            this.soundEnabled = true;
            this.gameHistory = [];
        }
    }

    // AI Player (Bonus feature for single player mode)
    makeAIMove() {
        const emptyCells = this.gameBoard.map((cell, index) => cell === '' ? index : null)
                                      .filter(cell => cell !== null);
        
        if (emptyCells.length === 0) return;
        
        // Simple AI: Try to win, block player, or make random move
        const aiMove = this.getBestMove(emptyCells);
        
        setTimeout(() => {
            if (this.gameActive && this.gameBoard[aiMove] === '') {
                this.handleBoxClick(aiMove);
            }
        }, 500);
    }

    getBestMove(emptyCells) {
        // Try to win
        for (let cell of emptyCells) {
            this.gameBoard[cell] = 'O';
            if (this.checkGameResult().type === 'win') {
                this.gameBoard[cell] = '';
                return cell;
            }
            this.gameBoard[cell] = '';
        }
        
        // Try to block player
        for (let cell of emptyCells) {
            this.gameBoard[cell] = 'X';
            if (this.checkGameResult().type === 'win') {
                this.gameBoard[cell] = '';
                return cell;
            }
            this.gameBoard[cell] = '';
        }
        
        // Take center if available
        if (emptyCells.includes(4)) return 4;
        
        // Take corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => emptyCells.includes(corner));
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Random move
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
}

// Add CSS animation for flash effect
const style = document.createElement('style');
style.textContent = `
    @keyframes flash {
        0% { background-color: rgba(255, 255, 255, 0); }
        50% { background-color: rgba(255, 255, 255, 0.1); }
        100% { background-color: rgba(255, 255, 255, 0); }
    }
`;
document.head.appendChild(style);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});

// Add smooth scrolling and page transitions
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to page elements
    const elements = document.querySelectorAll('.game-header, .game-main');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
});
