// 购物应用功能模块

// 状态
let isShoppingManageMode = false;
let selectedShoppingProducts = new Set();
let currentShoppingProduct = null;

// 切换 Tab
window.switchShoppingTab = function(tabName) {
    // 1. Update Tab Bar
    const tabs = document.querySelectorAll('#shopping-app .wechat-tab-item');
    tabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // 2. Update Content
    const contents = document.querySelectorAll('#shopping-app .shopping-tab-content');
    contents.forEach(content => {
        if (content.id === `shopping-tab-${tabName}`) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });

    // 3. Update Header Buttons
    const linkBtn = document.getElementById('shopping-link-contact-btn');
    const menuBtn = document.getElementById('shopping-menu-btn');
    if (tabName === 'cart' || tabName === 'orders') {
        if (linkBtn) linkBtn.classList.add('hidden');
        if (menuBtn) menuBtn.classList.add('hidden');
    } else {
        if (linkBtn) linkBtn.classList.remove('hidden');
        if (menuBtn) menuBtn.classList.remove('hidden');
    }

    if (tabName === 'cart') {
        renderShoppingCart();
    } else if (tabName === 'orders') {
        updateShoppingOrderStatuses();
        renderShoppingOrders();
    } else if (tabName === 'delivery') {
        renderDeliveryItems();
    }
};

// 确保购物页面容器存在
function ensureShoppingContainer() {
    const container = document.getElementById('shopping-tab-home');
    if (!container) return false;

    let waterfallContainer = container.querySelector('.shopping-waterfall-container');
    if (!waterfallContainer) {
        // 清除初始的空状态/默认内容
        if (!window.iphoneSimState.shoppingProducts || window.iphoneSimState.shoppingProducts.length === 0) {
             container.innerHTML = '';
        } else {
             // 如果有数据但没容器，可能是重新渲染，清空一下比较安全
             container.innerHTML = '';
        }

        waterfallContainer = document.createElement('div');
        waterfallContainer.className = 'shopping-waterfall-container';
        waterfallContainer.style.display = 'flex';
        waterfallContainer.style.gap = '10px';
        waterfallContainer.style.padding = '10px';
        waterfallContainer.style.alignItems = 'flex-start';
        
        const col1 = document.createElement('div');
        col1.id = 'shopping-col-1';
        col1.style.flex = '1';
        col1.style.display = 'flex';
        col1.style.flexDirection = 'column';
        col1.style.gap = '10px';
        
        const col2 = document.createElement('div');
        col2.id = 'shopping-col-2';
        col2.style.flex = '1';
        col2.style.display = 'flex';
        col2.style.flexDirection = 'column';
        col2.style.gap = '10px';
        
        waterfallContainer.appendChild(col1);
        waterfallContainer.appendChild(col2);
        container.appendChild(waterfallContainer);
    }
    return true;
}

// 确保外卖页面容器存在
function ensureDeliveryContainer() {
    const container = document.getElementById('shopping-tab-delivery');
    if (!container) return false;

    let deliveryContainer = container.querySelector('.delivery-container');
    if (!deliveryContainer) {
        // 清除初始状态
        if (!window.iphoneSimState.deliveryItems || window.iphoneSimState.deliveryItems.length === 0) {
             container.innerHTML = '';
        } else {
             container.innerHTML = '';
        }

        deliveryContainer = document.createElement('div');
        deliveryContainer.className = 'delivery-container';
        deliveryContainer.style.padding = '10px';
        deliveryContainer.style.display = 'flex';
        deliveryContainer.style.flexDirection = 'column';
        deliveryContainer.style.gap = '10px';
        
        container.appendChild(deliveryContainer);
    }
    return true;
}

// 注入样式
function injectShoppingStyles() {
    if (document.getElementById('shopping-styles')) return;
    const style = document.createElement('style');
    style.id = 'shopping-styles';
    style.textContent = `
        .shopping-card {
            position: relative;
            transition: transform 0.2s;
        }
        .shopping-card.manage-active {
            transform: scale(0.95);
        }
        .shopping-checkbox {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 24px;
            height: 24px;
            background: rgba(0,0,0,0.3);
            border: 2px solid #fff;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10;
            cursor: pointer;
        }
        .shopping-checkbox.checked {
            background: #007AFF;
            border-color: #fff;
        }
        .shopping-checkbox.checked::after {
            content: '✓';
            color: #fff;
            font-size: 14px;
            font-weight: bold;
        }
        .manage-mode .shopping-checkbox {
            display: flex;
        }
        .message-content.pay-request-msg,
        .message-content.shopping-gift-msg,
        .message-content.delivery-share-msg {
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
        }
        .message-content.pay-request-msg::before,
        .message-content.pay-request-msg::after,
        .message-content.shopping-gift-msg::before,
        .message-content.shopping-gift-msg::after,
        .message-content.delivery-share-msg::before,
        .message-content.delivery-share-msg::after {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

// 初始化监听器
function setupShoppingListeners() {
    injectShoppingStyles();

    // 启动订单状态检查定时器 (每10秒检查一次)
    setInterval(updateShoppingOrderStatuses, 10000);

    const closeBtn = document.getElementById('close-shopping-app');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('shopping-app').classList.add('hidden');
        });
    }

    const menuBtn = document.getElementById('shopping-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.getElementById('shopping-options-modal').classList.remove('hidden');
        });
    }

    // 选项菜单
    const optGenerate = document.getElementById('shopping-opt-generate');
    const optAdd = document.getElementById('shopping-opt-add');
    const optManage = document.getElementById('shopping-opt-manage');
    const optCancel = document.getElementById('shopping-opt-cancel');
    const modal = document.getElementById('shopping-options-modal');

    if (optGenerate) optGenerate.addEventListener('click', () => {
        modal.classList.add('hidden');
        generateShoppingProducts();
    });

    if (optAdd) optAdd.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.getElementById('shopping-add-product-modal').classList.remove('hidden');
    });

    if (optManage) optManage.addEventListener('click', () => {
        modal.classList.add('hidden');
        enterShoppingManageMode();
    });

    if (optCancel) optCancel.addEventListener('click', () => modal.classList.add('hidden'));

    // 新增商品
    const closeAddBtn = document.getElementById('close-shopping-add-product');
    const saveAddBtn = document.getElementById('save-shopping-product-btn');
    const addModal = document.getElementById('shopping-add-product-modal');

    if (closeAddBtn) closeAddBtn.addEventListener('click', () => addModal.classList.add('hidden'));
    if (saveAddBtn) saveAddBtn.addEventListener('click', handleSaveShoppingProduct);

    // 管理模式
    const exitManageBtn = document.getElementById('exit-shopping-manage-btn');
    const deleteItemsBtn = document.getElementById('delete-shopping-items-btn');
    const selectAllBtn = document.getElementById('shopping-select-all-btn');

    if (exitManageBtn) exitManageBtn.addEventListener('click', exitShoppingManageMode);
    if (deleteItemsBtn) deleteItemsBtn.addEventListener('click', deleteSelectedShoppingItems);
    if (selectAllBtn) selectAllBtn.addEventListener('click', toggleSelectAllShoppingItems);

    const linkContactBtn = document.getElementById('shopping-link-contact-btn');
    if (linkContactBtn) {
        linkContactBtn.addEventListener('click', () => {
            openShoppingContactPicker();
        });
        // 初始化按钮状态
        updateLinkButtonState();
    }

    const shareBtn = document.getElementById('shopping-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            console.log('Share button clicked', currentShoppingProduct);
            if (currentShoppingProduct) {
                openProductShareContactPicker(currentShoppingProduct);
            } else {
                alert('当前没有选中的商品');
            }
        });
    }

    // 详情页关闭按钮
    const closeDetailBtn = document.getElementById('close-shopping-detail');
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => {
            document.getElementById('shopping-detail-screen').classList.add('hidden');
        });
    }

    // Bind Tab Clicks
    const tabs = document.querySelectorAll('#shopping-app .wechat-tab-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            if (tabName) {
                window.switchShoppingTab(tabName);
                if (tabName === 'cart') {
                    renderShoppingCart();
                }
            }
        });
    });
}

function handleSaveShoppingProduct() {
    const title = document.getElementById('shopping-add-title').value.trim();
    const price = document.getElementById('shopping-add-price').value.trim();
    const shop = document.getElementById('shopping-add-shop').value.trim();
    const paid = document.getElementById('shopping-add-paid').value.trim();
    const desc = document.getElementById('shopping-add-desc').value.trim();

    if (!title || !price) {
        alert('请至少输入商品标题和价格');
        return;
    }

    const bgColor = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    // 如果没有输入图片描述，使用标题
    const imageDesc = desc ? desc.substring(0, 5) : title.substring(0, 5);
    
    // 生成图片
    const height = Math.floor(Math.random() * (250 - 150 + 1)) + 150;
    const imgUrl = generatePlaceholderImage(300, height, imageDesc, '#' + bgColor);

    const product = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        title: title,
        price: parseFloat(price),
        paid_count: paid || '0',
        shop_name: shop || '个人小店',
        image_desc: imageDesc,
        detail_desc: desc || title,
        aiImage: null 
    };

    if (!window.iphoneSimState.shoppingProducts) {
        window.iphoneSimState.shoppingProducts = [];
    }
    // 新增商品显示在最前面
    window.iphoneSimState.shoppingProducts.unshift(product);
    saveConfig();

    ensureShoppingContainer();
    renderShoppingProducts(window.iphoneSimState.shoppingProducts);
    
    // 清空输入框
    document.getElementById('shopping-add-title').value = '';
    document.getElementById('shopping-add-price').value = '';
    document.getElementById('shopping-add-shop').value = '';
    document.getElementById('shopping-add-paid').value = '';
    document.getElementById('shopping-add-desc').value = '';
    
    document.getElementById('shopping-add-product-modal').classList.add('hidden');
    
    // 尝试为新商品生成AI图片
    if (desc) {
        (async () => {
            const url = await generateAiImage(desc);
            if (url) {
                product.aiImage = url;
                saveConfig();
                const imgEl = document.getElementById(`product-img-${product.id}`);
                if (imgEl) imgEl.src = url;
            }
        })();
    }
}

function enterShoppingManageMode() {
    isShoppingManageMode = true;
    selectedShoppingProducts.clear();
    
    document.getElementById('shopping-manage-header').classList.remove('hidden');
    const container = document.querySelector('.shopping-waterfall-container');
    if (container) container.classList.add('manage-mode');
    
    updateDeleteButton();
    // 重新渲染以绑定点击事件
    if (window.iphoneSimState.shoppingProducts) {
        renderShoppingProducts(window.iphoneSimState.shoppingProducts);
    }
}

function exitShoppingManageMode() {
    isShoppingManageMode = false;
    selectedShoppingProducts.clear();
    
    document.getElementById('shopping-manage-header').classList.add('hidden');
    const container = document.querySelector('.shopping-waterfall-container');
    if (container) container.classList.remove('manage-mode');
    
    // 重新渲染以移除点击事件
    if (window.iphoneSimState.shoppingProducts) {
        renderShoppingProducts(window.iphoneSimState.shoppingProducts);
    }
}

function toggleProductSelection(id, cardElement) {
    if (selectedShoppingProducts.has(id)) {
        selectedShoppingProducts.delete(id);
        cardElement.classList.remove('manage-active');
        cardElement.querySelector('.shopping-checkbox').classList.remove('checked');
    } else {
        selectedShoppingProducts.add(id);
        cardElement.classList.add('manage-active');
        cardElement.querySelector('.shopping-checkbox').classList.add('checked');
    }
    updateDeleteButton();
}

function toggleSelectAllShoppingItems() {
    const allProducts = window.iphoneSimState.shoppingProducts || [];
    if (allProducts.length === 0) return;

    if (selectedShoppingProducts.size === allProducts.length) {
        // Deselect all
        selectedShoppingProducts.clear();
    } else {
        // Select all
        selectedShoppingProducts.clear();
        allProducts.forEach(p => selectedShoppingProducts.add(p.id));
    }
    
    updateDeleteButton();
    // Re-render to update UI state
    renderShoppingProducts(allProducts);
}

function updateDeleteButton() {
    const btn = document.getElementById('delete-shopping-items-btn');
    if (btn) {
        btn.textContent = `删除(${selectedShoppingProducts.size})`;
    }
    const selectAllBtn = document.getElementById('shopping-select-all-btn');
    if (selectAllBtn) {
        const allCount = window.iphoneSimState.shoppingProducts ? window.iphoneSimState.shoppingProducts.length : 0;
        if (allCount > 0 && selectedShoppingProducts.size === allCount) {
            selectAllBtn.textContent = '取消全选';
        } else {
            selectAllBtn.textContent = '全选';
        }
    }
}

function deleteSelectedShoppingItems() {
    if (selectedShoppingProducts.size === 0) return;
    
    if (confirm(`确定要删除选中的 ${selectedShoppingProducts.size} 个商品吗？`)) {
        window.iphoneSimState.shoppingProducts = window.iphoneSimState.shoppingProducts.filter(p => !selectedShoppingProducts.has(p.id));
        saveConfig();
        renderShoppingProducts(window.iphoneSimState.shoppingProducts);
        exitShoppingManageMode();
    }
}

function updateLinkButtonState() {
    const btn = document.getElementById('shopping-link-contact-btn');
    if (!btn) return;
    
    // 兼容旧的单选数据
    let linkedIds = window.iphoneSimState.shoppingLinkedContactIds || [];
    if (window.iphoneSimState.shoppingLinkedContactId && !linkedIds.includes(window.iphoneSimState.shoppingLinkedContactId)) {
        linkedIds.push(window.iphoneSimState.shoppingLinkedContactId);
    }
    
    if (linkedIds.length > 0) {
        btn.style.color = '#007AFF'; // Active color
    } else {
        btn.style.color = '#333'; // Default color
    }
}

function openShoppingContactPicker() {
    const modal = document.getElementById('contact-picker-modal');
    const list = document.getElementById('contact-picker-list');
    const sendBtn = document.getElementById('contact-picker-send-btn');
    const closeBtn = document.getElementById('close-contact-picker');
    
    if (!modal || !list) return;
    
    // 修改标题和按钮文本以适应当前上下文
    const header = modal.querySelector('.modal-header h3');
    if (header) header.textContent = '选择关联联系人 / 世界书';
    
    if (sendBtn) {
        sendBtn.textContent = '确定';
        // 移除旧的监听器 (cloneNode trick)
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
        
        newSendBtn.onclick = () => {
            const selected = list.querySelectorAll('input[type="checkbox"][name="shopping-contact"]:checked');
            const ids = Array.from(selected).map(cb => parseInt(cb.value)).filter(id => id !== 0);
            
            window.iphoneSimState.shoppingLinkedContactIds = ids;
            // 清除旧的单选数据以避免混淆
            delete window.iphoneSimState.shoppingLinkedContactId;
            
            // 保存选中的世界书
            const selectedWb = list.querySelectorAll('input[type="checkbox"][name="shopping-wb"]:checked');
            const wbIds = Array.from(selectedWb).map(cb => parseInt(cb.value));
            window.iphoneSimState.shoppingLinkedWbIds = wbIds;
            
            saveConfig(); // Assume saveConfig is global
            updateLinkButtonState();
            modal.classList.add('hidden');
            
            let msg = '';
            if (ids.length > 0) msg += `已关联 ${ids.length} 位联系人`;
            if (wbIds.length > 0) msg += (msg ? '，' : '') + `已关联 ${wbIds.length} 个世界书`;
            
            if (msg) {
                alert(msg);
            } else {
                alert('已取消关联');
            }
        };
    }
    
    // 绑定关闭按钮
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.onclick = () => modal.classList.add('hidden');
    }

    list.innerHTML = '';
    
    // 获取当前选中的ID列表
    let currentIds = window.iphoneSimState.shoppingLinkedContactIds || [];
    if (window.iphoneSimState.shoppingLinkedContactId && currentIds.length === 0) {
        currentIds = [window.iphoneSimState.shoppingLinkedContactId];
    }
    
    let currentWbIds = window.iphoneSimState.shoppingLinkedWbIds || [];

    // 添加联系人列表标题
    const contactHeader = document.createElement('div');
    contactHeader.textContent = '联系人';
    contactHeader.style.padding = '10px 15px 5px';
    contactHeader.style.fontSize = '12px';
    contactHeader.style.color = '#999';
    contactHeader.style.background = '#f5f5f5';
    list.appendChild(contactHeader);

    // 添加联系人列表
    if (window.iphoneSimState.contacts) {
        window.iphoneSimState.contacts.forEach(c => {
            const item = document.createElement('div');
            item.className = 'list-item';
            const isChecked = currentIds.includes(c.id);
            
            item.innerHTML = `
                <div class="list-content" style="display: flex; align-items: center; justify-content: flex-start;">
                    <img src="${c.avatar}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; object-fit: cover; flex-shrink: 0;">
                    <span style="font-size: 16px;">${c.remark || c.name}</span>
                </div>
                <input type="checkbox" name="shopping-contact" value="${c.id}" ${isChecked ? 'checked' : ''} style="width: 20px; height: 20px;">
            `;
            item.onclick = (e) => {
                // 如果点击的是 checkbox 本身，不处理
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input');
                    if (checkbox) checkbox.checked = !checkbox.checked;
                }
            };
            list.appendChild(item);
        });
    }

    // 添加世界书列表标题
    const wbHeader = document.createElement('div');
    wbHeader.textContent = '世界书 (将作为背景设定发送给AI)';
    wbHeader.style.padding = '10px 15px 5px';
    wbHeader.style.fontSize = '12px';
    wbHeader.style.color = '#999';
    wbHeader.style.background = '#f5f5f5';
    list.appendChild(wbHeader);

    // 添加世界书列表
    if (window.iphoneSimState.wbCategories && window.iphoneSimState.wbCategories.length > 0) {
        window.iphoneSimState.wbCategories.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'list-item';
            const isChecked = currentWbIds.includes(cat.id);
            
            item.innerHTML = `
                <div class="list-content" style="display: flex; align-items: center; justify-content: flex-start;">
                    <div style="width: 40px; height: 40px; border-radius: 8px; background: #FF9500; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: #fff;">
                        <i class="fas fa-book"></i>
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 16px;">${cat.name}</span>
                        <span style="font-size: 12px; color: #999;">${cat.desc || '无描述'}</span>
                    </div>
                </div>
                <input type="checkbox" name="shopping-wb" value="${cat.id}" ${isChecked ? 'checked' : ''} style="width: 20px; height: 20px;">
            `;
            item.onclick = (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input');
                    if (checkbox) checkbox.checked = !checkbox.checked;
                }
            };
            list.appendChild(item);
        });
    } else {
        const emptyItem = document.createElement('div');
        emptyItem.style.padding = '15px';
        emptyItem.style.textAlign = 'center';
        emptyItem.style.color = '#999';
        emptyItem.textContent = '暂无世界书分类';
        list.appendChild(emptyItem);
    }
    
    modal.classList.remove('hidden');
}

// 初始化购物UI (在加载配置后调用)
window.initShoppingUI = function() {
    // 恢复已保存的商品
    if (window.iphoneSimState.shoppingProducts && window.iphoneSimState.shoppingProducts.length > 0) {
        // 确保所有商品都有ID (修复旧数据)
        let needSave = false;
        window.iphoneSimState.shoppingProducts.forEach((p, index) => {
            if (!p.id) {
                p.id = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9) + '_' + index;
                needSave = true;
            }
        });
        if (needSave) saveConfig();

        ensureShoppingContainer();
        renderShoppingProducts(window.iphoneSimState.shoppingProducts);
    }

    // 恢复外卖商品
    if (window.iphoneSimState.deliveryItems && window.iphoneSimState.deliveryItems.length > 0) {
        ensureDeliveryContainer();
        renderDeliveryItems();
    }

    updateLinkButtonState();
};

// 生成商品数据
async function generateShoppingProducts() {
    // 检查当前 Tab
    const currentTab = document.querySelector('#shopping-app .wechat-tab-item.active');
    if (currentTab && currentTab.dataset.tab === 'delivery') {
        return generateDeliveryItems();
    }

    const settings = window.iphoneSimState.aiSettings.url ? window.iphoneSimState.aiSettings : window.iphoneSimState.aiSettings2;
    if (!settings.url || !settings.key) {
        alert('请先在设置中配置 AI API');
        return;
    }

    // 显示加载状态
    const container = document.getElementById('shopping-tab-home');
    
    // 确保容器存在，以免 loading 没地方放或者把默认内容挤乱
    ensureShoppingContainer();
    const waterfallContainer = container.querySelector('.shopping-waterfall-container');

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'shopping-loading';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '20px';
    loadingDiv.style.color = '#999';
    loadingDiv.textContent = '正在生成推荐商品...';
    
    // 清除可能存在的旧加载提示
    const oldLoading = document.getElementById('shopping-loading');
    if (oldLoading) oldLoading.remove();
    
    if (waterfallContainer) {
        container.insertBefore(loadingDiv, waterfallContainer);
    } else {
        container.appendChild(loadingDiv);
    }

    let userContext = '';
    
    // 获取关联联系人ID列表 (兼容单选和多选)
    let linkedIds = window.iphoneSimState.shoppingLinkedContactIds || [];
    if (window.iphoneSimState.shoppingLinkedContactId && !linkedIds.includes(window.iphoneSimState.shoppingLinkedContactId)) {
        linkedIds.push(window.iphoneSimState.shoppingLinkedContactId);
    }

    if (linkedIds.length > 0) {
        userContext += `\n【关联联系人信息】\n你现在需要根据以下 ${linkedIds.length} 位联系人的人设和与用户的聊天记录，推荐他们可能会感兴趣，或者用户可能会买给他们，或者符合你们聊天话题的商品。\n`;
        
        linkedIds.forEach((id, index) => {
            const contact = window.iphoneSimState.contacts.find(c => c.id === id);
            if (contact) {
                const name = contact.remark || contact.name;
                userContext += `\n--- 联系人 ${index + 1}: ${name} ---\n`;
                userContext += `人设: ${contact.persona || '无'}\n`;
                
                // 获取最近聊天记录
                const history = window.iphoneSimState.chatHistory[id] || [];
                if (history.length > 0) {
                    const recentMsgs = history.slice(-15).map(m => { // 每个联系人取最近15条
                        const role = m.role === 'user' ? '用户' : name;
                        let content = m.content;
                        if (m.type === 'image') content = '[图片]';
                        if (m.type === 'sticker') content = '[表情包]';
                        return `${role}: ${content}`;
                    }).join('\n');
                    userContext += `最近聊天记录:\n${recentMsgs}\n`;
                }
            }
        });
    }

    // 获取关联的世界书
    let linkedWbIds = window.iphoneSimState.shoppingLinkedWbIds || [];
    if (linkedWbIds.length > 0 && window.iphoneSimState.worldbook) {
        userContext += `\n【关联世界书/背景设定】\n以下是相关的世界观设定，请生成符合这些设定的商品：\n`;
        
        let wbContentFound = false;
        // 查找属于这些分类且启用的条目
        window.iphoneSimState.worldbook.forEach(entry => {
            if (linkedWbIds.includes(entry.categoryId) && entry.enabled) {
                const title = entry.remark || (entry.keys ? entry.keys.join(', ') : '无标题');
                userContext += `\n--- 设定: ${title} ---\n${entry.content}\n`;
                wbContentFound = true;
            }
        });
        
        if (!wbContentFound) {
            userContext += `(选中的世界书分类下暂无启用的条目)\n`;
        }
    }

    const systemPrompt = `你是一个电商推荐助手。请生成 6-8 个虚构的商品信息，用于模拟淘宝/电商APP的首页推荐流。
请直接返回 JSON 数组格式，不要包含任何 Markdown 标记或其他文本。
每个商品包含以下字段：
- title: 商品标题 (简短有力，类似淘宝标题)
- price: 价格 (数字，可以是整数或小数)
- paid_count: 付款人数 (例如 "100+", "2.5万+", "5000+")
- shop_name: 店铺名称
- image_desc: 商品图片的简短中文描述 (不超过5个字，用于生成占位图文字)
- detail_desc: 商品详情页的详细描述 (一段话，描述商品卖点、材质、规格等，50-100字)

${userContext ? userContext : '商品种类要丰富，包括但不限于：服饰、数码、美食、家居、美妆等。'}

示例：
[
  {"title": "2025新款纯棉白色T恤男女同款宽松", "price": 39.9, "paid_count": "1万+", "shop_name": "优选服饰", "image_desc": "白色T恤", "detail_desc": "精选优质新疆长绒棉，亲肤透气，不易变形。宽松版型设计，遮肉显瘦，男女同款。"},
  {"title": "网红爆款芝士半熟光头蛋糕", "price": 28.8, "paid_count": "5000+", "shop_name": "美味烘焙", "image_desc": "芝士蛋糕", "detail_desc": "进口安佳芝士，奶香浓郁，入口即化。现烤现发，日期新鲜，早餐下午茶首选。"}
]`;

    try {
        let fetchUrl = settings.url;
        if (!fetchUrl.endsWith('/chat/completions')) {
            fetchUrl = fetchUrl.endsWith('/') ? fetchUrl + 'chat/completions' : fetchUrl + '/chat/completions';
        }

        const cleanKey = settings.key ? settings.key.replace(/[^\x00-\x7F]/g, "").trim() : '';
        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanKey}`
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: '生成推荐商品' }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;
        
        // 尝试解析 JSON
        let products = [];
        try {
            // 清理可能存在的 markdown 标记
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // 尝试直接解析
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                products = parsed;
            } else if (parsed.products && Array.isArray(parsed.products)) {
                products = parsed.products;
            } else {
                // 如果返回的是对象但没有 products 字段，尝试找第一个数组字段
                for (let key in parsed) {
                    if (Array.isArray(parsed[key])) {
                        products = parsed[key];
                        break;
                    }
                }
            }
        } catch (e) {
            console.error('JSON Parse Error:', e);
            alert('生成数据格式错误，请重试');
        }

        if (products.length > 0) {
            // 为每个商品添加唯一ID (Robuster ID generation)
            products.forEach((p, index) => {
                p.id = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9) + '_' + index;
            });

            // 保存到状态
            if (!window.iphoneSimState.shoppingProducts) {
                window.iphoneSimState.shoppingProducts = [];
            }
            window.iphoneSimState.shoppingProducts.push(...products);
            saveConfig();
            
            // 渲染新商品
            renderShoppingProducts(products);

            // 尝试异步生成图片
            (async () => {
                for (const p of products) {
                    if (p.image_desc) {
                        const url = await generateAiImage(p.image_desc);
                        if (url) {
                            p.aiImage = url;
                            saveConfig();
                            
                            // 更新界面
                            const imgEl = document.getElementById(`product-img-${p.id}`);
                            if (imgEl) {
                                imgEl.src = url;
                            }
                        }
                    }
                }
            })();
        } else {
            alert('未生成有效商品数据');
        }

    } catch (error) {
        console.error('生成商品失败:', error);
        alert(`生成失败: ${error.message}`);
    } finally {
        const loading = document.getElementById('shopping-loading');
        if (loading) loading.remove();
    }
}

function renderShoppingProducts(products) {
    const col1 = document.getElementById('shopping-col-1');
    const col2 = document.getElementById('shopping-col-2');
    
    if (!col1 || !col2) return;

    // 如果 products 是全部商品（从 init/manage mode调用），我们需要先清空。
    if (products === window.iphoneSimState.shoppingProducts) {
        col1.innerHTML = '';
        col2.innerHTML = '';
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'shopping-card';
        card.dataset.id = p.id;
        
        if (isShoppingManageMode) {
            card.style.cursor = 'pointer';
            card.onclick = () => toggleProductSelection(p.id, card);
            card.classList.add('manage-active-style'); // Just a hook for CSS if needed, but styling is via class on container
        } else {
            // 正常模式点击打开详情
            card.style.cursor = 'pointer';
            card.onclick = () => openShoppingProductDetail(p);
        }

        // Check if selected
        const isSelected = selectedShoppingProducts.has(p.id);
        if (isSelected && isShoppingManageMode) {
            card.classList.add('manage-active'); // Re-apply visual selection state
        }

        card.style.background = '#fff';
        card.style.borderRadius = '8px';
        card.style.overflow = 'hidden';
        card.style.paddingBottom = '10px';
        
        // 确保有固定的背景色和高度 (持久化)
        if (!p.bgColor) {
            p.bgColor = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        }
        if (!p.imgHeight) {
            p.imgHeight = Math.floor(Math.random() * (250 - 150 + 1)) + 150;
        }

        const validBgColor = '#' + p.bgColor;
        const height = p.imgHeight;

        // 优先使用AI生成的图片
        const imgUrl = p.aiImage || generatePlaceholderImage(300, height, p.image_desc || '商品', validBgColor);

        card.innerHTML = `
            <div class="shopping-checkbox ${isSelected ? 'checked' : ''}"></div>
            <img id="product-img-${p.id}" src="${imgUrl}" style="width: 100%; display: block; object-fit: cover; aspect-ratio: 300/${height};">
            <div style="padding: 8px 8px 0 8px;">
                <div style="font-size: 14px; color: #333; margin-bottom: 6px; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; font-weight: 500;">${p.title}</div>
                <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px;">
                    <span style="color: #ff5000; font-size: 12px;">¥</span>
                    <span style="color: #ff5000; font-size: 18px; font-weight: bold;">${p.price}</span>
                    <span style="color: #999; font-size: 11px; margin-left: 4px;">${p.paid_count}人付款</span>
                </div>
                <div style="display: flex; align-items: center; color: #999; font-size: 11px;">
                   <span>${p.shop_name}</span>
                   <i class="fas fa-chevron-right" style="font-size: 10px; margin-left: 2px; transform: scale(0.8);"></i>
                </div>
            </div>
        `;

        // 简单的瀑布流算法：添加到较短的一列
        if (col1.offsetHeight <= col2.offsetHeight) {
            col1.appendChild(card);
        } else {
            col2.appendChild(card);
        }
    });
}

function openShoppingProductDetail(product) {
    currentShoppingProduct = product;
    const screen = document.getElementById('shopping-detail-screen');
    if (!screen) return;

    // 绑定加入购物车事件
    const addToCartBtn = document.getElementById('detail-add-to-cart-btn');
    if (addToCartBtn) {
        // Remove old listeners by cloning
        const newBtn = addToCartBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
        
        newBtn.onclick = () => {
            addToCart(product);
            // 显示成功反馈
            const toast = document.getElementById('shopping-success-toast');
            if (toast) {
                toast.classList.remove('hidden');
                // Checkmark animation
                const icon = toast.querySelector('i');
                if (icon) {
                    icon.style.transform = 'scale(0)';
                    icon.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    requestAnimationFrame(() => {
                        icon.style.transform = 'scale(1)';
                    });
                }
                
                setTimeout(() => {
                    toast.classList.add('hidden');
                }, 1500);
            } else {
                if (window.showChatToast) window.showChatToast('已加入购物车');
                else alert('已加入购物车');
            }
        };
    }

    // 绑定立即购买事件
    const buyNowBtn = document.getElementById('detail-buy-now-btn');
    if (buyNowBtn) {
        const newBtn = buyNowBtn.cloneNode(true);
        buyNowBtn.parentNode.replaceChild(newBtn, buyNowBtn);
        // Change: open payment choice instead of direct buy
        newBtn.onclick = () => openPaymentChoice(product.price, [product]);
    }

    // 针对外卖商品隐藏加入购物车按钮
    if (product.isDelivery) {
        if (addToCartBtn) addToCartBtn.classList.add('hidden');
    } else {
        if (addToCartBtn) addToCartBtn.classList.remove('hidden');
    }

    // 填充数据
    const imgEl = document.getElementById('shopping-detail-img');
    const priceEl = document.getElementById('shopping-detail-price');
    const titleEl = document.getElementById('shopping-detail-title');
    const paidEl = document.getElementById('shopping-detail-paid');
    const shopEl = document.getElementById('shopping-detail-shop');
    const descEl = document.getElementById('shopping-detail-desc');

    if (imgEl) {
        // 使用卡片上的图片URL (可能已经有AI图片了)
        // 重新生成一个高清的或者复用现有的
        // 这里简单复用 product 的 aiImage 或者 generatePlaceholder
        if (product.aiImage) {
            imgEl.src = product.aiImage;
        } else {
            // 重新生成一个占位图，或者从DOM中获取？
            // 重新生成比较简单，背景色可能变，但这是 placeholder
            imgEl.src = generatePlaceholderImage(600, 600, product.image_desc || product.title, '#cccccc'); 
        }
    }

    // 重新绑定分享按钮事件，确保每次打开详情页时都绑定正确的事件
    const shareBtn = document.getElementById('shopping-share-btn');
    if (shareBtn) {
        shareBtn.onclick = () => {
            openProductShareContactPicker(product);
        };
    }
    
    if (priceEl) priceEl.textContent = product.price;
    if (titleEl) titleEl.textContent = product.title;
    if (paidEl) {
        // 如果包含非数字字符（除了万/+等），可能已经是完整描述
        if (product.paid_count && (product.paid_count.toString().includes('月售') || product.paid_count.toString().includes('人付款'))) {
            paidEl.textContent = product.paid_count;
        } else {
            paidEl.textContent = product.paid_count + '人付款';
        }
    }
    if (shopEl) shopEl.textContent = product.shop_name;
    if (descEl) {
        if (product.detail_desc) {
             descEl.textContent = product.detail_desc;
        } else {
             descEl.textContent = product.title + '\n\n' + (product.image_desc || '暂无详情描述');
        }
    }

    screen.classList.remove('hidden');
}

// 加入购物车
function addToCart(product) {
    if (!window.iphoneSimState.shoppingCart) {
        window.iphoneSimState.shoppingCart = [];
    }
    // Check if already in cart
    const existing = window.iphoneSimState.shoppingCart.find(item => item.id === product.id);
    if (existing) {
        existing.count = (existing.count || 1) + 1;
    } else {
        window.iphoneSimState.shoppingCart.push({
            ...product,
            count: 1,
            selected: true // Default selected
        });
    }
    saveConfig();
}

// 渲染购物车
function renderShoppingCart() {
    const container = document.getElementById('shopping-tab-cart');
    if (!container) return;

    const cart = window.iphoneSimState.shoppingCart || [];
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #999; margin-top: 50px;">
                <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 15px; color: #ccc;"></i>
                <p>购物车空空如也</p>
            </div>
        `;
        return;
    }

    let html = '<div style="padding: 10px;">';
    
    cart.forEach(item => {
        // Ensure image properties exist (fallback for old data)
        const bgColor = item.bgColor || 'cccccc'; 
        const height = item.imgHeight || 300;
        const validBgColor = '#' + bgColor.replace('#', '');
        const imgUrl = item.aiImage || generatePlaceholderImage(300, height, item.image_desc || '商品', validBgColor);

        html += `
            <div class="cart-item-wrapper" style="position: relative; margin-bottom: 10px; overflow: hidden; border-radius: 12px;">
                <div class="cart-item-delete" onclick="deleteCartItem('${item.id}')" style="position: absolute; top: 0; right: 0; bottom: 0; width: 80px; background: #FF3B30; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer;">删除</div>
                <div class="cart-item" id="cart-item-${item.id}" 
                     style="background: #fff; padding: 10px; display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; transition: transform 0.2s ease-out;"
                     ontouchstart="handleCartTouchStart(event, '${item.id}')"
                     ontouchmove="handleCartTouchMove(event, '${item.id}')"
                     ontouchend="handleCartTouchEnd(event, '${item.id}')"
                     oncontextmenu="handleCartContextMenu(event, '${item.id}')">
                    <div class="cart-checkbox ${item.selected ? 'checked' : ''}" onclick="toggleCartItemSelection('${item.id}')" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; ${item.selected ? 'background: #FF5000; border-color: #FF5000;' : ''}">
                        ${item.selected ? '<i class="fas fa-check" style="color: #fff; font-size: 12px;"></i>' : ''}
                    </div>
                    <img src="${imgUrl}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; flex-shrink: 0;">
                    <div style="flex: 1; overflow: hidden;">
                        <div style="font-size: 14px; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</div>
                        <div style="background: #f5f5f5; color: #999; font-size: 12px; padding: 2px 5px; border-radius: 4px; display: inline-block; margin-bottom: 5px;">默认规格</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="color: #FF5000; font-weight: bold;">¥${item.price}</div>
                            <div style="font-size: 12px; color: #666;">x${item.count}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    // Bottom Action Bar for Cart
    const totalPrice = cart.filter(i => i.selected).reduce((sum, item) => sum + (item.price * item.count), 0).toFixed(2);
    const totalCount = cart.filter(i => i.selected).reduce((sum, item) => sum + item.count, 0);

    html += `</div>
        <div style="position: fixed; bottom: calc(50px + env(safe-area-inset-bottom)); left: 0; width: 100%; background: #fff; border-top: 1px solid #eee; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; z-index: 90;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div onclick="toggleSelectAllCart()" style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                    <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; ${cart.every(i => i.selected) ? 'background: #FF5000; border-color: #FF5000;' : ''}">
                        ${cart.every(i => i.selected) ? '<i class="fas fa-check" style="color: #fff; font-size: 12px;"></i>' : ''}
                    </div>
                    <span style="font-size: 14px; color: #666;">全选</span>
                </div>
                <div style="margin-left: 10px;">
                    <span style="font-size: 14px;">合计:</span>
                    <span style="color: #FF5000; font-weight: bold; font-size: 16px;">¥${totalPrice}</span>
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="handleCartPayByFriend()" style="background: linear-gradient(90deg, #FFCB00, #FF9402); color: #fff; border: none; padding: 8px 15px; border-radius: 20px; font-size: 14px; font-weight: bold;">找人付</button>
                <button onclick="handleCartBuy()" style="background: linear-gradient(90deg, #FF5E00, #FF2A00); color: #fff; border: none; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold;">结算(${totalCount})</button>
            </div>
        </div>
    `;

    // Add extra padding to container bottom to avoid overlap with fixed bottom bar
    container.style.paddingBottom = '120px';
    container.innerHTML = html;
}

window.toggleCartItemSelection = function(id) {
    const cart = window.iphoneSimState.shoppingCart;
    const item = cart.find(i => i.id === id);
    if (item) {
        item.selected = !item.selected;
        saveConfig();
        renderShoppingCart();
    }
};

window.toggleSelectAllCart = function() {
    const cart = window.iphoneSimState.shoppingCart;
    if (!cart || cart.length === 0) return;
    
    const allSelected = cart.every(i => i.selected);
    cart.forEach(i => i.selected = !allSelected);
    saveConfig();
    renderShoppingCart();
};

// 支付方式选择相关
let pendingPaymentItems = [];
let pendingPaymentAmount = 0;

window.handleCartBuy = function() {
    const cart = window.iphoneSimState.shoppingCart || [];
    const selected = cart.filter(i => i.selected);
    if (selected.length === 0) {
        alert('请至少选择一件商品');
        return;
    }
    
    const totalStr = selected.reduce((s, i) => s + i.price * i.count, 0).toFixed(2);
    openPaymentChoice(parseFloat(totalStr), selected, true);
};

window.handleBuyNow = function(product) {
    // This is now just a wrapper if called directly, but usually we use openPaymentChoice
    openPaymentChoice(product.price, [product]);
};

function openPaymentChoice(amount, items, isCart = false) {
    pendingPaymentAmount = amount;
    // Normalize items structure
    pendingPaymentItems = items.map(item => ({
        ...item,
        count: item.count || 1,
        // Ensure image properties exist
        image: item.image || item.aiImage || generatePlaceholderImage(300, item.imgHeight || 300, item.image_desc || item.title || '商品', '#' + (item.bgColor || 'cccccc').replace('#', ''))
    }));
    pendingPaymentItems.isCart = isCart; // Flag to know if we need to clear cart later

    const modal = document.getElementById('shopping-payment-choice-modal');
    if (!modal) return;

    const totalEl = document.getElementById('payment-choice-total');
    if (totalEl) totalEl.textContent = '¥' + amount.toFixed(2);

    // Bind buttons
    const selfBtn = document.getElementById('payment-choice-self');
    const giftBtn = document.getElementById('payment-choice-gift');
    const closeBtn = document.getElementById('close-payment-choice');

    // Clone to remove old listeners
    if (selfBtn) {
        const newSelf = selfBtn.cloneNode(true);
        selfBtn.parentNode.replaceChild(newSelf, selfBtn);
        newSelf.onclick = () => {
            modal.classList.add('hidden');
            processSelfPayment();
        };
    }

    if (giftBtn) {
        const newGift = giftBtn.cloneNode(true);
        giftBtn.parentNode.replaceChild(newGift, giftBtn);
        newGift.onclick = () => {
            modal.classList.add('hidden');
            openShoppingGiftContactPicker(pendingPaymentItems);
        };
    }

    if (closeBtn) {
        const newClose = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newClose, closeBtn);
        newClose.onclick = () => modal.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

function processSelfPayment() {
    const totalAmount = pendingPaymentAmount;
    const totalStr = totalAmount.toFixed(2);
    
    // Check wallet balance
    if (!window.iphoneSimState.wallet) {
        window.iphoneSimState.wallet = { balance: 0, transactions: [] };
    }
    const wallet = window.iphoneSimState.wallet;
    
    if (wallet.balance < totalAmount) {
        alert(`余额不足，无法支付\n需支付: ¥${totalStr}\n当前余额: ¥${wallet.balance.toFixed(2)}`);
        return;
    }
    
    if (confirm(`确定要使用钱包余额支付 ¥${totalStr} 购买吗？`)) {
        // Create Order
        if (!window.iphoneSimState.shoppingOrders) {
            window.iphoneSimState.shoppingOrders = [];
        }
        
        // Prepare order items
        const orderItems = pendingPaymentItems.map(item => ({
            title: item.title,
            price: item.price,
            image: item.image,
            count: item.count,
            isDelivery: item.isDelivery
        }));

        const newOrder = {
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
            items: orderItems,
            total: totalStr,
            time: Date.now(),
            status: '待发货'
        };
        
        // Set realistic delays
        const hour = 3600000;
        newOrder.shipDelay = Math.floor(2 * hour + Math.random() * (22 * hour));
        newOrder.deliverDelay = Math.floor(48 * hour + Math.random() * (24 * hour));
        
        window.iphoneSimState.shoppingOrders.unshift(newOrder);

        // Deduct balance
        wallet.balance -= totalAmount;
        if (!wallet.transactions) wallet.transactions = [];
        wallet.transactions.unshift({
            id: Date.now().toString() + '_trans',
            type: 'expense',
            amount: totalAmount,
            title: '购物消费',
            time: Date.now(),
            relatedId: newOrder.id
        });

        // Clean up cart if needed
        if (pendingPaymentItems.isCart) {
            if (window.iphoneSimState.shoppingCart) {
                window.iphoneSimState.shoppingCart = window.iphoneSimState.shoppingCart.filter(i => !i.selected);
                renderShoppingCart();
            }
        }
        
        saveConfig();
        
        // Close details if open
        const detailScreen = document.getElementById('shopping-detail-screen');
        if (detailScreen && !detailScreen.classList.contains('hidden')) {
            detailScreen.classList.add('hidden');
        }
        
        window.switchShoppingTab('orders');
        alert('支付成功！已生成订单');
    }
}

window.handleCartPayByFriend = function() {
    const cart = window.iphoneSimState.shoppingCart || [];
    const selected = cart.filter(i => i.selected);
    if (selected.length === 0) {
        alert('请至少选择一件商品');
        return;
    }
    
    // Check contact picker availability
    openShoppingContactPickerForPay(selected);
};

// 购物车滑动删除逻辑
let cartTouchStartX = 0;
let cartCurrentItemId = null;

window.handleCartTouchStart = function(e, id) {
    cartTouchStartX = e.touches[0].clientX;
    cartCurrentItemId = id;
};

window.handleCartTouchMove = function(e, id) {
    if (cartCurrentItemId !== id) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - cartTouchStartX;
    const element = document.getElementById(`cart-item-${id}`);
    
    // 只允许左滑
    if (diff < 0) {
        // Limit swipe distance
        const translateX = Math.max(diff, -80);
        element.style.transform = `translateX(${translateX}px)`;
        // Prevent vertical scrolling while swiping horizontally
        if (Math.abs(diff) > 10) e.preventDefault();
    }
};

window.handleCartTouchEnd = function(e, id) {
    if (cartCurrentItemId !== id) return;
    const currentX = e.changedTouches[0].clientX;
    const diff = currentX - cartTouchStartX;
    const element = document.getElementById(`cart-item-${id}`);
    
    if (diff < -40) { // Threshold to open
        element.style.transform = 'translateX(-80px)';
    } else {
        element.style.transform = 'translateX(0)';
    }
    cartCurrentItemId = null;
};

window.handleCartContextMenu = function(e, id) {
    e.preventDefault();
    if (confirm('确定要删除这个商品吗？')) {
        deleteCartItem(id);
    }
};

window.deleteCartItem = function(id) {
    if (!window.iphoneSimState.shoppingCart) return;
    window.iphoneSimState.shoppingCart = window.iphoneSimState.shoppingCart.filter(i => i.id !== id);
    saveConfig();
    renderShoppingCart();
};

function openShoppingGiftContactPicker(items) {
    const modal = document.getElementById('contact-picker-modal');
    const list = document.getElementById('contact-picker-list');
    const sendBtn = document.getElementById('contact-picker-send-btn');
    const closeBtn = document.getElementById('close-contact-picker');
    
    if (!modal || !list) return;
    
    const header = modal.querySelector('.modal-header h3');
    if (header) header.textContent = '送给谁';
    
    if (sendBtn) {
        sendBtn.textContent = '支付并发送';
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
        
        newSendBtn.onclick = () => {
            try {
                // Check both checkbox types (shopping-contact or generic gift-contact)
                const selectedContact = list.querySelectorAll('input[type="checkbox"]:checked');
                const ids = Array.from(selectedContact).map(cb => parseInt(cb.value)).filter(id => id !== 0);
                
                if (ids.length > 0) {
                    const totalAmount = pendingPaymentAmount * ids.length;
                    
                    if (ids.length > 1 && !confirm(`你选择了 ${ids.length} 位好友，将购买 ${ids.length} 份商品，总计 ¥${(totalAmount).toFixed(2)}。确定吗？`)) {
                        return;
                    }
                    
                    if (!window.iphoneSimState.wallet) {
                        window.iphoneSimState.wallet = { balance: 0, transactions: [] };
                    }
                    const wallet = window.iphoneSimState.wallet;
                    if (wallet.balance < totalAmount) {
                        alert(`余额不足，无法支付\n需支付: ¥${totalAmount.toFixed(2)}\n当前余额: ¥${wallet.balance.toFixed(2)}`);
                        return;
                    }
                    
                    // Process payment
                    wallet.balance -= totalAmount;
                    
                    ids.forEach(contactId => {
                        const orderItems = items.map(item => ({
                            title: item.title,
                            price: item.price,
                            image: item.image,
                            count: item.count,
                            isDelivery: item.isDelivery
                        }));
                        
                        const newOrder = {
                            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
                            items: orderItems,
                            total: (pendingPaymentAmount).toFixed(2),
                            time: Date.now(),
                            status: '待发货',
                            giftTo: contactId
                        };
                        
                    const hour = 3600000;
                    newOrder.shipDelay = Math.floor(2 * hour + Math.random() * (22 * hour));
                    newOrder.deliverDelay = Math.floor(48 * hour + Math.random() * (24 * hour));
                    
                    if (!window.iphoneSimState.shoppingOrders) {
                        window.iphoneSimState.shoppingOrders = [];
                    }
                    window.iphoneSimState.shoppingOrders.unshift(newOrder);
                    
                    if (!wallet.transactions) wallet.transactions = [];
                    wallet.transactions.unshift({
                            id: Date.now().toString() + '_trans',
                            type: 'expense',
                            amount: pendingPaymentAmount,
                            title: '赠送礼物',
                            time: Date.now(),
                            relatedId: newOrder.id
                        });
                        
                        // 区分外卖分享和礼物分享
                        let msgType = 'shopping_gift';
                        const isDelivery = items.some(i => i.isDelivery);
                        if (isDelivery) {
                            msgType = 'delivery_share';
                        }

                        const msgData = {
                            items: items.map(i => ({
                                title: i.title,
                                price: i.price,
                                image: i.image,
                                isDelivery: i.isDelivery
                            })),
                            total: (pendingPaymentAmount).toFixed(2)
                        };
                        
                        // Robust sendMessage call
                        if (typeof sendMessage !== 'undefined') {
                            sendMessage(JSON.stringify(msgData), true, msgType, null, contactId);
                        } else if (window.sendMessage) {
                            window.sendMessage(JSON.stringify(msgData), true, msgType, null, contactId);
                        } else {
                            console.error('sendMessage not found');
                        }
                    });
                    
                    if (items.isCart && window.iphoneSimState.shoppingCart) {
                        window.iphoneSimState.shoppingCart = window.iphoneSimState.shoppingCart.filter(i => !i.selected);
                        renderShoppingCart();
                    }
                    saveConfig();
                    
                    modal.classList.add('hidden');
                    const detailScreen = document.getElementById('shopping-detail-screen');
                    if (detailScreen) detailScreen.classList.add('hidden');
                    window.switchShoppingTab('orders');
                    alert('支付成功！礼物已发送');
                } else {
                    alert('请选择联系人');
                }
            } catch (e) {
                console.error('Payment error:', e);
                alert('支付出错: ' + e.message);
            }
        };
    }
    
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.onclick = () => modal.classList.add('hidden');
    }

    list.innerHTML = '';
    if (window.iphoneSimState.contacts) {
        window.iphoneSimState.contacts.forEach(c => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div class="list-content" style="display: flex; align-items: center; justify-content: flex-start;">
                    <img src="${c.avatar}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; object-fit: cover; flex-shrink: 0;">
                    <span style="font-size: 16px;">${c.remark || c.name}</span>
                </div>
                <input type="checkbox" name="gift-contact" value="${c.id}" style="width: 20px; height: 20px;">
            `;
            item.onclick = (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input');
                    if (checkbox) checkbox.checked = !checkbox.checked;
                }
            };
            list.appendChild(item);
        });
    }
    
    modal.classList.remove('hidden');
}

function openShoppingContactPickerForPay(items) {
    const modal = document.getElementById('contact-picker-modal');
    const list = document.getElementById('contact-picker-list');
    const sendBtn = document.getElementById('contact-picker-send-btn');
    const closeBtn = document.getElementById('close-contact-picker');
    
    if (!modal || !list) return;
    
    const header = modal.querySelector('.modal-header h3');
    if (header) header.textContent = '请谁代付 / 送给谁';
    
    if (sendBtn) {
        sendBtn.textContent = '发送请求';
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
        
        newSendBtn.onclick = () => {
            const selectedContact = list.querySelectorAll('input[type="checkbox"]:checked');
            const ids = Array.from(selectedContact).map(cb => parseInt(cb.value)).filter(id => id !== 0);
            
            if (ids.length > 0) {
                const totalPrice = items.reduce((s, i) => s + i.price * i.count, 0).toFixed(2);
                const itemList = items.map(i => i.title).join(', ');
                const requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                // Construct message
                const payData = {
                    type: 'pay_request',
                    id: requestId,
                    total: totalPrice,
                    status: 'pending',
                    items: items.map(i => ({
                        title: i.title,
                        price: i.price,
                        image: i.aiImage || generatePlaceholderImage(300, 300, i.image_desc, '#ccc'),
                        isDelivery: i.isDelivery
                    }))
                };

                ids.forEach(id => {
                    if (typeof sendMessage !== 'undefined') {
                        // Send pay request card
                        sendMessage(JSON.stringify(payData), true, 'pay_request', null, id);
                    } else if (window.sendMessage) {
                        window.sendMessage(JSON.stringify(payData), true, 'pay_request', null, id);
                    }
                });
                modal.classList.add('hidden');
                alert('代付请求已发送');
            } else {
                alert('请选择联系人');
            }
        };
    }
    
    // Reuse existing contact picker logic
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.onclick = () => modal.classList.add('hidden');
    }

    list.innerHTML = '';
    if (window.iphoneSimState.contacts) {
        window.iphoneSimState.contacts.forEach(c => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div class="list-content" style="display: flex; align-items: center; justify-content: flex-start;">
                    <img src="${c.avatar}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; object-fit: cover; flex-shrink: 0;">
                    <span style="font-size: 16px;">${c.remark || c.name}</span>
                </div>
                <input type="checkbox" name="pay-contact" value="${c.id}" style="width: 20px; height: 20px;">
            `;
            item.onclick = (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input');
                    if (checkbox) checkbox.checked = !checkbox.checked;
                }
            };
            list.appendChild(item);
        });
    }
    modal.classList.remove('hidden');
}

// 生成占位图 (支持中文)
function generatePlaceholderImage(width, height, text, bgColor) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 填充背景
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 绘制文字
    ctx.fillStyle = '#ffffff';
    // 根据宽度动态调整字号
    const fontSize = Math.max(16, Math.min(32, width / (text.length || 1)));
    ctx.font = `bold ${fontSize}px "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    return canvas.toDataURL('image/jpeg', 0.8);
}

// 调用 AI 生成图片
async function generateAiImage(prompt) {
    const settings = window.iphoneSimState.aiSettings.url ? window.iphoneSimState.aiSettings : window.iphoneSimState.aiSettings2;
    if (!settings.url || !settings.key) return null;

    try {
        let baseUrl = settings.url;
        // 尝试推断图片生成地址
        if (baseUrl.endsWith('/v1')) {
            baseUrl = baseUrl + '/images/generations';
        } else if (baseUrl.endsWith('/chat/completions')) {
            baseUrl = baseUrl.replace('/chat/completions', '/images/generations');
        } else if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl + 'images/generations';
        } else {
            // 默认假设它是 host，追加 /v1/...
            baseUrl = baseUrl + '/v1/images/generations';
        }

        const cleanKey = settings.key ? settings.key.replace(/[^\x00-\x7F]/g, "").trim() : '';
        
        console.log('Generating image with prompt:', prompt);
        
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: "256x256", // 使用小尺寸
                response_format: "url" // 或 b64_json
            })
        });

        if (!response.ok) {
            console.warn('Image generation failed status:', response.status);
            return null;
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0].url; // 或 b64_json
        }
    } catch (e) {
        console.error('Image generation error:', e);
    }
    return null;
}

function openProductShareContactPicker(product) {
    const modal = document.getElementById('contact-picker-modal');
    const list = document.getElementById('contact-picker-list');
    const sendBtn = document.getElementById('contact-picker-send-btn');
    const closeBtn = document.getElementById('close-contact-picker');
    
    if (!modal || !list) return;
    
    const header = modal.querySelector('.modal-header h3');
    if (header) header.textContent = '分享商品给';
    
    if (sendBtn) {
        sendBtn.textContent = '发送';
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
        
        newSendBtn.onclick = () => {
            const selected = list.querySelectorAll('input[type="checkbox"]:checked');
            const ids = Array.from(selected).map(cb => parseInt(cb.value)).filter(id => id !== 0);
            
            if (ids.length > 0) {
                // 构建商品数据
                let imgUrl = product.aiImage;
                if (!imgUrl) {
                     const bgColor = 'cccccc'; // 简单fallback
                     imgUrl = generatePlaceholderImage(300, 300, product.image_desc || product.title, '#' + bgColor);
                }

                const productData = {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: imgUrl,
                    shop_name: product.shop_name
                };
                
                ids.forEach(id => {
                    // 调用 chat.js 中的 sendMessage (假设它是全局的)
                    if (typeof sendMessage !== 'undefined') {
                        sendMessage(JSON.stringify(productData), true, 'product_share', null, id);
                    } else if (window.sendMessage) {
                        window.sendMessage(JSON.stringify(productData), true, 'product_share', null, id);
                    } else {
                        console.error('sendMessage function not found');
                    }
                });
                modal.classList.add('hidden');
                if (window.showChatToast) window.showChatToast('已发送');
                else alert('已发送');
            } else {
                alert('请选择至少一个联系人');
            }
        };
    }
    
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.onclick = () => modal.classList.add('hidden');
    }

    list.innerHTML = '';
    
    if (window.iphoneSimState.contacts) {
        window.iphoneSimState.contacts.forEach(c => {
            const item = document.createElement('div');
            item.className = 'list-item';
            
            item.innerHTML = `
                <div class="list-content" style="display: flex; align-items: center; justify-content: flex-start;">
                    <img src="${c.avatar}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; object-fit: cover; flex-shrink: 0;">
                    <span style="font-size: 16px;">${c.remark || c.name}</span>
                </div>
                <input type="checkbox" name="share-contact" value="${c.id}" style="width: 20px; height: 20px;">
            `;
            item.onclick = (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input');
                    if (checkbox) checkbox.checked = !checkbox.checked;
                }
            };
            list.appendChild(item);
        });
    }
    
    modal.classList.remove('hidden');
}

// 更新订单状态
function updateShoppingOrderStatuses() {
    if (!window.iphoneSimState.shoppingOrders) return;

    let hasChanges = false;
    const now = Date.now();
    const hour = 3600000;

    window.iphoneSimState.shoppingOrders.forEach(order => {
        // Check if it's a delivery order (contains delivery items)
        const isDeliveryOrder = order.items && order.items.some(i => i.isDelivery);

        // Initialize delays if missing (for existing orders)
        if (!order.shipDelay) {
             if (isDeliveryOrder) {
                 // 外卖：5-10分钟 接单/备餐完成 (变为已发货/配送中)
                 order.shipDelay = Math.floor(5 * 60000 + Math.random() * (5 * 60000));
             } else {
                 // 普通商品：随机 2-24 小时发货
                 order.shipDelay = Math.floor(2 * hour + Math.random() * (22 * hour)); 
             }
             hasChanges = true; 
        }
        if (!order.deliverDelay) {
            if (isDeliveryOrder) {
                // 外卖：30-40分钟送达 (变为已完成)
                order.deliverDelay = Math.floor(30 * 60000 + Math.random() * (10 * 60000));
            } else {
                // 普通商品：随机 48-72 小时送达 (2-3天)
                order.deliverDelay = Math.floor(48 * hour + Math.random() * (24 * hour));
            }
            hasChanges = true;
        }

        const elapsed = now - order.time;
        
        if (order.status === '待发货' && elapsed > order.shipDelay) {
            order.status = '已发货';
            hasChanges = true;
        }
        
        if (order.status === '已发货' && elapsed > order.deliverDelay) {
            order.status = '已完成';
            hasChanges = true;
        }
    });

    if (hasChanges) {
        saveConfig();
        // 如果当前正在查看订单页，则刷新
        const currentTab = document.querySelector('#shopping-app .wechat-tab-item.active');
        if (currentTab && currentTab.dataset.tab === 'orders') {
            renderShoppingOrders();
        }
    }
}

// 渲染订单页面
function renderShoppingOrders() {
    const container = document.getElementById('shopping-tab-orders');
    if (!container) return;

    const orders = window.iphoneSimState.shoppingOrders || [];
    
    // Sort by time desc
    orders.sort((a, b) => b.time - a.time);

    if (orders.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #999; margin-top: 50px;">
                <i class="fas fa-clipboard-list" style="font-size: 48px; margin-bottom: 15px; color: #ccc;"></i>
                <p>暂无订单</p>
            </div>
        `;
        return;
    }

    let html = '<div style="padding: 10px;">';
    
    orders.forEach(order => {
        const date = new Date(order.time);
        const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        let statusColor = '#FF5000';
        let statusText = order.status;
        let logisticsInfo = '';

        const isDeliveryOrder = order.items && order.items.some(i => i.isDelivery);

        if (statusText === '待发货') {
            statusColor = '#FF5000';
            logisticsInfo = isDeliveryOrder ? '商家已接单，正在制作...' : '商家正在打包中...';
        } else if (statusText === '已发货') {
            statusColor = '#007AFF';
            logisticsInfo = isDeliveryOrder ? '骑手正在火速配送中' : '包裹正在运输途中';
        } else if (statusText === '已完成') {
            statusColor = '#333';
            logisticsInfo = isDeliveryOrder ? '订单已送达' : '订单已签收';
        }

        html += `
            <div class="order-card" style="background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #666; margin-bottom: 10px; border-bottom: 1px solid #f5f5f5; padding-bottom: 8px;">
                    <span>${dateStr}</span>
                    <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
                </div>
                <div class="order-items">
        `;

        order.items.forEach(item => {
            html += `
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <img src="${item.image}" style="width: 60px; height: 60px; border-radius: 6px; object-fit: cover; background: #f0f0f0;">
                    <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
                        <div style="font-size: 13px; color: #333; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.title}</div>
                        <div style="font-size: 12px; color: #999;">x1</div>
                    </div>
                    <div style="font-size: 14px; font-weight: bold; color: #333;">¥${item.price}</div>
                </div>
            `;
        });

        html += `
                </div>
                <div style="border-top: 1px solid #f5f5f5; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 12px; color: #666;">${logisticsInfo}</div>
                    <div style="font-size: 14px;">实付款: <span style="font-weight: bold;">¥${order.total}</span></div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// 处理代付请求支付
window.handlePayForRequest = function(requestId, payerName, requestData) {
    if (!requestId || !requestData) return false;

    if (!window.iphoneSimState.shoppingOrders) {
        window.iphoneSimState.shoppingOrders = [];
    }

    // 检查是否已经存在 (防止重复支付)
    if (window.iphoneSimState.shoppingOrders.some(o => o.requestId === requestId)) {
        return false;
    }

    const newOrder = {
        id: Date.now().toString(),
        requestId: requestId,
        payer: payerName,
        items: requestData.items || [],
        total: requestData.total || '0.00',
        time: Date.now(),
        status: '待发货' // 默认状态
    };

    window.iphoneSimState.shoppingOrders.unshift(newOrder);
    saveConfig();
    
    // 如果当前在订单页面，刷新
    const currentTab = document.querySelector('#shopping-app .wechat-tab-item.active');
    if (currentTab && currentTab.dataset.tab === 'orders') {
        renderShoppingOrders();
    }
    
    return true;
};

// 生成外卖数据
async function generateDeliveryItems() {
    const settings = window.iphoneSimState.aiSettings.url ? window.iphoneSimState.aiSettings : window.iphoneSimState.aiSettings2;
    if (!settings.url || !settings.key) {
        alert('请先在设置中配置 AI API');
        return;
    }

    const container = document.getElementById('shopping-tab-delivery');
    ensureDeliveryContainer();
    const listContainer = container.querySelector('.delivery-container');

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'delivery-loading';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '20px';
    loadingDiv.style.color = '#999';
    loadingDiv.textContent = '正在搜索附近美食...';
    
    const oldLoading = document.getElementById('delivery-loading');
    if (oldLoading) oldLoading.remove();
    
    if (listContainer) {
        container.insertBefore(loadingDiv, listContainer);
    } else {
        container.appendChild(loadingDiv);
    }

    let userContext = '';
    // 复用关联联系人逻辑
    let linkedIds = window.iphoneSimState.shoppingLinkedContactIds || [];
    if (window.iphoneSimState.shoppingLinkedContactId && !linkedIds.includes(window.iphoneSimState.shoppingLinkedContactId)) {
        linkedIds.push(window.iphoneSimState.shoppingLinkedContactId);
    }

    if (linkedIds.length > 0) {
        userContext += `\n【用餐偏好参考】\n请根据以下用户的口味偏好（如果有提及）推荐外卖：\n`;
        linkedIds.forEach((id) => {
            const contact = window.iphoneSimState.contacts.find(c => c.id === id);
            if (contact) {
                userContext += `- ${contact.remark || contact.name}: ${contact.persona || ''}\n`;
            }
        });
    }

    const systemPrompt = `你是一个外卖APP推荐助手。请生成 6-8 个虚构的外卖商品信息。
请直接返回 JSON 数组格式，不要包含任何 Markdown 标记。
每个商品包含以下字段：
- title: 菜品名称
- price: 价格 (数字)
- shop_name: 商家名称
- paid_count: 月售数量 (例如 "月售1000+")
- delivery_time: 配送时间 (例如 "30分钟")
- delivery_fee: 配送费 (例如 "¥0", "¥2")
- rating: 评分 (例如 "4.8分")
- image_desc: 菜品图片的简短描述 (不超过5个字)
- detail_desc: 菜品详细描述

${userContext ? userContext : '菜品种类要丰富，包括：正餐、快餐、奶茶、甜点等。'}

示例：
[
  {"title": "香辣鸡腿堡套餐", "price": 25.9, "shop_name": "快乐汉堡店", "paid_count": "月售2000+", "delivery_time": "25分钟", "delivery_fee": "¥0", "rating": "4.9分", "image_desc": "汉堡套餐", "detail_desc": "香辣鸡腿堡+中薯+可乐，快乐加倍！"},
  {"title": "招牌杨枝甘露", "price": 18, "shop_name": "七分甜", "paid_count": "月售500+", "delivery_time": "35分钟", "delivery_fee": "¥3", "rating": "4.7分", "image_desc": "杨枝甘露", "detail_desc": "精选芒果，口感浓郁，清凉解暑。"}
]`;

    try {
        let fetchUrl = settings.url;
        if (!fetchUrl.endsWith('/chat/completions')) {
            fetchUrl = fetchUrl.endsWith('/') ? fetchUrl + 'chat/completions' : fetchUrl + '/chat/completions';
        }
        const cleanKey = settings.key ? settings.key.replace(/[^\x00-\x7F]/g, "").trim() : '';
        
        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanKey}`
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: '生成外卖推荐' }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        let content = data.choices[0].message.content;
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let products = [];
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) products = parsed;
            else if (parsed.products) products = parsed.products;
            else {
                 for (let key in parsed) {
                    if (Array.isArray(parsed[key])) {
                        products = parsed[key];
                        break;
                    }
                }
            }
        } catch (e) {
            console.error('JSON Parse Error:', e);
        }

        if (products.length > 0) {
            products.forEach((p, index) => {
                p.id = 'del_' + Date.now() + '_' + index;
                p.isDelivery = true; // 标记为外卖
            });

            if (!window.iphoneSimState.deliveryItems) {
                window.iphoneSimState.deliveryItems = [];
            }
            // 外卖通常是刷新式的，这里我们可以选择追加或者覆盖。考虑到推荐流，追加比较好，但为了演示方便，这里覆盖或追加？
            // 模仿 generateShoppingProducts 是追加。
            window.iphoneSimState.deliveryItems.unshift(...products);
            saveConfig();

            renderDeliveryItems();

            // 异步生成图片
            (async () => {
                for (const p of products) {
                    if (p.image_desc) {
                        const url = await generateAiImage(p.image_desc);
                        if (url) {
                            p.aiImage = url;
                            saveConfig();
                            const imgEl = document.getElementById(`delivery-img-${p.id}`);
                            if (imgEl) imgEl.src = url;
                        }
                    }
                }
            })();
        } else {
            alert('未生成有效数据');
        }

    } catch (error) {
        console.error('生成外卖失败:', error);
        alert(`生成失败: ${error.message}`);
    } finally {
        const loading = document.getElementById('delivery-loading');
        if (loading) loading.remove();
    }
}

function renderDeliveryItems() {
    const container = document.getElementById('shopping-tab-delivery');
    if (!container) return;
    ensureDeliveryContainer();
    const listContainer = container.querySelector('.delivery-container');
    
    // 如果没有数据
    if (!window.iphoneSimState.deliveryItems || window.iphoneSimState.deliveryItems.length === 0) {
        listContainer.innerHTML = ''; // Keep empty or show placeholder logic in ensure
        return;
    }

    listContainer.innerHTML = '';
    
    window.iphoneSimState.deliveryItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'delivery-card';
        card.style.background = '#fff';
        card.style.borderRadius = '8px';
        card.style.padding = '10px';
        card.style.display = 'flex';
        card.style.gap = '10px';
        card.style.marginBottom = '10px';
        card.style.cursor = 'pointer';
        
        // 点击直接购买/送礼
        card.onclick = () => openPaymentChoice(item.price, [item]);

        const imgUrl = item.aiImage || generatePlaceholderImage(100, 100, item.image_desc || '美食', '#ff9500');

        card.innerHTML = `
            <img id="delivery-img-${item.id}" src="${imgUrl}" style="width: 100px; height: 100px; border-radius: 6px; object-fit: cover; flex-shrink: 0;">
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 4px;">${item.title}</div>
                    <div style="font-size: 12px; color: #666; display: flex; align-items: center; gap: 5px;">
                        <span style="color: #FF9500; font-weight: bold;">${item.rating || '4.8分'}</span>
                        <span>${item.paid_count || '月售100+'}</span>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="display: flex; flex-direction: column;">
                         <div style="font-size: 12px; color: #999;">
                             <span>${item.delivery_time || '30分钟'}</span> 
                             <span style="margin: 0 4px;">|</span>
                             <span>${item.delivery_fee || '免配送费'}</span>
                         </div>
                         <div style="font-size: 12px; color: #666; margin-top: 2px;">${item.shop_name}</div>
                    </div>
                    <div style="color: #FF5000; font-size: 18px; font-weight: bold;">¥${item.price}</div>
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// 注册初始化函数
if (window.appInitFunctions) {
    window.appInitFunctions.push(setupShoppingListeners);
}
