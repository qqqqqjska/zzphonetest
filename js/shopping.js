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
    `;
    document.head.appendChild(style);
}

// 初始化监听器
function setupShoppingListeners() {
    injectShoppingStyles();

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
    if (header) header.textContent = '选择关联联系人 (可多选)';
    
    if (sendBtn) {
        sendBtn.textContent = '确定';
        // 移除旧的监听器 (cloneNode trick)
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
        
        newSendBtn.onclick = () => {
            const selected = list.querySelectorAll('input[type="checkbox"]:checked');
            const ids = Array.from(selected).map(cb => parseInt(cb.value)).filter(id => id !== 0);
            
            window.iphoneSimState.shoppingLinkedContactIds = ids;
            // 清除旧的单选数据以避免混淆
            delete window.iphoneSimState.shoppingLinkedContactId;
            
            saveConfig(); // Assume saveConfig is global
            updateLinkButtonState();
            modal.classList.add('hidden');
            
            if (ids.length > 0) {
                alert(`已关联 ${ids.length} 位联系人`);
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
    updateLinkButtonState();
};

// 生成商品数据
async function generateShoppingProducts() {
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
        
        // 使用 placehold.co 生成图片，根据描述生成颜色
        const bgColor = Math.floor(Math.random()*16777215).toString(16);
        // 图片高度随机 (150 - 250)，模拟瀑布流效果
        const height = Math.floor(Math.random() * (250 - 150 + 1)) + 150;
        
        // 确保bgColor是有效的hex值（补足6位）
        let validBgColor = bgColor;
        if (validBgColor.length < 6) {
            validBgColor = '000000'.substring(0, 6 - validBgColor.length) + validBgColor;
        }
        validBgColor = '#' + validBgColor;

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
    if (paidEl) paidEl.textContent = product.paid_count + '人付款';
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

// 注册初始化函数
if (window.appInitFunctions) {
    window.appInitFunctions.push(setupShoppingListeners);
}
