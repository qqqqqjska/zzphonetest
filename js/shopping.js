// 购物应用功能模块

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

// 初始化监听器
function setupShoppingListeners() {
    const closeBtn = document.getElementById('close-shopping-app');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('shopping-app').classList.add('hidden');
        });
    }

    const generateBtn = document.getElementById('shopping-generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            // TODO: Implement generation logic
            alert('生成功能开发中...');
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

// 注册初始化函数
if (window.appInitFunctions) {
    window.appInitFunctions.push(setupShoppingListeners);
}
