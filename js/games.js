// 小游戏功能模块

let currentGame = null;
let minesweeperState = {
    grid: [],
    rows: 9,
    cols: 9,
    mines: 10,
    flags: 0,
    gameOver: false,
    startTime: null,
    timerInterval: null,
    level: 'easy'
};

// --- 初始化与事件监听 ---

function initGames() {
    const gamesBtn = document.getElementById('chat-more-games-btn');
    if (gamesBtn) {
        gamesBtn.addEventListener('click', () => {
            document.getElementById('chat-more-panel').classList.add('hidden');
            openGameSelection();
        });
    }

    const closeSelectionBtn = document.getElementById('close-game-selection');
    if (closeSelectionBtn) {
        closeSelectionBtn.addEventListener('click', () => {
            document.getElementById('game-selection-modal').classList.add('hidden');
        });
    }

    const closeMinesweeperBtn = document.getElementById('close-minesweeper');
    if (closeMinesweeperBtn) {
        closeMinesweeperBtn.addEventListener('click', closeMinesweeper);
    }

    const minimizeMinesweeperBtn = document.getElementById('minimize-minesweeper');
    if (minimizeMinesweeperBtn) {
        minimizeMinesweeperBtn.addEventListener('click', minimizeMinesweeper);
    }

    const minesweeperMinimized = document.getElementById('minesweeper-minimized');
    if (minesweeperMinimized) {
        minesweeperMinimized.addEventListener('click', (e) => {
            // Check if it was a drag or a click
            if (minesweeperMinimized.dataset.isDragging === 'true') {
                return;
            }
            restoreMinesweeper();
        });
        makeDraggable(minesweeperMinimized, minesweeperMinimized);
    }

    const msFaceBtn = document.getElementById('ms-face-btn');
    if (msFaceBtn) {
        msFaceBtn.addEventListener('click', () => startMinesweeper(minesweeperState.level));
    }

    const levelBtns = document.querySelectorAll('.ms-level-btn');
    levelBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            levelBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            startMinesweeper(e.target.dataset.level);
        });
    });

    const msWindow = document.getElementById('minesweeper-window');
    const msHeader = document.getElementById('minesweeper-header');
    if (msWindow && msHeader) {
        makeDraggable(msWindow, msHeader);
    }

    // Minesweeper Mode Selection Listeners
    const msModeSoloBtn = document.getElementById('ms-mode-solo');
    if (msModeSoloBtn) {
        msModeSoloBtn.addEventListener('click', () => {
            document.getElementById('minesweeper-mode-modal').classList.add('hidden');
            startMinesweeper();
        });
    }

    const msModeCoopBtn = document.getElementById('ms-mode-coop');
    if (msModeCoopBtn) {
        msModeCoopBtn.addEventListener('click', () => {
            document.getElementById('minesweeper-mode-modal').classList.add('hidden');
            handleMinesweeperCoop();
        });
    }
    
    const closeModeBtn = document.getElementById('close-minesweeper-mode');
    if (closeModeBtn) {
        closeModeBtn.addEventListener('click', () => {
            document.getElementById('minesweeper-mode-modal').classList.add('hidden');
        });
    }

    const closePickerBtn = document.getElementById('close-contact-picker');
    if (closePickerBtn) {
        closePickerBtn.addEventListener('click', () => {
            document.getElementById('contact-picker-modal').classList.add('hidden');
        });
    }

    const msAiHelpBtn = document.getElementById('ms-ai-help-btn');
    if (msAiHelpBtn) {
        msAiHelpBtn.addEventListener('click', () => {
            if (window.sendMessage) window.sendMessage("帮我玩一下", true, "text");
            setTimeout(() => {
                if (window.generateAiReply) window.generateAiReply();
            }, 500);
        });
    }
}

function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    handle.onmousedown = dragMouseDown;
    handle.ontouchstart = dragMouseDown;

    function dragMouseDown(e) {
        element.dataset.isDragging = 'false'; // Reset drag state
        e = e || window.event;
        // get the mouse cursor position at startup:
        if (e.type === 'touchstart') {
            pos3 = e.touches[0].clientX;
            pos4 = e.touches[0].clientY;
        } else {
            // e.preventDefault(); // Remove preventDefault to allow click if no drag
            pos3 = e.clientX;
            pos4 = e.clientY;
        }
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        document.ontouchend = closeDragElement;
        document.ontouchmove = elementDrag;
    }

    function elementDrag(e) {
        element.dataset.isDragging = 'true'; // Mark as dragging
        e = e || window.event;
        e.preventDefault(); // Prevent default only during drag
        // calculate the new cursor position:
        let clientX, clientY;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        pos1 = pos3 - clientX;
        pos2 = pos4 - clientY;
        pos3 = clientX;
        pos4 = clientY;
        // set the element's new position:
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
    }
}

function minimizeMinesweeper() {
    // Animate minimize
    const windowEl = document.getElementById('minesweeper-window');
    const minimizedIcon = document.getElementById('minesweeper-minimized');
    
    windowEl.classList.add('ms-window-hidden');
    minimizedIcon.classList.remove('ms-icon-hidden');
}

function restoreMinesweeper() {
    const windowEl = document.getElementById('minesweeper-window');
    const minimizedIcon = document.getElementById('minesweeper-minimized');
    
    windowEl.classList.remove('ms-window-hidden');
    minimizedIcon.classList.add('ms-icon-hidden');
}

function openGameSelection() {
    document.getElementById('game-selection-modal').classList.remove('hidden');
}

window.openMinesweeperModeSelection = function() {
    document.getElementById('game-selection-modal').classList.add('hidden');
    document.getElementById('minesweeper-mode-modal').classList.remove('hidden');
};

function handleMinesweeperCoop() {
    if (window.iphoneSimState.currentChatContactId) {
        startMinesweeperWithContact(window.iphoneSimState.currentChatContactId);
    } else {
        openContactPickerForGame();
    }
}

function openContactPickerForGame() {
    const modal = document.getElementById('contact-picker-modal');
    const list = document.getElementById('contact-picker-list');
    const sendBtn = document.getElementById('contact-picker-send-btn');
    
    if (!list) return;
    list.innerHTML = '';
    
    if (!window.iphoneSimState.contacts || window.iphoneSimState.contacts.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">暂无联系人</div>';
    } else {
        window.iphoneSimState.contacts.forEach(contact => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.style.cursor = 'pointer';
            item.innerHTML = `
                <div class="list-content" style="align-items: center;">
                    <img src="${contact.avatar}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; object-fit: cover;">
                    <span>${contact.remark || contact.name}</span>
                </div>
            `;
            item.onclick = () => {
                modal.classList.add('hidden');
                // Open chat and start game
                document.getElementById('wechat-app').classList.remove('hidden');
                if (window.openChat) {
                    window.openChat(contact.id);
                }
                setTimeout(() => {
                    startMinesweeperWithContact(contact.id);
                }, 500);
            };
            list.appendChild(item);
        });
    }
    
    if (sendBtn) sendBtn.style.display = 'none'; // Hide default send button
    
    modal.classList.remove('hidden');
}

function startMinesweeperWithContact(contactId) {
    if (window.sendMessage) {
        window.sendMessage('[邀请你玩扫雷]', true, 'minesweeper_invite');
    }
    
    startMinesweeper();
    
    setTimeout(() => {
        if (window.generateAiReply) window.generateAiReply("用户邀请你玩扫雷。你可以通过回复 ACTION: MINESWEEPER_CLICK: row,col 来进行操作。");
    }, 1000);
}

window.getMinesweeperGameState = function() {
    if (!minesweeperState.grid || minesweeperState.grid.length === 0) return "Game not started.";
    
    let board = `Minesweeper Board (${minesweeperState.rows}x${minesweeperState.cols}), Mines: ${minesweeperState.mines - minesweeperState.flags}\n`;
    board += "   ";
    for (let c = 0; c < minesweeperState.cols; c++) board += (c % 10) + " "; 
    board += "\n";
    
    for (let r = 0; r < minesweeperState.rows; r++) {
        board += (r % 10) + "  "; 
        for (let c = 0; c < minesweeperState.cols; c++) {
            const cell = minesweeperState.grid[r][c];
            if (cell.isRevealed) {
                if (cell.isMine) board += "* ";
                else board += cell.neighborMines + " ";
            } else if (cell.isFlagged) {
                board += "F ";
            } else {
                board += "? ";
            }
        }
        board += "\n";
    }
    return board;
};

window.handleAiMinesweeperMove = function(command, r, c) {
    r = parseInt(r);
    c = parseInt(c);
    
    if (isNaN(r) || isNaN(c)) return;
    if (r < 0 || r >= minesweeperState.rows || c < 0 || c >= minesweeperState.cols) return;
    
    // Highlight cell
    const cellEl = document.querySelector(`.ms-cell[data-row="${r}"][data-col="${c}"]`);
    if (cellEl) {
        const originalBorder = cellEl.style.border;
        cellEl.style.border = '2px solid #007AFF';
        cellEl.style.zIndex = '10';
        
        setTimeout(() => {
            cellEl.style.border = originalBorder;
            cellEl.style.zIndex = '';
            if (command === 'CLICK' || command === 'REVEAL') {
                revealCell(r, c);
            } else if (command === 'FLAG') {
                toggleFlag(r, c);
            }
        }, 800);
    }
};

// --- 扫雷游戏逻辑 ---

window.startMinesweeper = function(level = 'easy') {
    document.getElementById('game-selection-modal').classList.add('hidden');
    const modal = document.getElementById('minesweeper-modal');
    modal.classList.remove('hidden');
    
    // Reset minimize state
    const windowEl = document.getElementById('minesweeper-window');
    const minimizedIcon = document.getElementById('minesweeper-minimized');
    
    windowEl.classList.remove('ms-window-hidden');
    minimizedIcon.classList.add('ms-icon-hidden');
    
    // 设置难度
    
    // 设置难度
    minesweeperState.level = level;
    if (level === 'easy') {
        minesweeperState.rows = 9;
        minesweeperState.cols = 9;
        minesweeperState.mines = 10;
    } else if (level === 'medium') {
        minesweeperState.rows = 16;
        minesweeperState.cols = 16;
        minesweeperState.mines = 40;
    } else if (level === 'hard') {
        minesweeperState.rows = 16;
        minesweeperState.cols = 30; // 移动端可能需要适配宽度，暂定 16x16 或调整css
        // 为了适应手机竖屏，Hard 模式也许可以是 24x12? 
        // 经典高级是 16x30。这里为了 UI 适配，如果是竖屏手机，可能需要调整。
        // 考虑到容器宽度，这里先限制一下。
        minesweeperState.rows = 20;
        minesweeperState.cols = 15;
        minesweeperState.mines = 50;
    }

    resetMinesweeper();
    renderMinesweeperGrid();
};

function closeMinesweeper() {
    document.getElementById('minesweeper-modal').classList.add('hidden');
    if (minesweeperState.timerInterval) clearInterval(minesweeperState.timerInterval);
}

function resetMinesweeper() {
    if (minesweeperState.timerInterval) clearInterval(minesweeperState.timerInterval);
    minesweeperState.timerInterval = null;
    minesweeperState.startTime = null;
    minesweeperState.gameOver = false;
    minesweeperState.flags = 0;
    minesweeperState.grid = [];

    // 更新 UI
    document.getElementById('ms-mines-count').textContent = formatNumber(minesweeperState.mines);
    document.getElementById('ms-timer').textContent = '000';
    document.getElementById('ms-face-btn').textContent = '🙂';

    // 初始化网格数据
    for (let r = 0; r < minesweeperState.rows; r++) {
        const row = [];
        for (let c = 0; c < minesweeperState.cols; c++) {
            row.push({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            });
        }
        minesweeperState.grid.push(row);
    }

    // 布雷
    let minesPlaced = 0;
    while (minesPlaced < minesweeperState.mines) {
        const r = Math.floor(Math.random() * minesweeperState.rows);
        const c = Math.floor(Math.random() * minesweeperState.cols);
        if (!minesweeperState.grid[r][c].isMine) {
            minesweeperState.grid[r][c].isMine = true;
            minesPlaced++;
        }
    }

    // 计算邻居雷数
    for (let r = 0; r < minesweeperState.rows; r++) {
        for (let c = 0; c < minesweeperState.cols; c++) {
            if (!minesweeperState.grid[r][c].isMine) {
                minesweeperState.grid[r][c].neighborMines = countNeighborMines(r, c);
            }
        }
    }
}

function countNeighborMines(r, c) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const nr = r + i;
            const nc = c + j;
            if (nr >= 0 && nr < minesweeperState.rows && nc >= 0 && nc < minesweeperState.cols) {
                if (minesweeperState.grid[nr][nc].isMine) count++;
            }
        }
    }
    return count;
}

function renderMinesweeperGrid() {
    const gridEl = document.getElementById('ms-grid');
    gridEl.innerHTML = '';
    
    // 设置 CSS Grid
    gridEl.style.gridTemplateColumns = `repeat(${minesweeperState.cols}, 1fr)`;
    
    // 动态调整格子大小以适应屏幕
    // 对于移动端，最大宽度限制为 320px
    const containerWidth = 320; 
    const gap = 4; // 间隙
    const totalGap = (minesweeperState.cols - 1) * gap;
    const cellSize = (containerWidth - totalGap) / minesweeperState.cols;
    
    gridEl.style.width = '100%';
    gridEl.style.justifyContent = 'center';
    
    for (let r = 0; r < minesweeperState.rows; r++) {
        for (let c = 0; c < minesweeperState.cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'ms-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            // Modern styling
            cell.style.width = '100%';
            cell.style.aspectRatio = '1/1';
            cell.style.borderRadius = '4px';
            cell.style.backgroundColor = '#E5E5EA'; // iOS gray
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = '14px';
            cell.style.fontWeight = '600';
            cell.style.cursor = 'pointer';
            cell.style.transition = 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
            cell.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            
            // 移动端适配：长按插旗
            let touchTimer = null;
            cell.addEventListener('touchstart', (e) => {
                if (minesweeperState.gameOver || minesweeperState.grid[r][c].isRevealed) return;
                touchTimer = setTimeout(() => {
                    e.preventDefault();
                    toggleFlag(r, c);
                    // Haptic feedback if available
                    if (navigator.vibrate) navigator.vibrate(50);
                }, 400);
            });
            
            cell.addEventListener('touchend', () => {
                if (touchTimer) clearTimeout(touchTimer);
            });

            cell.addEventListener('click', () => {
                if (minesweeperState.gameOver) return;
                // 如果已插旗，不可点击
                if (minesweeperState.grid[r][c].isFlagged) return;
                revealCell(r, c);
            });

            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (minesweeperState.gameOver || minesweeperState.grid[r][c].isRevealed) return;
                toggleFlag(r, c);
            });

            gridEl.appendChild(cell);
        }
    }
}

function revealCell(r, c) {
    const cellData = minesweeperState.grid[r][c];
    if (cellData.isRevealed || cellData.isFlagged) return;

    // 开始计时
    if (!minesweeperState.startTime) {
        minesweeperState.startTime = Date.now();
        minesweeperState.timerInterval = setInterval(updateTimer, 1000);
    }

    cellData.isRevealed = true;
    updateCellUI(r, c);

    if (cellData.isMine) {
        gameOver(false);
    } else {
        if (cellData.neighborMines === 0) {
            // 递归揭开
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const nr = r + i;
                    const nc = c + j;
                    if (nr >= 0 && nr < minesweeperState.rows && nc >= 0 && nc < minesweeperState.cols) {
                        revealCell(nr, nc);
                    }
                }
            }
        }
        checkWin();
    }
}

function toggleFlag(r, c) {
    const cellData = minesweeperState.grid[r][c];
    if (cellData.isRevealed) return;

    if (cellData.isFlagged) {
        cellData.isFlagged = false;
        minesweeperState.flags--;
    } else {
        if (minesweeperState.flags < minesweeperState.mines) {
            cellData.isFlagged = true;
            minesweeperState.flags++;
        } else {
            return; // 旗子用完了
        }
    }
    
    updateCellUI(r, c);
    document.getElementById('ms-mines-count').textContent = minesweeperState.mines - minesweeperState.flags;
}

function updateCellUI(r, c) {
    const cell = document.querySelector(`.ms-cell[data-row="${r}"][data-col="${c}"]`);
    const data = minesweeperState.grid[r][c];

    // Reset styles first
    cell.style.boxShadow = 'none';
    cell.style.transform = 'scale(1)';

    if (data.isRevealed) {
        cell.style.backgroundColor = '#fff'; // White for revealed
        cell.style.border = '1px solid #f0f0f0';
        
        if (data.isMine) {
            cell.style.backgroundColor = '#FF3B30'; // iOS Red
            cell.style.border = 'none';
            cell.textContent = '💣';
            cell.style.color = '#fff';
        } else {
            if (data.neighborMines > 0) {
                cell.textContent = data.neighborMines;
                cell.style.color = getNumberColor(data.neighborMines);
            } else {
                cell.textContent = '';
            }
        }
    } else if (data.isFlagged) {
        cell.style.backgroundColor = '#FF9500'; // iOS Orange
        cell.textContent = '🚩';
        cell.style.color = '#fff';
        cell.style.border = 'none';
    } else {
        cell.textContent = '';
        cell.style.backgroundColor = '#E5E5EA';
        cell.style.border = 'none';
        cell.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
    }
}

function getNumberColor(n) {
    const colors = ['blue', 'green', 'red', 'darkblue', 'brown', 'cyan', 'black', 'gray'];
    return colors[n - 1] || 'black';
}

function gameOver(win) {
    minesweeperState.gameOver = true;
    if (minesweeperState.timerInterval) clearInterval(minesweeperState.timerInterval);

    document.getElementById('ms-face-btn').textContent = win ? '😎' : '😵';

    if (!win) {
        // 显示所有雷
        for (let r = 0; r < minesweeperState.rows; r++) {
            for (let c = 0; c < minesweeperState.cols; c++) {
                if (minesweeperState.grid[r][c].isMine) {
                    minesweeperState.grid[r][c].isRevealed = true;
                    updateCellUI(r, c);
                }
            }
        }
    } else {
        showVictoryAnimation();
    }
}

function showVictoryAnimation() {
    const windowEl = document.getElementById('minesweeper-window');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'victory-overlay';
    
    // Create content
    const content = `
        <div class="victory-emoji">🏆</div>
        <div class="victory-title">Victory!</div>
        <div style="font-size: 16px; color: #666; font-weight: 500;">
            Time: ${document.getElementById('ms-timer').textContent}s
        </div>
        <button id="ms-restart-btn" style="margin-top: 20px; padding: 10px 30px; background: #007AFF; color: white; border: none; border-radius: 20px; font-weight: 600; font-size: 16px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,122,255,0.3);">
            Play Again
        </button>
    `;
    overlay.innerHTML = content;
    
    // Add confetti
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'ms-confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'][Math.floor(Math.random() * 8)];
        confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';
        overlay.appendChild(confetti);
    }
    
    windowEl.appendChild(overlay);
    
    // Bind restart button
    document.getElementById('ms-restart-btn').addEventListener('click', () => {
        overlay.remove();
        startMinesweeper(minesweeperState.level);
    });
}

function checkWin() {
    let revealedCount = 0;
    for (let r = 0; r < minesweeperState.rows; r++) {
        for (let c = 0; c < minesweeperState.cols; c++) {
            if (minesweeperState.grid[r][c].isRevealed) revealedCount++;
        }
    }
    
    if (revealedCount === (minesweeperState.rows * minesweeperState.cols - minesweeperState.mines)) {
        gameOver(true);
    }
}

function updateTimer() {
    const now = Date.now();
    const diff = Math.floor((now - minesweeperState.startTime) / 1000);
    const display = diff > 999 ? 999 : diff;
    document.getElementById('ms-timer').textContent = formatNumber(display);
}

function formatNumber(num) {
    return num.toString().padStart(3, '0');
}

// 注册初始化
if (window.appInitFunctions) {
    window.appInitFunctions.push(initGames);
} else {
    window.appInitFunctions = [initGames];
}
