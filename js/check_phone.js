// 查手机功能模块 (Phone Check App)

// 配置常量
const PHONE_GRID_ROWS = 6;
const PHONE_GRID_COLS = 4;
const PHONE_SLOTS_PER_PAGE = PHONE_GRID_ROWS * PHONE_GRID_COLS;

// 状态变量
let isPhoneEditMode = false;
let currentPhonePage = 0;
let totalPhonePages = 2;
let phoneScreenData = []; // 当前显示的查手机页面数据

// DOM 元素引用
let phonePagesWrapper;
let phonePagesContainer;
let phonePageIndicators;
let phoneLibraryModal;

// 缓存 DOM 元素
let phoneItemElementMap = new Map();

// 拖拽相关
let phoneDragItem = null;
let lastPhoneDragTargetIndex = -1;
let phoneDragThrottleTimer = null;
let isPhoneDropped = false;
let phonePageSwitchTimer = null;

// 长按相关
let phoneLongPressTimer = null;
let phoneTouchStartPos = { x: 0, y: 0 };
let phoneTouchCurrentPos = { x: 0, y: 0 };
let isPhoneTouchDragging = false;
let phoneTouchDragClone = null;
let phoneTouchDraggedElement = null;
let phoneTouchDraggedItem = null;

// 查手机当前联系人
let currentCheckPhoneContactId = null;

// --- 辅助函数：生成本地头像和图片 ---
function getSmartAvatar(name) {
    const initial = (name || 'U').charAt(0).toUpperCase();
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];
    const color = colors[name ? name.length % colors.length : 0];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${color}"/><text x="50" y="50" dy=".35em" text-anchor="middle" fill="white" font-size="50" font-family="sans-serif">${initial}</text></svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function getSmartImage(text) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f0f0f0"/><text x="50%" y="50%" dy=".3em" text-anchor="middle" fill="#ccc" font-size="40" font-family="sans-serif">${text || 'Image'}</text></svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

// --- 初始化 ---

function initPhoneGrid() {
    phonePagesWrapper = document.getElementById('phone-pages-wrapper');
    phonePagesContainer = document.getElementById('phone-pages-container');
    phonePageIndicators = document.getElementById('phone-page-indicators');
    phoneLibraryModal = document.getElementById('phone-widget-library-modal');

    // 初始化全局状态
    if (!window.iphoneSimState.phoneLayouts) window.iphoneSimState.phoneLayouts = {};
    if (!window.iphoneSimState.phoneContent) window.iphoneSimState.phoneContent = {};

    // 绑定按钮事件
    setupPhoneListeners();

    // 注入查手机专用样式，修复底部空隙问题
    const style = document.createElement('style');
    style.innerHTML = `
        /* 查手机-微信底栏全宽适配 */
        #phone-wechat .wechat-tab-bar {
            width: 100% !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
            background-color: #f7f7f7 !important;
            border-top: 1px solid rgba(0,0,0,0.1) !important;
            box-shadow: none !important;
        }
        
        /* 查手机-联系人选择弹窗半屏高度优化 */
        #phone-contact-select-modal .modal-content {
            min-height: 60vh !important;
            padding-bottom: max(20px, env(safe-area-inset-bottom)) !important;
        }

        /* 查手机-主屏幕高度适配 */
        #phone-pages-container {
            height: 100% !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
        }
    `;
    document.head.appendChild(style);

    // 覆盖全局 handleAppClick 以拦截查手机应用
    if (window.handleAppClick) {
        const originalHandleAppClick = window.handleAppClick;
        window.handleAppClick = function(appId, appName) {
            if (appId === 'phone-app') {
                openPhoneCheckContactModal();
            } else if (appId === 'phone-wechat') {
                document.getElementById('phone-wechat').classList.remove('hidden');
                // 初始化 Tab 和按钮状态
                window.switchPhoneWechatTab('contacts');
                
                // 打开微信时，如果有缓存数据，自动渲染
                if (currentCheckPhoneContactId) {
                    if (window.iphoneSimState.phoneContent && window.iphoneSimState.phoneContent[currentCheckPhoneContactId]) {
                        // 渲染两个页面
                        renderPhoneWechatContacts(currentCheckPhoneContactId);
                        renderPhoneWechatMoments(currentCheckPhoneContactId);
                    }
                }
            } else {
                originalHandleAppClick(appId, appName);
            }
        };
    }
}

function openPhoneCheckContactModal() {
    const modal = document.getElementById('phone-contact-select-modal');
    if (modal) {
        renderPhoneContactList();
        modal.classList.remove('hidden');
    }
}

// 处理查手机-微信朋友圈背景上传
function handlePhoneWechatBgUpload(e) {
    if (!currentCheckPhoneContactId) return;
    const contact = window.iphoneSimState.contacts.find(c => c.id === currentCheckPhoneContactId);
    if (!contact) return;

    const file = e.target.files[0];
    if (!file) return;

    // 复用 core.js 中的 compressImage
    if (window.compressImage) {
        window.compressImage(file, 800, 0.7).then(base64 => {
            contact.momentsBg = base64;
            const coverEl = document.getElementById('phone-wechat-cover');
            if (coverEl) {
                coverEl.style.backgroundImage = `url('${base64}')`;
                coverEl.style.backgroundColor = 'transparent';
            }
            // 保存配置
            if (window.saveConfig) window.saveConfig();
        }).catch(err => {
            console.error('图片压缩失败', err);
        });
    }
    e.target.value = '';
}

function renderPhoneContactList() {
    const list = document.getElementById('phone-contact-list');
    if (!list) return;
    list.innerHTML = '';

    const contacts = window.iphoneSimState.contacts || [];
    if (contacts.length === 0) {
        list.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">暂无联系人</div>';
        return;
    }

    contacts.forEach(contact => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.style.cursor = 'pointer';
        
        const avatar = contact.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown';
        const name = contact.remark || contact.name || '未知';

        item.innerHTML = `
            <div class="list-content">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <span style="font-size: 17px; color: #000;">${name}</span>
                </div>
                <i class="fas fa-chevron-right" style="color: #ccc;"></i>
            </div>
        `;
        item.onclick = () => enterPhoneCheck(contact.id);
        list.appendChild(item);
    });
}

function enterPhoneCheck(contactId) {
    currentCheckPhoneContactId = contactId;
    const modal = document.getElementById('phone-contact-select-modal');
    if (modal) modal.classList.add('hidden');
    
    // 打开查手机应用
    const app = document.getElementById('phone-app');
    if (app) app.classList.remove('hidden');
    
    // 加载特定联系人的布局
    loadPhoneLayout(contactId);
    calculateTotalPhonePages();
    renderPhonePages();
    renderPhoneItems();

    // 加载并设置朋友圈背景
    const contact = window.iphoneSimState.contacts.find(c => c.id === contactId);
    if (contact) {
        const coverEl = document.getElementById('phone-wechat-cover');
        const bg = contact.momentsBg || contact.profileBg || '';
        if (coverEl) {
            if (bg) {
                coverEl.style.backgroundImage = `url('${bg}')`;
                coverEl.style.backgroundColor = 'transparent';
            } else {
                coverEl.style.backgroundImage = '';
                coverEl.style.backgroundColor = '#333';
            }
            
            // 绑定点击更换背景事件
            coverEl.onclick = () => {
                const input = document.getElementById('phone-wechat-bg-input');
                if (input) input.click();
            };
        }
    }
}

function calculateTotalPhonePages() {
    let maxIndex = -1;
    phoneScreenData.forEach(item => {
        if (item.index > maxIndex) maxIndex = item.index;
    });
    const neededPages = Math.floor(maxIndex / PHONE_SLOTS_PER_PAGE) + 1;
    totalPhonePages = Math.max(2, neededPages);
}

function loadPhoneLayout(contactId) {
    // 确保初始化
    if (!window.iphoneSimState.phoneLayouts) window.iphoneSimState.phoneLayouts = {};
    
    // 尝试获取该联系人的布局
    let layout = window.iphoneSimState.phoneLayouts[contactId];
    
    if (layout && Array.isArray(layout) && layout.length > 0) {
        phoneScreenData = JSON.parse(JSON.stringify(layout)); // Deep copy
    } else {
        // 如果没有，使用默认布局
        phoneScreenData = [
            { index: 0, type: 'app', name: '微信', iconClass: 'fab fa-weixin', color: '#07C160', appId: 'phone-wechat' },
            { index: 1, type: 'app', name: '微博', iconClass: 'fab fa-weibo', color: '#E6162D', appId: 'phone-weibo' },
            { index: 2, type: 'app', name: 'iCity', iconClass: 'fas fa-building', color: '#FF9500', appId: 'phone-icity' },
            { index: 3, type: 'app', name: '浏览器', iconClass: 'fab fa-safari', color: '#007AFF', appId: 'phone-browser' }
        ];
    }
    
    // 确保有内部 ID
    phoneScreenData.forEach(item => {
        if (!item._internalId) item._internalId = Math.random().toString(36).substr(2, 9);
    });
}

function savePhoneLayout() {
    if (!currentCheckPhoneContactId) return;
    
    // 保存到全局状态
    window.iphoneSimState.phoneLayouts[currentCheckPhoneContactId] = phoneScreenData;
    
    // 持久化保存
    if (window.saveConfig) window.saveConfig();
}

// --- 渲染 (复用之前的逻辑，略微调整) ---

function renderPhonePages() {
    if (!phonePagesWrapper) return;
    phonePagesWrapper.innerHTML = '';
    phonePageIndicators.innerHTML = '';
    
    for (let p = 0; p < totalPhonePages; p++) {
        const page = document.createElement('div');
        page.className = 'home-screen-page';
        
        const grid = document.createElement('div');
        grid.className = 'home-screen-grid';
        if (isPhoneEditMode) grid.classList.add('edit-mode');
        
        for (let i = 0; i < PHONE_SLOTS_PER_PAGE; i++) {
            const globalIndex = p * PHONE_SLOTS_PER_PAGE + i;
            const slot = document.createElement('div');
            slot.classList.add('grid-slot');
            slot.dataset.index = globalIndex;
            slot.dataset.page = p;
            
            slot.addEventListener('dragover', handlePhoneDragOver);
            slot.addEventListener('drop', handlePhoneDrop);
            slot.addEventListener('touchstart', handlePhoneSlotTouchStart, { passive: false });
            slot.addEventListener('mousedown', handlePhoneSlotMouseDown);
            
            grid.appendChild(slot);
        }
        
        page.appendChild(grid);
        phonePagesWrapper.appendChild(page);
        
        const dot = document.createElement('div');
        dot.className = `page-dot ${p === 0 ? 'active' : ''}`;
        phonePageIndicators.appendChild(dot);
    }
}

function updatePhoneIndicators() {
    if (!phonePageIndicators) return;
    const dots = phonePageIndicators.querySelectorAll('.page-dot');
    dots.forEach((dot, index) => {
        if (index === currentPhonePage) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function renderPhoneItems() {
    phoneItemElementMap.forEach((el, id) => {
        if (!phoneScreenData.some(i => i._internalId === id)) {
            if (el.parentNode) el.parentNode.removeChild(el);
            phoneItemElementMap.delete(id);
        }
    });

    if (!phonePagesWrapper) return;
    const slots = phonePagesWrapper.querySelectorAll('.grid-slot');
    
    slots.forEach(slot => {
        const delBtn = slot.querySelector('.delete-btn');
        if (delBtn) delBtn.remove();
        
        slot.className = 'grid-slot';
        slot.style.display = 'block';
        slot.style.gridColumn = 'auto';
        slot.style.gridRow = 'auto';
        slot.removeAttribute('style');
    });

    const grids = phonePagesWrapper.querySelectorAll('.home-screen-grid');
    grids.forEach(grid => {
        if (isPhoneEditMode) grid.classList.add('edit-mode');
        else grid.classList.remove('edit-mode');
    });

    let coveredIndices = [];
    phoneScreenData.forEach(item => {
        if (item.size && item.size !== '1x1') {
            const occupied = window.getOccupiedSlots(item.index, item.size);
            if (occupied) {
                occupied.forEach(id => {
                    if (id !== item.index) coveredIndices.push(id);
                });
            }
        }
    });

    coveredIndices.forEach(id => {
        if (slots[id]) slots[id].style.display = 'none';
    });

    phoneScreenData.forEach(item => {
        const slot = slots[item.index];
        if (!slot) return;

        const canDrag = isPhoneEditMode;
        let el = phoneItemElementMap.get(item._internalId);

        if (!el) {
            if (item.type === 'custom-json-widget' && window.createCustomJsonWidget) {
                el = window.createCustomJsonWidget(item, canDrag);
            } else if (item.type === 'app' && window.createAppElement) {
                el = window.createAppElement(item, canDrag);
            }

            if (el) {
                phoneItemElementMap.set(item._internalId, el);
                el.dataset.itemId = item._internalId;
            }
        }

        if (el) {
            el.setAttribute('draggable', canDrag);
            el.ondragstart = (e) => handlePhoneDragStart(e, item);
            el.ondragend = (e) => handlePhoneDragEnd(e, item);
            
            if (canDrag) {
                el.addEventListener('touchstart', (e) => handlePhoneItemTouchStart(e, item), { passive: false });
                el.addEventListener('touchmove', handlePhoneItemTouchMove, { passive: false });
                el.addEventListener('touchend', (e) => handlePhoneItemTouchEnd(e, item), { passive: false });
            }

            if (item.size && window.applyWidgetSize) {
                window.applyWidgetSize(slot, item.size);
                slot.classList.add('widget-slot');
            }

            if (isPhoneEditMode) {
                addPhoneDeleteButton(slot, item);
            }

            if (el.parentNode !== slot) {
                slot.appendChild(el);
            }
        }
    });
}

function addPhoneDeleteButton(slot, item) {
    const btn = document.createElement('div');
    btn.className = 'delete-btn';
    btn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`确定要移除 ${item.name || '这个组件'} 吗？`)) {
            removePhoneItem(item);
        }
    };
    slot.appendChild(btn);
}

function removePhoneItem(item) {
    phoneScreenData = phoneScreenData.filter(i => i !== item);
    savePhoneLayout();
    renderPhoneItems();
}

// --- 拖拽逻辑 (保持不变) ---
function handlePhoneDragStart(e, item) {
    phoneDragItem = item;
    isPhoneDropped = false;
    e.dataTransfer.effectAllowed = 'move';
    phoneScreenData.forEach(i => i._originalIndex = i.index);
    setTimeout(() => {
        if (phoneItemElementMap.has(item._internalId)) {
            phoneItemElementMap.get(item._internalId).style.opacity = '0';
        }
    }, 0);
}

function handlePhoneDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!phoneDragItem) return;
    if (phoneDragThrottleTimer) return;
    phoneDragThrottleTimer = setTimeout(() => { phoneDragThrottleTimer = null; }, 50);
    const targetSlot = e.target.closest('.grid-slot');
    if (!targetSlot) return;
    const targetIndex = parseInt(targetSlot.dataset.index);
    if (targetIndex === lastPhoneDragTargetIndex) return;
    lastPhoneDragTargetIndex = targetIndex;
    phoneScreenData.forEach(i => {
        if (i._originalIndex !== undefined) i.index = i._originalIndex;
    });
    reorderPhoneItems(phoneDragItem, targetIndex);
    renderPhoneItems();
}

function handlePhoneDrop(e) {
    e.preventDefault();
    isPhoneDropped = true;
    savePhoneLayout();
}

function handlePhoneDragEnd(e, item) {
    if (!isPhoneDropped) {
        phoneScreenData.forEach(i => {
            if (i._originalIndex !== undefined) i.index = i._originalIndex;
        });
        renderPhoneItems();
    }
    phoneScreenData.forEach(i => delete i._originalIndex);
    if (phoneDragItem && phoneItemElementMap.has(phoneDragItem._internalId)) {
        phoneItemElementMap.get(phoneDragItem._internalId).style.opacity = '';
    }
    phoneDragItem = null;
    lastPhoneDragTargetIndex = -1;
}

function reorderPhoneItems(draggedItem, targetIndex) {
    let newSlots = window.getOccupiedSlots(targetIndex, draggedItem.size || '1x1');
    if (!newSlots) return;
    let victims = phoneScreenData.filter(i => i !== draggedItem && window.isCollision(i, newSlots));
    if (victims.length === 0) {
        draggedItem.index = targetIndex;
        return;
    }
    draggedItem.index = targetIndex;
    victims.sort((a, b) => a.index - b.index);
    victims.forEach(victim => {
        shiftPhoneItem(victim, targetIndex + 1);
    });
}

function shiftPhoneItem(item, newIndex) {
    if (newIndex >= totalPhonePages * PHONE_SLOTS_PER_PAGE) return;
    let newSlots = window.getOccupiedSlots(newIndex, item.size || '1x1');
    if (!newSlots) {
        return shiftPhoneItem(item, newIndex + 1);
    }
    item.index = newIndex;
    let victims = phoneScreenData.filter(i => i !== item && window.isCollision(i, newSlots));
    victims.forEach(v => shiftPhoneItem(v, v.index + 1));
}

// --- 触摸拖拽逻辑 (保持不变) ---
function handlePhoneSlotTouchStart(e) {
    const slot = e.currentTarget;
    if (e.target !== slot) return;
    clearTimeout(phoneLongPressTimer);
    const touch = e.touches[0];
    phoneTouchStartPos = { x: touch.clientX, y: touch.clientY };
    slot.style.transition = 'background-color 0.5s';
    phoneLongPressTimer = setTimeout(() => {
        if (!isPhoneEditMode) {
            if (navigator.vibrate) navigator.vibrate(50);
            slot.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            togglePhoneEditMode();
        }
    }, 500);
    const cancel = () => {
        clearTimeout(phoneLongPressTimer);
        slot.style.backgroundColor = '';
        slot.style.transition = '';
        document.removeEventListener('touchmove', checkMove);
        document.removeEventListener('touchend', cancel);
    };
    const checkMove = (e) => {
        const touch = e.touches[0];
        if (Math.abs(touch.clientX - phoneTouchStartPos.x) > 10 || Math.abs(touch.clientY - phoneTouchStartPos.y) > 10) {
            cancel();
        }
    };
    document.addEventListener('touchmove', checkMove, { passive: true });
    document.addEventListener('touchend', cancel, { once: true });
}

function handlePhoneSlotMouseDown(e) {
    const slot = e.currentTarget;
    if (e.target !== slot) return;
    clearTimeout(phoneLongPressTimer);
    phoneTouchStartPos = { x: e.clientX, y: e.clientY };
    slot.style.transition = 'background-color 0.5s';
    phoneLongPressTimer = setTimeout(() => {
        if (!isPhoneEditMode) {
            slot.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            togglePhoneEditMode();
        }
    }, 500);
    const cancel = () => {
        clearTimeout(phoneLongPressTimer);
        slot.style.backgroundColor = '';
        slot.style.transition = '';
        document.removeEventListener('mousemove', checkMove);
        document.removeEventListener('mouseup', cancel);
    };
    const checkMove = (e) => {
        if (Math.abs(e.clientX - phoneTouchStartPos.x) > 10 || Math.abs(e.clientY - phoneTouchStartPos.y) > 10) {
            cancel();
        }
    };
    document.addEventListener('mousemove', checkMove);
    document.addEventListener('mouseup', cancel, { once: true });
}

function handlePhoneItemTouchStart(e, item) {
    if (!isPhoneEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    if (phoneTouchDragClone) {
        phoneTouchDragClone.remove();
        phoneTouchDragClone = null;
    }
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    phoneTouchStartPos = {
        x: touch.clientX, y: touch.clientY,
        offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top
    };
    phoneTouchCurrentPos = { ...phoneTouchStartPos };
    phoneTouchDraggedElement = e.currentTarget;
    phoneTouchDraggedItem = item;
    isPhoneTouchDragging = false;
    phoneScreenData.forEach(i => i._originalIndex = i.index);
    phoneTouchDragClone = phoneTouchDraggedElement.cloneNode(true);
    phoneTouchDragClone.style.cssText = `
        position: fixed; pointer-events: none; z-index: 10000; opacity: 0.8;
        transform: scale(1.1); transition: none;
        width: ${rect.width}px; height: ${rect.height}px;
        left: ${rect.left}px; top: ${rect.top}px;
    `;
    phoneTouchDragClone.classList.add('touch-drag-clone');
    document.body.appendChild(phoneTouchDragClone);
    phoneTouchDraggedElement.style.opacity = '0';
    phoneTouchDraggedElement.style.visibility = 'hidden';
}

function handlePhoneItemTouchMove(e) {
    if (!phoneTouchDraggedItem || !phoneTouchDragClone) return;
    e.preventDefault();
    const touch = e.touches[0];
    phoneTouchCurrentPos = { x: touch.clientX, y: touch.clientY };
    const dx = phoneTouchCurrentPos.x - phoneTouchStartPos.x;
    const dy = phoneTouchCurrentPos.y - phoneTouchStartPos.y;
    if (!isPhoneTouchDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isPhoneTouchDragging = true;
        if (navigator.vibrate) navigator.vibrate(10);
    }
    if (isPhoneTouchDragging) {
        phoneTouchDragClone.style.left = (phoneTouchCurrentPos.x - phoneTouchStartPos.offsetX) + 'px';
        phoneTouchDragClone.style.top = (phoneTouchCurrentPos.y - phoneTouchStartPos.offsetY) + 'px';
        const targetSlot = document.elementFromPoint(phoneTouchCurrentPos.x, phoneTouchCurrentPos.y)?.closest('.grid-slot');
        if (targetSlot) {
            const targetIndex = parseInt(targetSlot.dataset.index);
            if (!isNaN(targetIndex) && targetIndex !== lastPhoneDragTargetIndex) {
                lastPhoneDragTargetIndex = targetIndex;
                phoneScreenData.forEach(i => {
                    if (i._originalIndex !== undefined) i.index = i._originalIndex;
                });
                reorderPhoneItems(phoneTouchDraggedItem, targetIndex);
                renderPhoneItems();
            }
        }
    }
}

function handlePhoneItemTouchEnd(e, item) {
    if (!phoneTouchDraggedItem) return;
    e.preventDefault();
    if (phoneTouchDragClone) {
        phoneTouchDragClone.remove();
        phoneTouchDragClone = null;
    }
    const all = phonePagesWrapper.querySelectorAll('.draggable-item, .custom-widget');
    all.forEach(el => {
        el.style.opacity = '';
        el.style.visibility = '';
    });
    if (isPhoneTouchDragging) {
        phoneScreenData.forEach(i => delete i._originalIndex);
        renderPhoneItems();
        savePhoneLayout();
    } else {
        phoneScreenData.forEach(i => {
            if (i._originalIndex !== undefined) i.index = i._originalIndex;
        });
        phoneScreenData.forEach(i => delete i._originalIndex);
        renderPhoneItems();
    }
    phoneTouchDraggedItem = null;
    phoneTouchDraggedElement = null;
    isPhoneTouchDragging = false;
    lastPhoneDragTargetIndex = -1;
}

// --- 工具栏与组件库 ---

function togglePhoneEditMode() {
    isPhoneEditMode = !isPhoneEditMode;
    const toolbar = document.getElementById('phone-edit-mode-toolbar');
    if (toolbar) {
        if (isPhoneEditMode) toolbar.classList.remove('hidden');
        else toolbar.classList.add('hidden');
    }
    renderPhoneItems();
}

function renderPhoneLibrary() {
    if (!phoneLibraryModal) return;
    const scrollRow = phoneLibraryModal.querySelector('.library-scroll-row');
    if (!scrollRow) return;
    scrollRow.innerHTML = '';
    let importedWidgets = [];
    try {
        const savedLib = localStorage.getItem('myIOS_Library');
        if (savedLib) importedWidgets = JSON.parse(savedLib);
    } catch (e) {}
    if (importedWidgets.length === 0) {
        scrollRow.innerHTML = '<div style="padding: 20px; color: #888;">暂无导入的组件</div>';
    } else {
        importedWidgets.forEach(widget => {
            const el = document.createElement('div');
            el.className = 'library-item';
            el.innerHTML = `
                <div class="library-preview-box size-${widget.size}">
                    <div style="transform:scale(0.5); transform-origin:top left; width:200%; height:200%; overflow:hidden;">
                        ${widget.css ? `<style>${widget.css}</style>` : ''}
                        ${widget.html}
                    </div>
                </div>
                <div class="library-item-name">${widget.name}</div>
            `;
            el.onclick = () => addToPhoneScreen(widget);
            scrollRow.appendChild(el);
        });
    }
}

function addToPhoneScreen(widgetTemplate) {
    const newItem = { ...widgetTemplate };
    newItem._internalId = Math.random().toString(36).substr(2, 9);
    let freeIndex = -1;
    const maxSlots = totalPhonePages * PHONE_SLOTS_PER_PAGE;
    for (let i = 0; i < maxSlots; i++) {
        let slots = window.getOccupiedSlots(i, newItem.size || '1x1');
        if (slots) {
            let collision = phoneScreenData.some(existing => window.isCollision(existing, slots));
            if (!collision) {
                freeIndex = i;
                break;
            }
        }
    }
    if (freeIndex !== -1) {
        newItem.index = freeIndex;
        phoneScreenData.push(newItem);
        if (phoneLibraryModal) phoneLibraryModal.classList.remove('show');
        renderPhoneItems();
        savePhoneLayout();
    } else {
        alert("查手机页面空间不足");
    }
}

function setupPhoneListeners() {
    const addBtn = document.getElementById('phone-add-widget-btn');
    const saveBtn = document.getElementById('phone-save-layout-btn');
    const exitBtn = document.getElementById('phone-exit-edit-btn');
    const closeLibBtn = document.getElementById('phone-close-library-btn');
    const closeAppBtn = document.getElementById('close-phone-app');
    
    if (addBtn) addBtn.onclick = () => {
        renderPhoneLibrary();
        if (phoneLibraryModal) phoneLibraryModal.classList.add('show');
    };
    if (saveBtn) saveBtn.onclick = () => {
        savePhoneLayout();
        togglePhoneEditMode();
    };
    if (exitBtn) exitBtn.onclick = togglePhoneEditMode;
    if (closeLibBtn && phoneLibraryModal) {
        closeLibBtn.onclick = () => phoneLibraryModal.classList.remove('show');
    }
    if (closeAppBtn) {
        closeAppBtn.addEventListener('click', () => {
            document.getElementById('phone-app').classList.add('hidden');
        });
    }
    const closeContactSelectBtn = document.getElementById('close-phone-contact-select');
    if (closeContactSelectBtn) {
        closeContactSelectBtn.onclick = () => {
            document.getElementById('phone-contact-select-modal').classList.add('hidden');
        };
    }
    
    // 绑定朋友圈背景上传事件
    const bgInput = document.getElementById('phone-wechat-bg-input');
    if (bgInput) {
        bgInput.addEventListener('change', handlePhoneWechatBgUpload);
    }

    setupPhoneAppListeners();
}

function setupPhoneAppListeners() {
    const btnWechat = document.getElementById('generate-wechat-btn');
    const btnWeibo = document.getElementById('generate-weibo-btn');
    const btnIcity = document.getElementById('generate-icity-btn');
    const btnBrowser = document.getElementById('generate-browser-btn');

    if (btnWechat) btnWechat.onclick = () => handlePhoneAppGenerate('wechat');
    if (btnWeibo) btnWeibo.onclick = () => handlePhoneAppGenerate('weibo');
    if (btnIcity) btnIcity.onclick = () => handlePhoneAppGenerate('icity');
    if (btnBrowser) btnBrowser.onclick = () => handlePhoneAppGenerate('browser');
}

window.switchPhoneWechatTab = function(tabName) {
    const tabs = document.querySelectorAll('#phone-wechat .wechat-tab-item');
    const contents = document.querySelectorAll('.phone-wechat-tab-content');
    const header = document.getElementById('phone-wechat-header');
    const backBtn = document.getElementById('phone-wechat-back-btn');
    const title = document.getElementById('phone-wechat-title');
    const generateBtn = document.getElementById('generate-wechat-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.style.display = 'none');
    
    if (generateBtn) {
        // 重置按钮样式
        generateBtn.style.display = 'block';
        generateBtn.onclick = (e) => showPhoneWechatGenerateMenu(e);
    }

    if (tabName === 'contacts') {
        tabs[0].classList.add('active');
        document.getElementById('phone-wechat-tab-contacts').style.display = 'block';
        
        // Header style for Contacts (Chats)
        if (header) header.style.backgroundColor = '#ededed';
        if (backBtn) {
            backBtn.style.color = '#000';
            backBtn.style.textShadow = 'none';
        }
        if (title) {
            title.style.display = 'block';
            title.style.color = '#000';
            title.textContent = '微信'; // Ensure title is WeChat
        }
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-plus"></i>';
            generateBtn.style.color = '#000';
            generateBtn.style.textShadow = 'none';
            // 确保切换回来时重新绑定菜单事件
            generateBtn.onclick = (e) => showPhoneWechatGenerateMenu(e);
        }
        
        // 渲染聊天列表
        if (currentCheckPhoneContactId) {
            renderPhoneWechatContacts(currentCheckPhoneContactId);
        }

    } else {
        tabs[1].classList.add('active');
        document.getElementById('phone-wechat-tab-moments').style.display = 'block';
        
        // Header style for Moments
        if (header) header.style.backgroundColor = 'transparent';
        if (backBtn) {
            backBtn.style.color = '#fff';
            backBtn.style.textShadow = '0 1px 3px rgba(0,0,0,0.5)';
        }
        if (title) title.style.display = 'none';
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-camera"></i>';
            generateBtn.style.color = '#fff';
            generateBtn.style.textShadow = '0 1px 3px rgba(0,0,0,0.5)';
            // 确保切换回来时重新绑定菜单事件
            generateBtn.onclick = (e) => showPhoneWechatGenerateMenu(e);
        }
    }
};

function showPhoneWechatGenerateMenu(event) {
    event.stopPropagation();
    
    const existingMenu = document.getElementById('phone-generate-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.id = 'phone-generate-menu';
    menu.style.cssText = `
        position: absolute;
        top: 50px;
        right: 10px;
        background: #4c4c4c;
        border-radius: 6px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        overflow: hidden;
    `;

    const options = [
        { text: '只生成聊天', icon: 'fas fa-comments', action: 'chat' },
        { text: '只生成动态', icon: 'fas fa-star', action: 'moments' },
        { text: '全部生成', icon: 'fas fa-magic', action: 'all' }
    ];

    options.forEach(opt => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 12px 15px;
            color: #fff;
            font-size: 14px;
            border-bottom: 1px solid #5f5f5f;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            white-space: nowrap;
        `;
        if (opt === options[options.length - 1]) item.style.borderBottom = 'none';
        
        item.innerHTML = `<i class="${opt.icon}" style="width: 20px; text-align: center;"></i> ${opt.text}`;
        
        item.onclick = async () => {
            menu.remove();
            if (!currentCheckPhoneContactId) return;
            const contact = window.iphoneSimState.contacts.find(c => c.id === currentCheckPhoneContactId);
            if (!contact) return;

            if (opt.action === 'chat') {
                await generatePhoneWechatChats(contact);
            } else if (opt.action === 'moments') {
                await generatePhoneWechatMoments(contact);
            } else if (opt.action === 'all') {
                await generatePhoneWechatAll(contact);
            }
        };
        
        menu.appendChild(item);
    });

    document.getElementById('phone-wechat').appendChild(menu);

    // 点击其他地方关闭
    const closeMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== event.target) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    // 延迟绑定，防止当前点击立即触发
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

async function handlePhoneAppGenerate(appType) {
    if (!currentCheckPhoneContactId) {
        alert('未选择联系人');
        return;
    }
    
    const contact = window.iphoneSimState.contacts.find(c => c.id === currentCheckPhoneContactId);
    if (!contact) {
        alert('联系人数据错误');
        return;
    }

    if (appType === 'wechat') {
        // 先尝试加载已有内容（如果有缓存，这里可以优化）
        // 但用户点击生成，通常意味着强制生成。
        // 读取内容逻辑移到打开应用时，这里只负责生成。
        await generatePhoneWechatMoments(contact);
    } else {
        alert(`正在生成 ${contact.name} 的 ${appType} 内容...\n(功能开发中)`);
    }
}

async function generatePhoneWechatAll(contact) {
    const btn = document.getElementById('generate-wechat-btn');
    if (btn) {
        btn.disabled = true;
        btn.classList.add('generating-pulse');
    }

    const systemPrompt = `你是一个虚拟手机内容生成器。请为角色【${contact.name}】生成微信内容（包含聊天列表和朋友圈）。
角色设定：${contact.persona || '无'}

【任务要求 1：聊天列表 (chats)】
1. 生成 6-10 个聊天会话。
2. 包含好友、群聊、工作联系人。
3. 【重要】绝不要生成与“我”、“玩家”、“User”、“{{user}}”或当前手机持有者自己的聊天。只生成与其他NPC（虚构人物）的聊天。
4. 每个会话包含 "messages" 数组 (5-10条记录)。
   - role: "friend" 或 "me"。
   - type: "text", "image", "voice"。

【任务要求 2：朋友圈 (moments)】
1. 生成 7-10 条动态。
2. 包含图片(url)、点赞(likes)、评论(comments)。
3. 设置可见性(visibility): include, exclude, private (仅自己可见)。

【返回格式】
必须是合法的 JSON 对象：
{
  "chats": [ { "name": "...", "avatar": "...", "lastMessage": "...", "time": "...", "unread": 0, "messages": [...] }, ... ],
  "moments": [ { "isSelf": true, "name": "...", "content": "...", "images": [...], "time": "...", "likes": [...], "comments": [...], "visibility": {...} }, ... ]
}`;

    await callAiGeneration(contact, systemPrompt, 'all', btn);
}

async function callAiGeneration(contact, systemPrompt, type, btn) {
    const settings = window.iphoneSimState.aiSettings.url ? window.iphoneSimState.aiSettings : window.iphoneSimState.aiSettings2;
    
    if (!settings.url || !settings.key) {
        alert('请先配置 AI API');
        if (btn) {
            btn.classList.remove('generating-pulse');
            btn.disabled = false;
        }
        return;
    }

    try {
        let fetchUrl = settings.url;
        if (!fetchUrl.endsWith('/chat/completions')) {
            fetchUrl = fetchUrl.endsWith('/') ? fetchUrl + 'chat/completions' : fetchUrl + '/chat/completions';
        }

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.key}`
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: '开始生成' }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error('API Error: ' + response.status);

        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        
        // 尝试提取 JSON 部分
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        const firstBracket = content.indexOf('[');
        const lastBracket = content.lastIndexOf(']');

        let jsonStr = content;
        // 简单判断是对象还是数组
        if (type === 'all' && firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = content.substring(firstBrace, lastBrace + 1);
        } else if (type !== 'all' && firstBracket !== -1 && lastBracket !== -1) {
            jsonStr = content.substring(firstBracket, lastBracket + 1);
        } else {
             // Fallback
             jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        
        const result = JSON.parse(jsonStr);

        if (!window.iphoneSimState.phoneContent[contact.id]) {
            window.iphoneSimState.phoneContent[contact.id] = {};
        }

        if (type === 'moments' && Array.isArray(result)) {
            window.iphoneSimState.phoneContent[contact.id].wechatMoments = result;
            renderPhoneWechatMoments(contact.id);
            window.switchPhoneWechatTab('moments');
        } else if (type === 'chats' && Array.isArray(result)) {
            window.iphoneSimState.phoneContent[contact.id].wechatChats = result;
            renderPhoneWechatContacts(contact.id);
            window.switchPhoneWechatTab('contacts');
        } else if (type === 'all' && result.chats && result.moments) {
            window.iphoneSimState.phoneContent[contact.id].wechatChats = result.chats;
            window.iphoneSimState.phoneContent[contact.id].wechatMoments = result.moments;
            // 渲染并保持当前 Tab (或者默认去微信页)
            renderPhoneWechatContacts(contact.id);
            renderPhoneWechatMoments(contact.id);
            // 刷新当前页面状态
            const currentTab = document.getElementById('phone-wechat-tab-contacts').style.display === 'block' ? 'contacts' : 'moments';
            window.switchPhoneWechatTab(currentTab);
        } else {
            throw new Error('返回格式不正确');
        }

        if (window.saveConfig) window.saveConfig();

    } catch (error) {
        console.error('Generation Error', error);
        alert('生成失败：' + error.message);
    } finally {
        if (btn) {
            btn.classList.remove('generating-pulse');
            btn.disabled = false;
            // 重新绑定事件，防止丢失
            // 获取当前 active tab
            const currentTab = document.getElementById('phone-wechat-tab-contacts').style.display === 'block' ? 'contacts' : 'moments';
            window.switchPhoneWechatTab(currentTab);
        }
    }
}

async function generatePhoneWechatMoments(contact) {
    const btn = document.getElementById('generate-wechat-btn');
    if (btn) {
        btn.classList.add('generating-pulse');
        btn.disabled = true;
    }

    const systemPrompt = `你是一个虚拟手机内容生成器。请为角色【${contact.name}】生成微信朋友圈内容。
角色设定：${contact.persona || '无'}

【任务要求】
1. 生成 7-10 条朋友圈动态。
2. 至少 3 条是【${contact.name}】自己发的。
3. 其余的是【${contact.name}】的好友（虚构人物）发的。
4. 内容要符合角色设定和当前情境。
5. 图片URL请使用 placeholder (例如 https://placehold.co/400x400?text=Image)。
6. 时间可以是最近几天。

【返回格式】
必须是合法的 JSON 数组，格式如下：
[
  {
    "isSelf": true, // 是否是本人发的
    "name": "${contact.name}", // 如果是本人则用本人名字，否则生成一个好友名字
    "content": "文字内容...",
    "time": "1小时前", // 相对时间字符串
    "images": ["url1", "url2"], // 图片数组，可以为空
    "likes": ["好友A", "好友B"], // 点赞人名数组
    "comments": [ // 评论数组
      {"user": "好友C", "content": "评论内容..."}
    ],
    "visibility": { // 可见性设置 (可选)
       "type": "include", // include (部分可见), exclude (不给谁看), 或 private (仅自己可见)
       "list": ["好友A"], // 如果是 include/exclude，则是名单
       "labels": ["高中同学", "家人"] // 如果是 include/exclude，则是标签
    }
  },
  ...
]

【特别规则 - 仅自己可见】
请随机生成 1-2 条“仅自己可见”的动态（visibility.type = "private"）。
1. 内容风格：吐槽、emo、深夜感悟、自言自语。
2. 点赞（likes）：必须为空。
3. 评论（comments）：可以是空的，或者是自己（isSelf=true）的追加评论（自言自语）。
4. 这种动态必须是本人发的（isSelf=true）。
`;

    await callAiGeneration(contact, systemPrompt, 'moments', btn);
}

// 渲染指定联系人的朋友圈内容
function renderPhoneWechatMoments(contactId) {
    // 确保有数据
    if (!window.iphoneSimState.phoneContent) window.iphoneSimState.phoneContent = {};
    const content = window.iphoneSimState.phoneContent[contactId];
    const moments = content ? content.wechatMoments : [];
    
    const contact = window.iphoneSimState.contacts.find(c => c.id === contactId);
    if (!contact) return;

    const list = document.getElementById('phone-wechat-moments-list');
    const userNameEl = document.getElementById('phone-wechat-user-name');
    const userAvatarEl = document.getElementById('phone-wechat-user-avatar');
    
    if (userNameEl) userNameEl.textContent = contact.name;
    if (userAvatarEl) userAvatarEl.src = contact.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown';
    
    if (!list) return;
    list.innerHTML = '';

    if (!moments || moments.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">点击右上角生成动态</div>';
        return;
    }

    moments.forEach(moment => {
        const item = document.createElement('div');
        item.className = 'moment-item';
        
        let avatar;
        if (moment.isSelf) {
            avatar = contact.avatar || getSmartAvatar(contact.name);
        } else {
            avatar = getSmartAvatar(moment.name);
        }

        let imagesHtml = '';
        if (moment.images && moment.images.length > 0) {
            const gridClass = moment.images.length === 1 ? 'single' : 'grid';
            imagesHtml = `<div class="moment-images ${gridClass}">
                ${moment.images.map((src, i) => {
                    // 如果 src 是 placeholder，替换为本地 SVG
                    let imgSrc = src;
                    if (!src || src.includes('placehold') || src.includes('dicebear')) {
                        imgSrc = getSmartImage('图 ' + (i+1));
                    }
                    return `<img src="${imgSrc}" class="moment-img">`;
                }).join('')}
            </div>`;
        }

        let visibilityHtml = '';
        // 仅在是本人发的动态且包含可见性设置时显示
        if (moment.isSelf && moment.visibility && moment.visibility.type) {
            let iconClass = 'fas fa-user';
            if (moment.visibility.type === 'private') {
                iconClass = 'fas fa-lock';
            }
            // 添加 position: relative 以便气泡跟随定位
            visibilityHtml = `<span class="moment-visibility-icon" style="margin-left: 10px; color: #858585; cursor: pointer; position: relative; display: inline-block;">
                <i class="${iconClass}" style="font-size: 14px;"></i>
            </span>`;
        }

        let likesHtml = '';
        if (moment.likes && moment.likes.length > 0) {
            likesHtml = `<div class="moment-likes"><i class="far fa-heart"></i> ${moment.likes.join(', ')}</div>`;
        }

        let commentsHtml = '';
        if (moment.comments && moment.comments.length > 0) {
            commentsHtml = `<div class="moment-comments">
                ${moment.comments.map(c => `
                    <div class="comment-item">
                        <span class="comment-user">${c.user || c.name || '未知用户'}</span>：<span class="comment-content">${c.content}</span>
                    </div>
                `).join('')}
            </div>`;
        }

        let footerHtml = '';
        if (likesHtml || commentsHtml) {
            footerHtml = `<div class="moment-likes-comments">${likesHtml}${commentsHtml}</div>`;
        }

        item.innerHTML = `
            <img src="${avatar}" class="moment-avatar">
            <div class="moment-content">
                <div class="moment-name">${moment.name}</div>
                <div class="moment-text">${moment.content}</div>
                ${imagesHtml}
                <div class="moment-info">
                    <div style="display: flex; align-items: center;">
                        <span class="moment-time">${moment.time}</span>
                        ${visibilityHtml}
                    </div>
                    <div style="position: relative;">
                        <button class="moment-action-btn"><i class="fas fa-ellipsis-h"></i></button>
                    </div>
                </div>
                ${footerHtml}
            </div>
        `;
        
        // 绑定可见性按钮点击事件
        const visBtn = item.querySelector('.moment-visibility-icon');
        if (visBtn && moment.visibility) {
            visBtn.onclick = (e) => {
                e.stopPropagation();
                
                // 如果已经有显示的 toast，先移除
                const existingToast = visBtn.querySelector('.visibility-toast');
                if (existingToast) {
                    existingToast.remove();
                    return;
                }

                let iconHtml = '<i class="fas fa-user"></i>';
                let contentText = '';

                if (moment.visibility.type === 'private') {
                    contentText = '仅自己可见';
                    iconHtml = '<i class="fas fa-lock"></i>';
                } else {
                    const typeText = moment.visibility.type === 'include' ? '部分可见' : '不给谁看';
                    
                    // 支持多个标签 (labels) 或单个标签 (label - 兼容旧数据)
                    let labelsText = '';
                    if (moment.visibility.labels && Array.isArray(moment.visibility.labels) && moment.visibility.labels.length > 0) {
                        labelsText = moment.visibility.labels.join(', ');
                    } else if (moment.visibility.label) {
                        labelsText = moment.visibility.label;
                    } else if (moment.visibility.list && moment.visibility.list.length > 0) {
                        labelsText = moment.visibility.list.join(', ');
                    } else {
                        labelsText = '未指定';
                    }
                    
                    if (moment.visibility.type === 'exclude') {
                        iconHtml = '<i class="fas fa-user-slash"></i>';
                        contentText = `不给看: ${labelsText}`;
                    } else {
                        contentText = labelsText;
                    }
                }

                // 创建气泡提示，append 到按钮内部实现跟随移动
                const toast = document.createElement('div');
                toast.className = 'visibility-toast';
                toast.style.cssText = `
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-bottom: 8px;
                    background-color: rgba(0, 0, 0, 0.7);
                    color: #fff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    z-index: 10;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s;
                `;
                
                // 小三角
                const arrow = document.createElement('div');
                arrow.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-left: -5px;
                    border-width: 5px;
                    border-style: solid;
                    border-color: rgba(0, 0, 0, 0.7) transparent transparent transparent;
                `;
                toast.appendChild(arrow);
                
                const textSpan = document.createElement('span');
                textSpan.innerHTML = `${iconHtml} ${contentText}`;
                toast.appendChild(textSpan);
                
                visBtn.appendChild(toast);
                
                // 动画显示
                requestAnimationFrame(() => {
                    toast.style.opacity = '1';
                });

                // 2秒后消失
                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => {
                        toast.remove();
                    }, 200);
                }, 2000);
            };
        }

        list.appendChild(item);
    });
}

async function generatePhoneWechatChats(contact) {
    const btn = document.getElementById('generate-wechat-btn');
    if (btn) {
        btn.disabled = true;
        btn.classList.add('generating-pulse');
    }

    const systemPrompt = `你是一个虚拟手机内容生成器。请为角色【${contact.name}】生成微信消息列表（聊天会话）及详细聊天记录。
角色设定：${contact.persona || '无'}

【任务要求】
1. 生成 6-10 个聊天会话。
2. 包含好友、群聊（可选）、工作/生活相关联系人。
3. 【重要】绝不要生成与“我”、“玩家”、“User”、“{{user}}”或当前手机持有者自己的聊天。只生成与其他NPC（虚构人物）的聊天。
4. "lastMessage" 应简短真实，符合该联系人与主角的关系。
5. "time" 应是最近的时间。
6. "unread" (未读数) 随机生成，大部分为 0，少数为 1-5。
7. 必须包含 "messages" 数组，生成最近 5-10 条聊天记录。
   - role: "friend" (对方) 或 "me" (主角)。
   - content: 聊天内容。
   - type: "text" (默认), "image", "voice" (可选)。

【重要：返回格式】
1. 必须是纯 JSON 数组。
2. 不要包含任何开场白（如“好的”、“这是...”）。
3. 不要包含 Markdown 代码块标记。
4. 直接返回 [ 开头，] 结尾的 JSON 字符串。

JSON 格式示例：
[
  {
    "name": "好友名",
    "avatar": "url...",
    "lastMessage": "消息内容...",
    "time": "10:00",
    "unread": 2,
    "messages": [
       {"role": "friend", "content": "你好", "type": "text"},
       {"role": "me", "content": "你好呀", "type": "text"}
    ]
  }
]`;

    await callAiGeneration(contact, systemPrompt, 'chats', btn);
}

function renderPhoneWechatContacts(contactId) {
    const container = document.getElementById('phone-wechat-tab-contacts');
    if (!container) return;
    
    // 清空现有列表（保留顶部的padding等样式，所以重新构建 list 容器）
    // 但原结构是 container -> ios-list-group -> items
    // 我们重建内部结构
    
    // 获取数据
    const content = window.iphoneSimState.phoneContent && window.iphoneSimState.phoneContent[contactId];
    let chats = content ? content.wechatChats : [];
    
    // 过滤掉不应出现的聊天（如 User, {{user}}）
    if (chats && chats.length > 0) {
        chats = chats.filter(c => {
            const name = c.name ? c.name.toLowerCase() : '';
            return !['user', '{{user}}', 'me', '玩家', '我'].includes(name);
        });
    }

    if (!chats || chats.length === 0) {
        container.innerHTML = `
            <div class="ios-list-group" style="margin-top: 10px; background-color: transparent;">
                <div class="list-item" style="justify-content: center; color: #999; border: none; background: transparent;">
                    点击右上角生成聊天
                </div>
            </div>`;
        return;
    }

    let html = '<div class="ios-list-group" style="margin-top: 0; background-color: #fff;">';
    
    chats.forEach((chat, index) => {
        let avatar = chat.avatar;
        if (!avatar || avatar.includes('placehold') || avatar.includes('dicebear')) {
             avatar = getSmartAvatar(chat.name);
        }

        const unreadHtml = chat.unread > 0 
            ? `<div class="unread-badge" style="position: absolute; top: -5px; right: -5px;">${chat.unread}</div>` 
            : '';

        html += `
            <div class="contact-item" style="height: 72px;" onclick="window.openPhoneWechatChat(${index}, '${contactId}')">
                <div class="contact-content-wrapper" style="height: 100%; padding: 10px 16px;">
                    <div style="position: relative; margin-right: 12px;">
                        <img src="${avatar}" class="contact-avatar" style="width: 48px; height: 48px; margin: 0;">
                        ${unreadHtml}
                    </div>
                    <div class="contact-info">
                        <div class="contact-header-row">
                            <span class="contact-name" style="font-size: 16px; font-weight: 500;">${chat.name}</span>
                            <span class="contact-time" style="font-size: 10px; color: #b2b2b2;">${chat.time}</span>
                        </div>
                        <div class="contact-msg-row">
                            <span class="contact-msg-preview" style="font-size: 13px; color: #999;">${chat.lastMessage}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // 设置 padding-top 以避开 header (header height ~91px)
    // 但 CSS 中已经设置了 padding-top: 91px
    container.innerHTML = html;
}

window.openPhoneWechatChat = function(index, contactId) {
    const content = window.iphoneSimState.phoneContent && window.iphoneSimState.phoneContent[contactId];
    const chats = content ? content.wechatChats : [];
    const chat = chats[index];
    
    if (!chat) return;

    let detailScreen = document.getElementById('phone-wechat-chat-detail');
    if (!detailScreen) {
        detailScreen = document.createElement('div');
        detailScreen.id = 'phone-wechat-chat-detail';
        detailScreen.className = 'sub-screen';
        detailScreen.style.zIndex = '210'; // Above tabs
        detailScreen.style.backgroundColor = '#f2f2f7';
        document.getElementById('phone-wechat').appendChild(detailScreen);
    }

    detailScreen.innerHTML = `
        <div class="wechat-header" style="background: #ededed; color: #000; position: absolute; top: 0; width: 100%; height: calc(44px + max(47px, env(safe-area-inset-top))); padding-top: max(47px, env(safe-area-inset-top)); box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; z-index: 10;">
            <div class="header-left" style="height: 44px; display: flex; align-items: center;">
                <button class="wechat-icon-btn" onclick="window.closePhoneWechatChat()"><i class="fas fa-chevron-left"></i></button>
            </div>
            <span class="wechat-title" style="line-height: 44px;">${chat.name}</span>
            <div class="header-right" style="height: 44px; display: flex; align-items: center;">
                <button class="wechat-icon-btn"><i class="fas fa-ellipsis-h"></i></button>
            </div>
        </div>
        <div class="wechat-body" style="padding: 15px; padding-top: calc(50px + max(47px, env(safe-area-inset-top))); padding-bottom: calc(70px + env(safe-area-inset-bottom)); overflow-y: auto; height: 100%; box-sizing: border-box;">
            <div class="chat-messages-container"></div>
        </div>
        <div class="chat-input-area" style="position: absolute; bottom: 0; width: 100%; box-sizing: border-box; padding-bottom: max(10px, env(safe-area-inset-bottom)); background: #f7f7f7; border-top: 1px solid #dcdcdc;">
            <button class="chat-icon-btn"><i class="fas fa-plus-circle"></i></button>
            <input type="text" placeholder="发送消息..." disabled style="background-color: #fff; height: 36px; border-radius: 6px; padding: 0 10px; border: none; flex: 1;">
            <button class="chat-icon-btn"><i class="far fa-smile"></i></button>
            <button class="chat-icon-btn"><i class="fas fa-plus"></i></button>
        </div>
    `;

    const container = detailScreen.querySelector('.chat-messages-container');
    
    if (chat.messages && Array.isArray(chat.messages)) {
        chat.messages.forEach(msg => {
            const isMe = msg.role === 'me';
            const row = document.createElement('div');
            row.className = `chat-message ${isMe ? 'user' : 'other'}`;
            
            // 如果是对方，显示聊天对象的头像；如果是"我"，隐藏头像（或使用透明）
            // 用户反馈：直接隐藏聊天页面中的右侧这一方的头像
            let avatarHtml = '';
            if (!isMe) {
                let avatar = chat.avatar;
                if (!avatar || avatar.includes('placehold') || avatar.includes('dicebear')) {
                     avatar = getSmartAvatar(chat.name);
                }
                avatarHtml = `<img src="${avatar}" class="chat-avatar">`;
            }

            // Simple text rendering, ignoring types for now or basic support
            let contentHtml = msg.content;
            if (msg.type === 'image') {
                contentHtml = '[图片]'; // Placeholder if no real image
            } else if (msg.type === 'voice') {
                contentHtml = '[语音]';
            }

            row.innerHTML = `
                ${avatarHtml}
                <div class="message-content">${contentHtml}</div>
            `;
            container.appendChild(row);
        });
    } else {
        container.innerHTML = '<div style="text-align: center; color: #999; margin-top: 20px;">无聊天记录</div>';
    }

    detailScreen.classList.remove('hidden');
};

window.closePhoneWechatChat = function() {
    const detailScreen = document.getElementById('phone-wechat-chat-detail');
    if (detailScreen) {
        detailScreen.classList.add('hidden');
        // Optional: remove after transition
        setTimeout(() => detailScreen.remove(), 300);
    }
};

// 注册
if (window.appInitFunctions) {
    window.appInitFunctions.push(initPhoneGrid);
}
