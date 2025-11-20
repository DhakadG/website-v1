/*
===============================================================================
                          MODERN TIC-TAC-TOE GAME
                        Enhanced Edition - Version 2.0
                        Created by That lost husky
===============================================================================
*/

/**
 * Enhanced Tic-Tac-Toe Game Class
 * Features: Player names, advanced scoring, sound effects, animations
 */
class ModernTicTacToeGame {
    constructor() {
        // Initialize all DOM elements and game state
        this.initializeDOMElements();
        this.initializeGameState();
        this.init();
    }

    initializeDOMElements() {
        // Game Board Elements
        this.boxes = document.querySelectorAll(".box");
        this.gameBoard = document.querySelector("#game-board");
        
        // Control Elements
        this.resetButton = document.querySelector("#reset-btn");
        this.changeNamesButton = document.querySelector("#change-names-btn");
        this.soundToggle = document.querySelector("#sound-toggle");
        this.soundIcon = document.querySelector("#sound-icon");
        
        // Modal Elements
        this.setupModal = document.querySelector("#setup-modal");
        this.victoryModal = document.querySelector("#victory-modal");
        this.infoModal = document.querySelector("#info-modal");
        
        // Setup Modal Elements
        this.player1Input = document.querySelector("#player1-name");
        this.player2Input = document.querySelector("#player2-name");
        this.startGameBtn = document.querySelector("#start-game-btn");
        this.quickStartBtn = document.querySelector("#quick-start-btn");
        
        // Victory Modal Elements
        this.victoryTitle = document.querySelector("#victory-title");
        this.victoryMessage = document.querySelector("#victory-message");
        this.victoryIcon = document.querySelector("#victory-icon");
        this.nextRoundBtn = document.querySelector("#next-round-btn");
        this.newGameBtn = document.querySelector("#new-game-btn");
        this.closeModalBtn = document.querySelector("#close-modal-btn");
        
        // Display Elements
        this.player1Display = document.querySelector("#player1-display");
        this.player2Display = document.querySelector("#player2-display");
        this.scoreX = document.querySelector("#scoreX");
        this.scoreO = document.querySelector("#scoreO");
        this.turnIndicator = document.querySelector("#turn-indicator");
        this.turnIcon = document.querySelector("#turn-icon");
        this.roundNumber = document.querySelector("#round-number");
        this.gamesPlayed = document.querySelector("#games-played");
        this.totalMoves = document.querySelector("#total-moves");
        
        // Info Modal Elements
        this.infoBtn = document.querySelector("#info-btn");
        this.closeInfoBtn = document.querySelector("#close-info-btn");
    }

    initializeGameState() {
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
            gameHistory: []
        };
        
        // Settings
        this.settings = {
            soundEnabled: true,
            theme: 'dark'
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
    }

    init() {
        this.bindEvents();
        this.loadGameData();
        this.showSetupModal();
        this.updateDisplay();
    }

    bindEvents() {
        // Game board events
        this.boxes.forEach((box, index) => {
            box.addEventListener('click', () => this.handleBoxClick(index));
            box.addEventListener('mouseenter', () => this.handleBoxHover(box, index));
            box.addEventListener('mouseleave', () => this.handleBoxLeave(box, index));
        });

        // Control events
        this.resetButton?.addEventListener('click', () => this.resetGame());
        this.changeNamesButton?.addEventListener('click', () => this.showSetupModal());
        this.soundToggle?.addEventListener('click', () => this.toggleSound());

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

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Save data on page unload
        window.addEventListener('beforeunload', () => this.saveGameData());
    }

    showSetupModal() {
        if (this.setupModal) {
            this.setupModal.classList.remove('hide');
            if (this.player1Input) {
                this.player1Input.focus();
                this.player1Input.value = this.players.X.name === 'Player 1' ? '' : this.players.X.name;
                this.player2Input.value = this.players.O.name === 'Player 2' ? '' : this.players.O.name;
            }
        }
    }

    startGame() {
        const player1Name = this.player1Input?.value.trim() || 'Player 1';
        const player2Name = this.player2Input?.value.trim() || 'Player 2';
        
        this.players.X.name = player1Name;
        this.players.O.name = player2Name;
        
        this.hideSetupModal();
        this.initializeGame();
    }

    quickStart() {
        this.players.X.name = 'Player 1';
        this.players.O.name = 'Player 2';
        
        this.hideSetupModal();
        this.initializeGame();
    }

    hideSetupModal() {
        if (this.setupModal) {
            this.setupModal.classList.add('hide');
        }
    }

    initializeGame() {
        this.gameState.gameActive = true;
        this.gameState.gameStartTime = Date.now();
        this.updateDisplay();
        this.playSound('gameStart');
    }

    handleBoxClick(index) {
        if (!this.gameState.gameActive || this.gameState.gameBoard[index] !== '') {
            return;
        }

        this.makeMove(index);
        this.checkGameResult();
    }

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

    clearBoxPreview(box) {
        box.classList.remove('preview');
        box.style.color = '';
    }

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

    handleDraw() {
        this.gameState.gameActive = false;
        this.showVictoryModal(null, null);
        this.updateGameStats();
        this.playSound('draw');
    }

    switchPlayer() {
        this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnIndicator();
    }

    highlightWinningCells(indices) {
        indices.forEach(index => {
            this.boxes[index].classList.add('winning');
        });
    }

    showVictoryModal(winner, pattern) {
        const gameTime = this.getGameDuration();
        
        if (winner) {
            this.victoryTitle.textContent = 'Congratulations!';
            this.victoryMessage.textContent = `${this.players[winner].name} Wins!`;
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

    showInfoModal() {
        if (this.infoModal) {
            this.infoModal.classList.remove('hide');
        }
    }

    closeInfoModal() {
        if (this.infoModal) {
            this.infoModal.classList.add('hide');
        }
    }

    nextRound() {
        this.gameState.round++;
        this.resetGame();
        this.closeModal();
    }

    startNewGame() {
        this.players.X.score = 0;
        this.players.O.score = 0;
        this.gameState.round = 1;
        this.resetGame();
        this.closeModal();
    }

    resetGame() {
        this.gameState.gameBoard = Array(9).fill('');
        this.gameState.gameActive = true;
        this.gameState.currentPlayer = 'X';
        this.gameState.moveCount = 0;
        this.gameState.gameStartTime = Date.now();
        
        // Reset boxes
        this.boxes.forEach(box => {
            box.textContent = '';
            box.disabled = false;
            box.className = 'box';
            box.style.color = '';
        });
        
        this.updateDisplay();
        this.playSound('reset');
    }

    handleBoxHover(box, index) {
        if (!this.gameState.gameActive || this.gameState.gameBoard[index] !== '') return;
        
        // Show preview of move
        if (!box.classList.contains('preview')) {
            box.style.color = this.gameState.currentPlayer === 'X' ? 
                'rgba(255, 107, 107, 0.5)' : 'rgba(78, 205, 196, 0.5)';
            box.textContent = this.gameState.currentPlayer;
            box.classList.add('preview');
        }
    }

    handleBoxLeave(box, index) {
        // Remove preview if box is empty
        if (this.gameState.gameBoard[index] === '' && box.classList.contains('preview')) {
            box.textContent = '';
            box.style.color = '';
            box.classList.remove('preview');
        }
    }

    handleKeyPress(e) {
        // Handle ESC key to close modals
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeInfoModal();
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

        // Handle Space key for sound toggle
        if (e.key === ' ') {
            e.preventDefault();
            this.toggleSound();
        }
    }

    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        if (this.soundIcon) {
            this.soundIcon.textContent = this.settings.soundEnabled ? '🔊' : '🔇';
        }
        this.playSound('toggle');
        this.saveGameData();
    }

    playSound(type) {
        if (!this.settings.soundEnabled) return;
        
        try {
            // Initialize audio context if needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const sounds = {
                move: { freq: 800, duration: 0.1 },
                win: { freq: 1000, duration: 0.3 },
                draw: { freq: 400, duration: 0.3 },
                reset: { freq: 600, duration: 0.15 },
                toggle: { freq: 500, duration: 0.1 },
                gameStart: { freq: 900, duration: 0.2 }
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

    updateDisplay() {
        // Update player names
        if (this.player1Display) this.player1Display.textContent = this.players.X.name;
        if (this.player2Display) this.player2Display.textContent = this.players.O.name;
        
        // Update scores
        if (this.scoreX) this.scoreX.textContent = this.players.X.score;
        if (this.scoreO) this.scoreO.textContent = this.players.O.score;
        
        // Update round
        if (this.roundNumber) this.roundNumber.textContent = this.gameState.round;
        
        // Update statistics
        if (this.gamesPlayed) this.gamesPlayed.textContent = this.stats.gamesPlayed;
        if (this.totalMoves) this.totalMoves.textContent = this.stats.totalMoves;
        
        // Update turn indicator
        this.updateTurnIndicator();
    }

    updateTurnIndicator() {
        const currentPlayerName = this.players[this.gameState.currentPlayer].name;
        
        if (this.turnIndicator) {
            this.turnIndicator.textContent = `${currentPlayerName}'s Turn`;
        }
        
        if (this.turnIcon) {
            this.turnIcon.textContent = this.gameState.currentPlayer === 'X' ? '✖' : '⭕';
        }
    }

    updateStatistics() {
        this.stats.totalMoves++;
        if (this.totalMoves) {
            this.totalMoves.textContent = this.stats.totalMoves;
        }
    }

    updateGameStats() {
        this.stats.gamesPlayed++;
        if (this.gamesPlayed) {
            this.gamesPlayed.textContent = this.stats.gamesPlayed;
        }
    }

    getGameDuration() {
        if (!this.gameState.gameStartTime) return 0;
        return Date.now() - this.gameState.gameStartTime;
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    saveGameData() {
        try {
            const gameData = {
                players: this.players,
                stats: this.stats,
                settings: this.settings,
                gameState: {
                    round: this.gameState.round
                }
            };
            localStorage.setItem('modernTicTacToeData', JSON.stringify(gameData));
        } catch (error) {
            console.warn('Failed to save game data:', error);
        }
    }

    loadGameData() {
        try {
            const savedData = localStorage.getItem('modernTicTacToeData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                if (data.players) {
                    this.players = { ...this.players, ...data.players };
                }
                
                if (data.stats) {
                    this.stats = { ...this.stats, ...data.stats };
                }
                
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    if (this.soundIcon) {
                        this.soundIcon.textContent = this.settings.soundEnabled ? '🔊' : '🔇';
                    }
                }
                
                if (data.gameState && data.gameState.round) {
                    this.gameState.round = data.gameState.round;
                }
            }
        } catch (error) {
            console.warn('Failed to load game data:', error);
        }
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
    new ModernTicTacToeGame();
});

// Add smooth page transitions
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.game-header, .game-main, .game-footer');
    elements.forEach((el, index) => {
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        }
    });
});

/*
===============================================================================
                              END OF SCRIPT
                         Modern Tic-Tac-Toe v2.0
                        © 2025 Modern Games Studio
===============================================================================
*/
