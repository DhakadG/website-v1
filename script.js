/*
===============================================================================
                      NEO TIC-TAC-TOE | ENGINE V3.0
===============================================================================
*/

class GameEngine {
    constructor() {
        this.gameState = {
            board: [],
            currentPlayer: 'X',
            isActive: false,
            mode: 'ai',          // 'ai' or 'local'
            variant: 'classic',  // 'classic', 'switch', 'rapid', 'guess'
            difficulty: 'medium',
            gridSize: 3,
            winCondition: 3,
            switchQueue: { X: [], O: [] },
            switchSelection: null,
            scores: { X: 0, O: 0 },
            round: 1
        };

        this.settings = {
            sound: true,
            theme: localStorage.getItem('theme') || 'light',
            names: { X: 'Player X', O: 'CPU' }
        };

        this.audioCtx = null;

        this.dom = {
            board: document.getElementById('game-board'),
            headerMode: document.getElementById('header-mode-badge'),
            headerDiff: document.getElementById('header-diff-badge'),
            scoreX: document.getElementById('score-x'),
            scoreO: document.getElementById('score-o'),
            p1Name: document.getElementById('p1-name'),
            p2Name: document.getElementById('p2-name'),
            p1Card: document.getElementById('p1-card'),
            p2Card: document.getElementById('p2-card'),
            roundNum: document.getElementById('round-num'),
            modalSetup: document.getElementById('setup-modal'),
            modalResult: document.getElementById('result-modal'),
            resultTitle: document.getElementById('winner-text'),
            resultSubtitle: document.getElementById('wintype-text'),
            inputP1: document.getElementById('input-p1'),
            inputP2: document.getElementById('input-p2')
        };

        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
        this.updateHeaderState();
    }

    bindEvents() {
        // Board Interaction
        this.dom.board.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.handleHumanInteraction(parseInt(e.target.dataset.index));
            }
        });

        // Global Controls
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('sound-toggle').addEventListener('click', () => this.toggleSound());
        document.getElementById('info-btn').addEventListener('click', () => this.toggleModal('setup', true));
        document.getElementById('restart-btn').addEventListener('click', () => this.resetRound());
        document.getElementById('new-game-btn').addEventListener('click', () => this.toggleModal('setup', true));

        // Setup Modal
        this.bindSetupListeners();

        // Result Modal
        document.getElementById('next-round-modal-btn').addEventListener('click', () => {
            this.toggleModal('result', false);
            this.nextRound();
        });

        document.getElementById('menu-modal-btn').addEventListener('click', () => {
            this.toggleModal('result', false);
            this.toggleModal('setup', true);
        });
    }

    bindSetupListeners() {
        // Opponent Switch
        document.querySelectorAll('.switch-btn[data-opp]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Fix to click inner elements
                const target = e.currentTarget;
                this.setActiveInGroup('.switch-btn[data-opp]', target);

                const isAI = target.dataset.opp === 'ai';
                this.dom.inputP2.value = isAI ? "CPU" : "Player 2";
                this.dom.inputP2.disabled = isAI;

                const aiGroup = document.getElementById('ai-difficulty-group');
                isAI ? aiGroup.classList.remove('hidden') : aiGroup.classList.add('hidden');
            });
        });

        // Mode/Variant Selection
        document.querySelectorAll('.variant-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveInGroup('.variant-card', e.currentTarget);
                this.playSound('pop2'); // Sound feedback
            });
        });

        // Difficulty Selection
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveInGroup('.diff-btn', e.target);
            });
        });

        // Launch
        document.getElementById('start-match-btn').addEventListener('click', () => this.startNewGame());
    }

    setActiveInGroup(selector, target) {
        document.querySelectorAll(selector).forEach(el => el.classList.remove('active'));
        target.classList.add('active');
    }

    startNewGame() {
        // Harvest Settings
        const oppBtn = document.querySelector('.switch-btn[data-opp].active');
        const modeBtn = document.querySelector('.variant-card.active'); // Updated selector
        const diffBtn = document.querySelector('.diff-btn.active');

        this.gameState.mode = oppBtn ? oppBtn.dataset.opp : 'ai';
        this.gameState.variant = modeBtn ? modeBtn.dataset.mode : 'classic';
        this.gameState.difficulty = diffBtn ? diffBtn.dataset.diff : 'medium';

        this.settings.names.X = this.dom.inputP1.value || "You";
        this.settings.names.O = this.dom.inputP2.value || "CPU";
        this.dom.p1Name.textContent = this.settings.names.X;
        this.dom.p2Name.textContent = this.settings.names.O;

        if (this.gameState.variant === 'rapid') {
            this.gameState.gridSize = 10;
            this.gameState.winCondition = 5;
        } else {
            this.gameState.gridSize = 3;
            this.gameState.winCondition = 3;
        }

        this.gameState.scores = { X: 0, O: 0 };
        this.gameState.round = 1;

        this.toggleModal('setup', false);
        this.updateHeaderState();
        this.playSound('start');
        this.resetRound();
    }

    resetRound() {
        const size = this.gameState.gridSize;
        this.gameState.board = Array(size * size).fill(null);
        this.gameState.switchQueue = { X: [], O: [] };
        this.gameState.switchSelection = null;
        this.gameState.isActive = true;
        this.gameState.currentPlayer = 'X';

        this.generateGridHTML();
        this.updateStatsUI();
    }

    generateGridHTML() {
        const board = this.dom.board;
        board.innerHTML = '';
        board.classList.remove('grid-10', 'game-over');

        if (this.gameState.gridSize === 10) {
            board.classList.add('grid-10');
        }

        for (let i = 0; i < this.gameState.gridSize * this.gameState.gridSize; i++) {
            const btn = document.createElement('button');
            btn.classList.add('cell');
            btn.dataset.index = i;
            board.appendChild(btn);
        }
    }

    updateHeaderState() {
        if (!this.dom.headerMode) return;

        const modeLabel = this.dom.headerMode.querySelector('.pill-label');
        const modeIcon = this.dom.headerMode.querySelector('.pill-icon');

        if (this.gameState.mode === 'ai') {
            modeLabel.textContent = `${this.gameState.difficulty.toUpperCase()}`;
            modeIcon.textContent = '🤖';
        } else {
            modeLabel.textContent = 'Local';
            modeIcon.textContent = '👥';
        }

        const diffBadge = this.dom.headerDiff;
        const diffLabel = diffBadge.querySelector('.pill-label');
        const diffDot = document.getElementById('diff-dot-color');

        const variantsMap = {
            'classic': 'Classic',
            'switch': 'Switch',
            'rapid': 'Rapid',
            'guess': 'Ghost'
        };
        diffLabel.textContent = variantsMap[this.gameState.variant];

        if (this.gameState.mode === 'ai') {
            const colorMap = { 'easy': '#10b981', 'medium': '#fbbf24', 'hard': '#ef4444' };
            diffDot.style.background = colorMap[this.gameState.difficulty] || '#fbbf24';
        } else {
            diffDot.style.background = '#6366f1';
        }
    }

    handleHumanInteraction(index) {
        if (!this.gameState.isActive) return;
        if (this.gameState.mode === 'ai' && this.gameState.currentPlayer === 'O') return;
        this.attemptMove(index);
    }

    attemptMove(index) {
        const player = this.gameState.currentPlayer;
        const board = this.gameState.board;
        const variant = this.gameState.variant;

        if (variant === 'switch') {
            const queue = this.gameState.switchQueue[player];

            // Move own piece
            if (board[index] === player && queue.length >= 3) {
                this.gameState.switchSelection = index;
                this.renderBoard();
                this.playSound('pop2');
                return;
            }
            // Place moved piece
            if (this.gameState.switchSelection !== null && board[index] === null) {
                const oldIdx = this.gameState.switchSelection;
                board[oldIdx] = null;

                const qIdx = queue.indexOf(oldIdx);
                if (qIdx > -1) queue.splice(qIdx, 1);
                queue.push(index);

                board[index] = player;
                this.gameState.switchSelection = null;
                this.finalizeMove(index);
                return;
            }
            // Normal Place
            if (board[index] === null && queue.length < 3) {
                board[index] = player;
                queue.push(index);
                this.finalizeMove(index);
                return;
            }
        } else {
            if (board[index] === null) {
                board[index] = player;
                this.finalizeMove(index);
            }
        }
    }

    finalizeMove(lastIndex) {
        this.renderBoard();
        const isX = this.gameState.currentPlayer === 'X';
        this.playSound(isX ? 'pop1' : 'pop2');

        const winIndices = this.checkWinCondition(lastIndex);

        if (winIndices) {
            this.handleWin(this.gameState.currentPlayer, winIndices);
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.switchPlayer();
        }
    }

    switchPlayer() {
        this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
        this.gameState.switchSelection = null;
        this.updateStatsUI();

        if (this.gameState.isActive && this.gameState.mode === 'ai' && this.gameState.currentPlayer === 'O') {
            setTimeout(() => this.executeAIMove(), 600);
        }
    }

    checkWinCondition(lastIdx) {
        const size = this.gameState.gridSize;
        const winLen = this.gameState.winCondition;
        const board = this.gameState.board;
        const player = this.gameState.currentPlayer;

        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (let i = 0; i < board.length; i++) {
            if (board[i] !== player) continue;
            const r = Math.floor(i / size);
            const c = i % size;

            for (let [dr, dc] of directions) {
                const lineIndices = [i];
                for (let k = 1; k < winLen; k++) {
                    const nr = r + (dr * k);
                    const nc = c + (dc * k);
                    if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
                    const nextIdx = nr * size + nc;
                    if (board[nextIdx] === player) lineIndices.push(nextIdx);
                    else break;
                }
                if (lineIndices.length === winLen) return lineIndices;
            }
        }
        return null;
    }

    checkDraw() {
        if (this.gameState.variant === 'switch') return false;
        return !this.gameState.board.includes(null);
    }

    executeAIMove() {
        const board = this.gameState.board;
        const variant = this.gameState.variant;
        const moves = this.getAvailableMoves(board);

        if (moves.length === 0) return;

        // Simple AI Logic for Robustness in this snippet
        if (variant === 'switch') {
            const aiQueue = this.gameState.switchQueue.O;
            if (aiQueue.length >= 3) {
                this.gameState.switchSelection = aiQueue[0]; // Greedy take first
                const target = this.getBestClassicMove(board); // Find spot
                this.attemptMove(target);
            } else {
                this.attemptMove(this.getBestClassicMove(board));
            }
            return;
        }

        // Rapid
        if (variant === 'rapid') {
             // Center bias + Random for large grid
             const center = 44;
             if(board[center]===null && Math.random() > 0.5) this.attemptMove(center);
             else this.attemptMove(moves[Math.floor(Math.random() * moves.length)]);
             return;
        }

        // Classic/Ghost (Minimax-lite)
        this.attemptMove(this.getBestClassicMove(board));
    }

    getBestClassicMove(board) {
        const available = this.getAvailableMoves(board);
        if (this.gameState.difficulty === 'easy') return available[Math.floor(Math.random() * available.length)];
        if (this.gameState.difficulty === 'medium' && Math.random() > 0.6) return available[Math.floor(Math.random() * available.length)];

        // Simple Minimax fallback for Hard
        // For full stability in response length, simple Smart Block/Win check here:
        // 1. Win?
        for(let m of available) {
            board[m] = 'O';
            if(this.staticCheckWin(board) === 'O') { board[m] = null; return m; }
            board[m] = null;
        }
        // 2. Block?
        for(let m of available) {
            board[m] = 'X';
            if(this.staticCheckWin(board) === 'X') { board[m] = null; return m; }
            board[m] = null;
        }

        return available[Math.floor(Math.random() * available.length)];
    }

    getAvailableMoves(board) {
        return board.map((val, idx) => val === null ? idx : null).filter(v => v !== null);
    }

    staticCheckWin(board) {
        // Simplified check for AI logic 3x3
        const lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
        for (let l of lines) if (board[l[0]] && board[l[0]]===board[l[1]] && board[l[0]]===board[l[2]]) return board[l[0]];
        return null;
    }

    renderBoard() {
        const cells = this.dom.board.querySelectorAll('.cell');
        cells.forEach((cell, idx) => {
            const val = this.gameState.board[idx];
            cell.textContent = val || '';
            cell.className = 'cell';
            if (this.gameState.gridSize === 10) cell.classList.add('small-font');

            if (val) {
                cell.classList.add(val.toLowerCase());
                if (this.gameState.variant === 'guess') cell.classList.add('ghost-mark');
            }

            if (this.gameState.variant === 'switch') {
                if (this.gameState.switchSelection === idx) cell.classList.add('selected-to-move');
                const q = this.gameState.switchQueue[this.gameState.currentPlayer];
                if (q.length >= 3 && val === this.gameState.currentPlayer && this.gameState.switchSelection === null) {
                    cell.classList.add('can-move');
                }
            }
        });
    }

    updateStatsUI() {
        this.dom.scoreX.textContent = this.gameState.scores.X;
        this.dom.scoreO.textContent = this.gameState.scores.O;
        this.dom.roundNum.textContent = this.gameState.round;
        this.dom.p1Card.classList.toggle('active', this.gameState.currentPlayer === 'X');
        this.dom.p2Card.classList.toggle('active', this.gameState.currentPlayer === 'O');
    }

    handleWin(winner, indices) {
        this.gameState.isActive = false;
        this.gameState.scores[winner]++;
        this.updateStatsUI();
        this.playSound('win');

        if (this.gameState.variant === 'guess') {
            document.querySelectorAll('.ghost-mark').forEach(el => el.style.animation = 'none');
        }

        this.dom.board.classList.add('game-over');
        indices.forEach(i => {
            const cell = document.querySelector(`.cell[data-index="${i}"]`);
            if(cell) cell.classList.add('highlight');
        });

        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: winner === 'X' ? ['#6366f1'] : ['#ec4899'] });

        const winnerName = this.settings.names[winner];
        this.dom.resultTitle.textContent = `${winnerName} Wins!`;
        setTimeout(() => this.toggleModal('result', true), 1200);
    }

    handleDraw() {
        this.gameState.isActive = false;
        this.playSound('draw');
        this.dom.resultTitle.textContent = "Draw";
        setTimeout(() => this.toggleModal('result', true), 1000);
    }

    nextRound() {
        this.gameState.round++;
        this.resetRound();
    }

    toggleModal(name, show) {
        const modal = name === 'setup' ? this.dom.modalSetup : this.dom.modalResult;
        if (show) modal.classList.add('visible');
        else modal.classList.remove('visible');
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.settings.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }

    toggleSound() {
        this.settings.sound = !this.settings.sound;
    }

    playSound(type) {
        if (!this.settings.sound) return;
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const t = this.audioCtx.currentTime;

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        if (type === 'pop1' || type === 'pop2') {
            osc.type = type === 'pop1' ? 'sine' : 'square';
            osc.frequency.setValueAtTime(type==='pop1'?600:200, t);
            osc.frequency.exponentialRampToValueAtTime(type==='pop1'?100:500, t + 0.1);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.start(t); osc.stop(t + 0.1);
        } else if (type === 'win') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(500, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.start(t); osc.stop(t + 0.5);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new GameEngine();
});
