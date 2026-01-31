// iCity 应用功能模块

// iCity Logic Initialization
function setupIcityListeners() {
    const closeIcityBtn = document.getElementById('close-icity-app');
    if (closeIcityBtn) closeIcityBtn.addEventListener('click', () => document.getElementById('icity-app').classList.add('hidden'));

    // iCity Profile Listeners
    const icityBgInput = document.getElementById('icity-bg-input');
    const icityAvatarInput = document.getElementById('icity-avatar-input');
    const icityBgTrigger = document.getElementById('icity-bg-trigger');
    const icityAvatarTrigger = document.getElementById('icity-avatar-trigger');

    // Calendar Listeners
    const openCalendarBtn = document.getElementById('open-icity-calendar');
    const closeCalendarBtn = document.getElementById('close-icity-calendar');
    
    if (openCalendarBtn) {
        openCalendarBtn.addEventListener('click', () => {
            renderIcityCalendar(2026); // Default to 2026
            document.getElementById('icity-calendar-screen').classList.remove('hidden');
        });
    }
    
    if (closeCalendarBtn) {
        closeCalendarBtn.addEventListener('click', () => {
            document.getElementById('icity-calendar-screen').classList.add('hidden');
        });
    }

    if (icityBgTrigger) icityBgTrigger.addEventListener('click', () => icityBgInput.click());
    if (icityAvatarTrigger) icityAvatarTrigger.addEventListener('click', () => icityAvatarInput.click());
    
    if (icityBgInput) icityBgInput.addEventListener('change', (e) => handleIcityImageUpload(e, 'bgImage'));
    if (icityAvatarInput) icityAvatarInput.addEventListener('change', (e) => handleIcityImageUpload(e, 'avatar'));

    // iCity Compose Logic
    const icityComposeModal = document.getElementById('icity-compose-modal');
    const closeIcityComposeBtn = document.getElementById('close-icity-compose');
    const icityVisibilityBtn = document.getElementById('icity-visibility-btn');
    const icityVisibilityMenu = document.getElementById('icity-visibility-menu');
    const icityVisItems = document.querySelectorAll('.icity-vis-item');

    if (closeIcityComposeBtn) {
        closeIcityComposeBtn.addEventListener('click', () => {
            icityComposeModal.classList.add('hidden');
        });
    }

    if (icityVisibilityBtn) {
        icityVisibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            icityVisibilityMenu.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', (e) => {
        if (icityVisibilityMenu && !icityVisibilityMenu.classList.contains('hidden') && !icityVisibilityBtn.contains(e.target) && !icityVisibilityMenu.contains(e.target)) {
            icityVisibilityMenu.classList.add('hidden');
        }
    });

    icityVisItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = item.dataset.val;
            const iconClass = item.querySelector('i').className;
            const text = item.textContent.trim();
            
            // Update button text and icon
            icityVisibilityBtn.innerHTML = `<i class="${iconClass}"></i> <span>${text}</span>`;
            
            // Update active state style
            icityVisItems.forEach(i => {
                i.classList.remove('active');
                i.style.backgroundColor = 'transparent';
                i.style.color = '#666';
            });
            item.classList.add('active');
            item.style.backgroundColor = '#007AFF';
            item.style.color = '#fff';
            
            icityVisibilityMenu.classList.add('hidden');
        });
    });

    const icityTabBar = document.querySelector('.icity-tab-bar');
    if (icityTabBar) {
        const btns = Array.from(icityTabBar.children);
        // Middle button (Pen) is index 2
        if (btns[2]) {
            btns[2].style.cursor = 'pointer';
            btns[2].addEventListener('click', () => {
                if (icityComposeModal) icityComposeModal.classList.remove('hidden');
            });
        }
    }

    const icitySendBtn = document.getElementById('icity-send-btn');
    if (icitySendBtn) {
        icitySendBtn.addEventListener('click', handleIcitySend);
    }

    const icityMessageSendBtn = document.getElementById('icity-message-send-btn');
    if (icityMessageSendBtn) {
        icityMessageSendBtn.addEventListener('click', () => handleIcityMessageSend(true));
    }

    const icityMessageInput = document.getElementById('icity-message-input');
    if (icityMessageInput) {
        icityMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleIcityMessageSend(false);
            }
        });
    }

    // Badge Listeners
    const badgesBtn = document.getElementById('icity-badges-btn');
    const closeBadgesBtn = document.getElementById('close-icity-badges');
    if (badgesBtn) {
        badgesBtn.addEventListener('click', openIcityBadges);
    }
    if (closeBadgesBtn) {
        closeBadgesBtn.addEventListener('click', () => {
            document.getElementById('icity-badges-screen').classList.add('hidden');
        });
    }

    // Title Listeners
    const titlesBtn = document.getElementById('icity-titles-btn');
    const closeTitlesBtn = document.getElementById('close-icity-titles');
    if (titlesBtn) {
        titlesBtn.addEventListener('click', openIcityTitles);
    }
    if (closeTitlesBtn) {
        closeTitlesBtn.addEventListener('click', () => {
            document.getElementById('icity-titles-screen').classList.add('hidden');
        });
    }

    // All Diaries Screen Listeners
    const closeAllDiariesBtn = document.getElementById('close-icity-all-diaries');
    if (closeAllDiariesBtn) {
        closeAllDiariesBtn.addEventListener('click', () => {
            document.getElementById('icity-all-diaries-screen').classList.add('hidden');
        });
    }

    // Detail Screen Listeners
    const closeDetailBtn = document.getElementById('close-icity-detail');
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => {
            document.getElementById('icity-detail-screen').classList.add('hidden');
        });
    }

    // Settings Modal Listeners
    const settingsBtn = document.getElementById('icity-settings-btn');
    const closeSettingsBtn = document.getElementById('close-icity-settings-modal');
    const saveSettingsBtn = document.getElementById('save-icity-settings-btn');

    if (settingsBtn) settingsBtn.addEventListener('click', openIcitySettings);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => document.getElementById('icity-settings-modal').classList.add('hidden'));
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveIcitySettings);

    // Edit Profile Screen Listeners
    const editProfileBtn = document.getElementById('icity-edit-profile-btn');
    const editProfileScreen = document.getElementById('icity-edit-profile-screen');
    const closeEditProfileBtn = document.getElementById('close-icity-edit-profile');
    const saveProfileBtn = document.getElementById('save-icity-profile-btn');

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openIcityEditProfile);
    }

    if (closeEditProfileBtn) {
        closeEditProfileBtn.addEventListener('click', () => {
            editProfileScreen.classList.add('hidden');
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', handleSaveIcityProfile);
    }

    const diaryTabs = document.querySelectorAll('.icity-diary-tab');
    diaryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            diaryTabs.forEach(t => {
                t.classList.remove('active');
                t.style.fontWeight = 'normal';
                t.style.color = '#999';
                t.style.background = 'transparent';
                t.style.borderRadius = '15px'; // Ensure rounded corners when inactive (if needed) or reset
            });
            tab.classList.add('active');
            tab.style.fontWeight = 'bold';
            tab.style.color = '#fff';
            tab.style.background = '#7C9BF8';
            tab.style.borderRadius = '15px'; // Ensure rounded corners
            
            renderIcityAllDiaries();
        });
    });
    
    // World Tab Listeners
    const navWorld = document.getElementById('icity-nav-world');
    const navMessages = document.getElementById('icity-nav-messages');
    const tabMe = document.getElementById('icity-tab-me');
    const generateWorldBtn = document.getElementById('icity-world-generate-btn');
    const headerWorld = document.getElementById('icity-header-world');
    const headerFriends = document.getElementById('icity-header-friends');

    const switchIcityTab = (tabName) => {
        // Hide all tabs
        ['profile', 'world', 'messages'].forEach(t => {
            const el = document.getElementById(`icity-tab-content-${t}`);
            if (el) el.style.display = 'none';
        });

        // Reset icons
        if (navWorld) navWorld.style.color = '#ccc';
        if (navMessages) navMessages.style.color = '#ccc';
        if (tabMe) tabMe.style.border = '2px solid transparent';

        // Show selected
        const selectedEl = document.getElementById(`icity-tab-content-${tabName}`);
        if (selectedEl) {
            selectedEl.style.display = 'flex';
            if (tabName !== 'profile') selectedEl.style.flexDirection = 'column';
            else selectedEl.style.display = 'block';
        }

        // Highlight icon
        if (tabName === 'world' && navWorld) navWorld.style.color = '#000';
        if (tabName === 'messages' && navMessages) navMessages.style.color = '#000';
        if (tabName === 'profile' && tabMe) tabMe.style.border = '2px solid #000';
    };

    if (navWorld) {
        navWorld.addEventListener('click', () => {
            switchIcityTab('world');
            if (headerFriends && headerFriends.dataset.active === 'true') {
                renderIcityFriends();
            } else {
                renderIcityWorld();
            }
        });
    }

    if (navMessages) {
        navMessages.addEventListener('click', () => {
            switchIcityTab('messages');
            renderIcityMessages();
        });
    }

    if (tabMe) {
        tabMe.addEventListener('click', () => {
            switchIcityTab('profile');
        });
    }

    if (generateWorldBtn) {
        generateWorldBtn.addEventListener('click', () => {
            if (headerFriends && headerFriends.dataset.active === 'true') {
                handleGenerateIcityFriends();
            } else {
                handleGenerateIcityWorld();
            }
        });
    }

    if (headerWorld) {
        headerWorld.addEventListener('click', () => {
            headerWorld.dataset.active = 'true';
            headerFriends.dataset.active = 'false';
            headerWorld.style.color = '#000';
            headerWorld.style.borderBottom = '2px solid #000';
            headerFriends.style.color = '#999';
            headerFriends.style.borderBottom = 'none';
            renderIcityWorld();
        });
    }

    if (headerFriends) {
        headerFriends.addEventListener('click', () => {
            headerFriends.dataset.active = 'true';
            headerWorld.dataset.active = 'false';
            headerFriends.style.color = '#000';
            headerFriends.style.borderBottom = '2px solid #000';
            headerWorld.style.color = '#999';
            headerWorld.style.borderBottom = 'none';
            renderIcityFriends();
        });
    }
    
    renderIcityProfile();
    renderIcityDiaryList();
    
    // Ensure World tab layout is correct on init
    const worldTab = document.getElementById('icity-tab-content-world');
    if (worldTab && getComputedStyle(worldTab).display !== 'none') {
        worldTab.style.display = 'flex';
        worldTab.style.flexDirection = 'column';
    }
}

function renderIcityProfile() {
    const bgTrigger = document.getElementById('icity-bg-trigger');
    const avatarTrigger = document.getElementById('icity-avatar-trigger');
    const tabMeAvatar = document.getElementById('icity-tab-me');
    const composeAvatar = document.getElementById('icity-compose-avatar');
    
    if (!window.iphoneSimState.icityProfile) {
        window.iphoneSimState.icityProfile = { avatar: '', bgImage: '' };
    }

    if (window.iphoneSimState.icityProfile.followers === undefined) window.iphoneSimState.icityProfile.followers = 0;
    if (window.iphoneSimState.icityProfile.totalLikes === undefined) window.iphoneSimState.icityProfile.totalLikes = 0;
    
    const { avatar, bgImage, nickname, id } = window.iphoneSimState.icityProfile;
    
    // Update Header Background
    if (bgTrigger) {
        if (bgImage) {
            bgTrigger.style.backgroundImage = `url('${bgImage}')`;
        } else {
            bgTrigger.style.backgroundImage = ''; // Default color
        }
    }
    
    // Update Main Avatar
    if (avatarTrigger) {
        if (avatar) {
            avatarTrigger.style.backgroundImage = `url('${avatar}')`;
            avatarTrigger.style.backgroundColor = 'transparent';
        } else {
            avatarTrigger.style.backgroundImage = '';
            avatarTrigger.style.backgroundColor = '#000';
        }
    }

    // Update Name and ID (using selectors based on structure)
    const nameEl = document.querySelector('#icity-app .app-body div[style*="margin-top: 10px; text-align: center;"] div[style*="font-size: 24px"]');
    const idEl = document.querySelector('#icity-app .app-body div[style*="margin-top: 10px; text-align: center;"] div[style*="color: #999; font-size: 14px;"]');
    
    if (nameEl) nameEl.textContent = nickname || 'Kaneki';
    if (idEl) idEl.textContent = id || '@heanova1';

    // Update Friend Count
    const friendsCountEl = document.getElementById('icity-friends-count');
    if (friendsCountEl) {
        let friendCount = 0;
        if (window.iphoneSimState.icityProfile.linkedContactIds && Array.isArray(window.iphoneSimState.icityProfile.linkedContactIds)) {
            friendCount = window.iphoneSimState.icityProfile.linkedContactIds.length;
        } else if (window.iphoneSimState.icityProfile.linkedContactId) {
            friendCount = 1;
        }
        friendsCountEl.textContent = friendCount;
    }

    // Update Followers Count
    const followersEl = document.getElementById('icity-followers-count');
    if (followersEl) followersEl.textContent = window.iphoneSimState.icityProfile.followers;

    // Update Total Likes
    const totalLikesEl = document.getElementById('icity-likes-count');
    if (totalLikesEl) totalLikesEl.textContent = window.iphoneSimState.icityProfile.totalLikes;

    // Update Equipped Title
    const titleBtn = document.getElementById('icity-titles-btn');
    if (titleBtn) {
        const titleId = window.iphoneSimState.icityProfile.equippedTitleId;
        const titles = getIcityTitleDefinitions();
        const title = titles.find(t => t.id === titleId);
        
        if (title) {
            titleBtn.textContent = title.text;
            // Merge styles but ensure layout properties
            titleBtn.style.cssText = title.style;
            titleBtn.style.fontSize = '12px';
            titleBtn.style.padding = '2px 8px';
            titleBtn.style.borderRadius = '10px';
            titleBtn.style.cursor = 'pointer';
            titleBtn.style.display = 'inline-block';
        } else {
            titleBtn.textContent = '+ 我的市民称号';
            titleBtn.style.cssText = 'background: #f0f0f0; color: #666; font-size: 12px; padding: 2px 8px; border-radius: 10px; cursor: pointer; display: inline-block;';
        }
    }

    // Update Equipped Badge
    const equippedBadgeIcon = document.getElementById('icity-equipped-badge-icon');
    const equippedBadgeName = document.getElementById('icity-equipped-badge-name');
    const badgeBtn = document.getElementById('icity-badges-btn');
    
    if (window.iphoneSimState.icityProfile.equippedBadgeId && window.iphoneSimState.icityBadges) {
        const badge = window.iphoneSimState.icityBadges.find(b => b.id === window.iphoneSimState.icityProfile.equippedBadgeId);
        if (badge && badge.obtained) {
            const badgeColor = badge.color || '#FF9500';
            if (equippedBadgeIcon) {
                equippedBadgeIcon.className = badge.icon;
                equippedBadgeIcon.style.marginRight = '4px';
                equippedBadgeIcon.style.color = badgeColor;
            }
            if (equippedBadgeName) {
                equippedBadgeName.textContent = badge.name;
                equippedBadgeName.style.color = badgeColor;
            }
            if (badgeBtn) {
                badgeBtn.style.backgroundColor = '#fff';
                badgeBtn.style.color = badgeColor;
                badgeBtn.style.border = `1px solid ${badgeColor}`;
                badgeBtn.style.boxShadow = `0 2px 5px ${badgeColor}20`; // Hex alpha
            }
        } else {
            // Reset if invalid
            if (equippedBadgeIcon) {
                equippedBadgeIcon.className = '';
                equippedBadgeIcon.style.marginRight = '0';
            }
            if (equippedBadgeName) {
                equippedBadgeName.textContent = '+ 勋章';
                equippedBadgeName.style.color = '#666';
            }
            if (badgeBtn) {
                badgeBtn.style.backgroundColor = '#f0f0f0';
                badgeBtn.style.color = '#666';
                badgeBtn.style.border = 'none';
                badgeBtn.style.boxShadow = 'none';
            }
        }
    } else {
        if (equippedBadgeIcon) {
            equippedBadgeIcon.className = '';
            equippedBadgeIcon.style.marginRight = '0';
        }
        if (equippedBadgeName) {
            equippedBadgeName.textContent = '+ 勋章';
            equippedBadgeName.style.color = '#666';
        }
        if (badgeBtn) {
            badgeBtn.style.backgroundColor = '#f0f0f0';
            badgeBtn.style.color = '#666';
            badgeBtn.style.border = 'none';
            badgeBtn.style.boxShadow = 'none';
        }
    }

    // Update Tab Bar Avatar
    if (tabMeAvatar) {
        if (avatar) {
            tabMeAvatar.style.backgroundImage = `url('${avatar}')`;
            tabMeAvatar.style.backgroundColor = 'transparent';
        } else {
            tabMeAvatar.style.backgroundImage = '';
            tabMeAvatar.style.backgroundColor = '#000';
        }
    }

    // Update Compose Modal Avatar
    if (composeAvatar) {
        if (avatar) {
            composeAvatar.style.backgroundImage = `url('${avatar}')`;
            composeAvatar.style.backgroundColor = 'transparent';
        } else {
            composeAvatar.style.backgroundImage = '';
            composeAvatar.style.backgroundColor = '#000';
        }
    }
}

function handleIcityImageUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    
    const maxWidth = type === 'avatar' ? 300 : 800;
    
    compressImage(file, maxWidth, 0.7).then(base64 => {
        if (!window.iphoneSimState.icityProfile) {
            window.iphoneSimState.icityProfile = { avatar: '', bgImage: '' };
        }
        window.iphoneSimState.icityProfile[type] = base64;
        saveConfig();
        renderIcityProfile();
    }).catch(err => {
        console.error('图片压缩失败', err);
    });
    e.target.value = '';
}

function getIcityTitleDefinitions() {
    if (!window.iphoneSimState.icityCustomTitles) {
        window.iphoneSimState.icityCustomTitles = [];
    }

    const presets = [
        { id: 'citizen', text: '普通市民', style: 'background: #f0f0f0; color: #666; border: 1px solid #ddd;' },
        { id: 'enthusiast', text: '热心市民', style: 'background: #E8F5E9; color: #4CAF50; border: 1px solid #4CAF50;' },
        { id: 'mayor', text: '模拟市长', style: 'background: #E3F2FD; color: #2196F3; border: 1px solid #2196F3;' },
        { id: 'vip', text: 'VIP会员', style: 'background: #FFF8E1; color: #FFC107; border: 1px solid #FFC107;' },
        { id: 'star', text: '明日之星', style: 'background: #F3E5F5; color: #9C27B0; border: 1px solid #9C27B0;' },
        { id: 'night', text: '守夜人', style: 'background: #212121; color: #FFD700; border: 1px solid #FFD700;' },
        { id: 'writer', text: '大文豪', style: 'background: #fff; color: #000; border: 2px solid #000; font-family: "Songti SC", serif;' },
        { id: 'cat', text: '铲屎官 🐱', style: 'background: #FFF3E0; color: #FF9800; border: 1px dashed #FF9800;' },
        { id: 'dog', text: '汪星人 🐶', style: 'background: #EFEBE9; color: #795548; border: 1px dashed #795548;' },
        { id: 'foodie', text: '美食家 🍔', style: 'background: #FFEBEE; color: #E91E63; border: 1px solid #E91E63;' },
        { id: 'traveler', text: '旅行者 ✈️', style: 'background: #E0F7FA; color: #00BCD4; border: 1px solid #00BCD4;' },
        { id: 'coder', text: '程序猿 💻', style: 'background: #263238; color: #00E676; border: 1px solid #00E676; font-family: monospace;' },
        { id: 'rich', text: '多财多亿 💰', style: 'background: linear-gradient(45deg, #FFD700, #FFA000); color: #fff; border: none; box-shadow: 0 2px 5px rgba(255, 160, 0, 0.3);' },
        { id: 'lucky', text: '锦鲤 🍀', style: 'background: #FF5252; color: #fff; border: none;' },
        { id: 'ghost', text: '幽灵 👻', style: 'background: #000; color: #fff; border: 1px solid #333; opacity: 0.7;' },
    ];

    return [...presets, ...window.iphoneSimState.icityCustomTitles];
}

function getBadgeDefinitions() {
    return [
        { id: 'newcomer', name: '初来乍到', desc: '第一次打开 iCity', icon: 'fas fa-door-open', color: '#4CD964', obtained: true }, 
        { id: 'diarist', name: '日记达人', desc: '累计发布 1 篇日记', icon: 'fas fa-pen-fancy', color: '#FF9500', condition: (state) => (state.icityDiaries && state.icityDiaries.length >= 1), obtained: false },
        { id: 'prolific', name: '笔耕不辍', desc: '累计发布 10 篇日记', icon: 'fas fa-book-open', color: '#007AFF', condition: (state) => (state.icityDiaries && state.icityDiaries.length >= 10), obtained: false },
        { id: 'writer', name: '文学家', desc: '累计发布 50 篇日记', icon: 'fas fa-feather-alt', color: '#5856D6', condition: (state) => (state.icityDiaries && state.icityDiaries.length >= 50), obtained: false },
        { id: 'social', name: '社交名流', desc: '获得 100 个喜欢', icon: 'fas fa-heart', color: '#FF2D55', obtained: false },
        { id: 'influencer', name: '网络红人', desc: '获得 1000 个喜欢', icon: 'fas fa-star', color: '#FFCC00', obtained: false },
        { id: 'night_owl', name: '夜猫子', desc: '在凌晨 0-4 点发布日记', icon: 'fas fa-moon', color: '#5AC8FA', obtained: false },
        { id: 'early_bird', name: '早起鸟', desc: '在早晨 5-8 点发布日记', icon: 'fas fa-sun', color: '#FF9500', obtained: false },
        { id: 'weekend_warrior', name: '周末战士', desc: '在周末发布日记', icon: 'fas fa-coffee', color: '#8E8E93', obtained: false },
        { id: 'photographer', name: '摄影师', desc: '发布带图片的日记', icon: 'fas fa-camera', color: '#34C759', obtained: false },
        { id: 'secret_keeper', name: '秘密守护者', desc: '发布第一篇私密日记', icon: 'fas fa-user-secret', color: '#32ADE6', condition: (state) => (state.icityDiaries && state.icityDiaries.some(d => d.visibility === 'private')), obtained: false },
        { id: 'open_book', name: '坦诚相待', desc: '发布第一篇公开日记', icon: 'fas fa-bullhorn', color: '#FF3B30', condition: (state) => (state.icityDiaries && state.icityDiaries.some(d => d.visibility === 'public')), obtained: false },
        { id: 'deep_thinker', name: '深邃思想', desc: '日记字数超过 100 字', icon: 'fas fa-brain', color: '#AF52DE', obtained: false },
        { id: 'minimalist', name: '极简主义', desc: '日记字数不超过 2 字', icon: 'fas fa-minus', color: '#2C2C2C', obtained: false },
        { id: 'party_animal', name: '派对动物', desc: '周五或周六晚间发布日记', icon: 'fas fa-glass-cheers', color: '#FF2D55', obtained: false },
        { id: 'monday_warrior', name: '周一战士', desc: '周一早晨 6-9 点发布日记', icon: 'fas fa-fist-raised', color: '#FF3B30', obtained: false },
        { id: 'emoji_lover', name: '表情控', desc: '日记包含 emoji 表情', icon: 'far fa-laugh-beam', color: '#FFCC00', obtained: false },
        { id: 'questioner', name: '好奇宝宝', desc: '日记包含问号', icon: 'fas fa-question', color: '#007AFF', obtained: false },
        { id: 'positive_vibes', name: '正能量', desc: '日记包含“开心”、“快乐”或“爱”', icon: 'fas fa-smile-beam', color: '#FF9500', obtained: false },
        { id: 'storyteller', name: '故事大王', desc: '一天内发布 3 篇日记', icon: 'fas fa-scroll', color: '#A2845E', obtained: false },
        { id: 'copycat', name: '复读机', desc: '发布与上一条内容相同的日记', icon: 'fas fa-copy', color: '#8E8E93', obtained: false }
    ];
}

function initIcityBadges() {
    const badgeDefinitions = getBadgeDefinitions();

    if (!window.iphoneSimState.icityBadges) {
        window.iphoneSimState.icityBadges = [];
    }

    const savedStatus = {};
    if (window.iphoneSimState.icityBadges && Array.isArray(window.iphoneSimState.icityBadges)) {
        window.iphoneSimState.icityBadges.forEach(b => {
            savedStatus[b.id] = b.obtained;
        });
    }

    window.iphoneSimState.icityBadges = badgeDefinitions.map(def => {
        // Explicitly check for true to avoid undefined issues
        const isObtained = (savedStatus[def.id] === true) || def.obtained;
        // IMPORTANT: Do NOT include 'condition' function in the state object, 
        // as functions cannot be serialized by IndexedDB/localStorage.
        return {
            id: def.id,
            name: def.name,
            desc: def.desc,
            icon: def.icon,
            color: def.color,
            obtained: isObtained
        };
    });
}

function checkIcityAchievements() {
    if (!window.iphoneSimState.icityBadges) initIcityBadges();
    
    let changed = false;
    const state = window.iphoneSimState;
    const badgeDefinitions = getBadgeDefinitions();
    
    badgeDefinitions.forEach(def => {
        const badgeInState = state.icityBadges.find(b => b.id === def.id);
        
        if (badgeInState && !badgeInState.obtained && def.condition) {
            if (def.condition(state)) {
                badgeInState.obtained = true;
                changed = true;
                // Ideally show a toast notification here
                alert(`解锁新徽章：${badgeInState.name}`);
            }
        }
    });
    
    if (changed) saveConfig();
}

function openIcityBadges() {
    initIcityBadges();
    renderIcityBadges();
    document.getElementById('icity-badges-screen').classList.remove('hidden');
}

function renderIcityBadges() {
    const list = document.getElementById('icity-badges-list');
    const countEl = document.getElementById('icity-badges-count');
    const totalEl = document.getElementById('icity-badges-total');
    
    if (!list) return;
    
    list.innerHTML = '';
    const badges = window.iphoneSimState.icityBadges || [];
    
    if (countEl) countEl.textContent = badges.filter(b => b.obtained).length;
    if (totalEl) totalEl.textContent = badges.length;
    
    badges.forEach(badge => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.alignItems = 'center';
        item.style.gap = '10px';
        item.style.opacity = badge.obtained ? '1' : '0.5';
        
        const iconColor = badge.obtained ? (badge.color || '#FF9500') : '#ccc';
        const borderColor = badge.obtained ? (badge.color || '#FF9500') : '#eee';
        
        const isEquipped = window.iphoneSimState.icityProfile && window.iphoneSimState.icityProfile.equippedBadgeId === badge.id;
        const borderStyle = isEquipped ? `2px solid ${badge.color || '#007AFF'}` : `2px solid ${borderColor}`;
        
        // Add glow if equipped
        const boxShadow = isEquipped ? `0 0 10px ${badge.color || '#007AFF'}` : 'none';
        
        item.innerHTML = `
            <div onclick="window.toggleEquipBadge('${badge.id}')" style="width: 60px; height: 60px; background: #f9f9f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: ${iconColor}; border: ${borderStyle}; box-shadow: ${boxShadow}; cursor: ${badge.obtained ? 'pointer' : 'default'}; position: relative; transition: all 0.3s ease;">
                <i class="${badge.icon}"></i>
                ${isEquipped ? `<div style="position: absolute; bottom: -5px; right: -5px; background: ${badge.color || '#007AFF'}; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;"><i class="fas fa-check"></i></div>` : ''}
            </div>
            <div>
                <div style="font-weight: bold; font-size: 14px; color: ${badge.obtained ? '#333' : '#999'}">${badge.name}</div>
                <div style="font-size: 10px; color: #999;">${badge.desc}</div>
            </div>
        `;
        
        list.appendChild(item);
    });
}

function toggleEquipBadge(badgeId) {
    if (!window.iphoneSimState.icityProfile) return;
    
    const badge = window.iphoneSimState.icityBadges.find(b => b.id === badgeId);
    if (!badge || !badge.obtained) return;
    
    if (window.iphoneSimState.icityProfile.equippedBadgeId === badgeId) {
        // Unequip
        window.iphoneSimState.icityProfile.equippedBadgeId = null;
    } else {
        // Equip
        window.iphoneSimState.icityProfile.equippedBadgeId = badgeId;
    }
    
    saveConfig();
    renderIcityBadges();
    renderIcityProfile();
}

function openIcityTitles() {
    renderIcityTitles();
    document.getElementById('icity-titles-screen').classList.remove('hidden');
}

function renderIcityTitles() {
    const list = document.getElementById('icity-titles-list');
    if (!list) return;
    
    list.innerHTML = '';
    const titles = getIcityTitleDefinitions();
    
    titles.forEach(title => {
        const item = document.createElement('div');
        const isEquipped = window.iphoneSimState.icityProfile && window.iphoneSimState.icityProfile.equippedTitleId === title.id;
        const isCustom = title.id.startsWith('custom_');
        
        // Base style
        let style = title.style + ' padding: 8px 15px; border-radius: 20px; font-size: 14px; cursor: pointer; transition: all 0.2s ease; user-select: none; position: relative; display: flex; align-items: center; gap: 5px;';
        
        // Highlight if equipped
        if (isEquipped) {
            style += ' transform: scale(1.1); box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 1;';
        } else {
            style += ' opacity: 0.8;';
        }
        
        item.style.cssText = style;
        
        const textSpan = document.createElement('span');
        textSpan.textContent = title.text;
        item.appendChild(textSpan);
        
        if (isEquipped) {
            const checkIcon = document.createElement('i');
            checkIcon.className = 'fas fa-check';
            checkIcon.style.fontSize = '12px';
            item.appendChild(checkIcon);
        }

        if (isCustom) {
            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-times';
            deleteIcon.style.fontSize = '10px';
            deleteIcon.style.marginLeft = '5px';
            deleteIcon.style.opacity = '0.5';
            deleteIcon.onclick = (e) => {
                e.stopPropagation();
                deleteIcityTitle(title.id);
            };
            item.appendChild(deleteIcon);
        }
        
        item.onclick = () => equipIcityTitle(title.id);
        
        list.appendChild(item);
    });

    // Add Create Button
    const addBtn = document.createElement('div');
    addBtn.style.cssText = 'background: #fff; color: #007AFF; border: 1px dashed #007AFF; padding: 8px 15px; border-radius: 20px; font-size: 14px; cursor: pointer; opacity: 0.8; display: flex; align-items: center; gap: 5px;';
    addBtn.innerHTML = '<i class="fas fa-plus"></i> <span>自定义</span>';
    addBtn.onclick = handleCreateCustomTitle;
    list.appendChild(addBtn);
}

function handleCreateCustomTitle() {
    const text = prompt('请输入称号名称 (最多6个字):');
    if (!text) return;
    if (text.length > 6) {
        alert('称号太长啦，请控制在6个字以内');
        return;
    }

    const colorInput = prompt('请输入背景颜色 (例如: red, #FF0000, gold) - 留空则随机:', '');
    
    let style = '';
    if (colorInput) {
        // Simple heuristic for text color based on background logic is complex, 
        // so we'll default to white text for dark/saturated colors, or black for light.
        // For simplicity, we'll let user specify just bg, and we use a generic style.
        // Or we can try to be smart.
        // Let's just set the background and add a border.
        style = `background: ${colorInput}; color: #fff; border: none; text-shadow: 0 1px 2px rgba(0,0,0,0.3);`;
    } else {
        // Random preset style
        const colors = [
            '#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3', '#FFECB3', '#FFE0B2', '#FFCCBC', '#D7CCC8', '#F5F5F5', '#CFD8DC'
        ];
        const randomBg = colors[Math.floor(Math.random() * colors.length)];
        style = `background: ${randomBg}; color: #333; border: 1px solid rgba(0,0,0,0.1);`;
    }

    const newTitle = {
        id: 'custom_' + Date.now(),
        text: text,
        style: style
    };

    if (!window.iphoneSimState.icityCustomTitles) {
        window.iphoneSimState.icityCustomTitles = [];
    }
    window.iphoneSimState.icityCustomTitles.push(newTitle);
    
    // Auto equip
    window.iphoneSimState.icityProfile.equippedTitleId = newTitle.id;
    
    saveConfig();
    renderIcityTitles();
    renderIcityProfile();
}

function deleteIcityTitle(id) {
    if (!confirm('确定删除这个称号吗？')) return;
    
    if (window.iphoneSimState.icityProfile.equippedTitleId === id) {
        window.iphoneSimState.icityProfile.equippedTitleId = null;
    }
    
    window.iphoneSimState.icityCustomTitles = window.iphoneSimState.icityCustomTitles.filter(t => t.id !== id);
    saveConfig();
    renderIcityTitles();
    renderIcityProfile();
}

function equipIcityTitle(id) {
    if (!window.iphoneSimState.icityProfile) {
        window.iphoneSimState.icityProfile = {};
    }
    
    // Toggle logic: if clicking already equipped, unequip it
    if (window.iphoneSimState.icityProfile.equippedTitleId === id) {
        window.iphoneSimState.icityProfile.equippedTitleId = null;
    } else {
        window.iphoneSimState.icityProfile.equippedTitleId = id;
    }
    
    saveConfig();
    renderIcityTitles();
    renderIcityProfile();
}

function openIcitySettings() {
    const contactsContainer = document.getElementById('icity-link-contacts-container');
    const wbSelect = document.getElementById('icity-link-wb');
    const customizationContainer = document.getElementById('icity-contact-customization-container');
    
    if (contactsContainer) {
        contactsContainer.innerHTML = '';
        if (window.iphoneSimState.contacts) {
            if (!window.iphoneSimState.icityProfile.linkedContactIds) {
                window.iphoneSimState.icityProfile.linkedContactIds = [];
                if (window.iphoneSimState.icityProfile.linkedContactId) {
                    window.iphoneSimState.icityProfile.linkedContactIds.push(window.iphoneSimState.icityProfile.linkedContactId);
                }
            }

            window.iphoneSimState.contacts.forEach(c => {
                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.alignItems = 'center';
                div.style.marginBottom = '5px';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = c.id;
                checkbox.id = `icity-contact-${c.id}`;
                checkbox.checked = window.iphoneSimState.icityProfile.linkedContactIds.includes(c.id);
                checkbox.style.marginRight = '8px';
                checkbox.addEventListener('change', () => {
                    renderIcityContactCustomization();
                });
                
                const label = document.createElement('label');
                label.htmlFor = `icity-contact-${c.id}`;
                label.textContent = c.name;
                label.style.cursor = 'pointer';
                
                div.appendChild(checkbox);
                div.appendChild(label);
                contactsContainer.appendChild(div);
            });
        }
    }
    
    if (customizationContainer) {
        renderIcityContactCustomization();
    }
    
    if (wbSelect) {
        wbSelect.innerHTML = '<option value="">-- 选择世界书 --</option>';
        if (window.iphoneSimState.wbCategories) {
            window.iphoneSimState.wbCategories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                wbSelect.appendChild(opt);
            });
        }
        if (window.iphoneSimState.icityProfile.linkedWbId) {
            wbSelect.value = window.iphoneSimState.icityProfile.linkedWbId;
        }
    }
    
    document.getElementById('icity-settings-modal').classList.remove('hidden');
}

function saveIcitySettings() {
    const wbId = document.getElementById('icity-link-wb').value;
    
    if (!window.iphoneSimState.icityProfile) window.iphoneSimState.icityProfile = {};
    
    // Save multiple contacts
    const checkboxes = document.querySelectorAll('#icity-link-contacts-container input[type="checkbox"]');
    const selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => {
        const val = Number(cb.value);
        return isNaN(val) ? cb.value : val;
    });
    
    window.iphoneSimState.icityProfile.linkedContactIds = selectedIds;
    window.iphoneSimState.icityProfile.linkedWbId = wbId || null;

    // Save customizations
    if (window.iphoneSimState.contacts) {
        selectedIds.forEach(id => {
            const contact = window.iphoneSimState.contacts.find(c => c.id === id);
            if (contact) {
                const nameInput = document.getElementById(`icity-custom-name-${id}`);
                const idInput = document.getElementById(`icity-custom-id-${id}`);
                // Avatars are handled by change event immediately, but inputs are here
                if (nameInput) {
                    if (!contact.icityData) contact.icityData = {};
                    contact.icityData.name = nameInput.value.trim();
                }
                if (idInput) {
                    if (!contact.icityData) contact.icityData = {};
                    contact.icityData.handle = idInput.value.trim();
                }
            }
        });
    }
    
    saveConfig();
    document.getElementById('icity-settings-modal').classList.add('hidden');
    
    // Refresh UI
    renderIcityProfile();
    renderIcityFriends();
    renderIcityWorld(); // In case name change affects world view too?
}

function renderIcityContactCustomization() {
    const container = document.getElementById('icity-contact-customization-container');
    if (!container) return;
    
    // Get checked IDs
    const checkboxes = document.querySelectorAll('#icity-link-contacts-container input[type="checkbox"]');
    const checkedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => Number(cb.value));
    
    container.innerHTML = '';
    
    if (checkedIds.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; font-size: 12px;">请先勾选上方联系人</div>';
        return;
    }
    
    checkedIds.forEach(id => {
        const contact = window.iphoneSimState.contacts.find(c => c.id === id);
        if (!contact) return;
        
        const icityData = contact.icityData || {};
        
        const item = document.createElement('div');
        item.style.marginBottom = '15px';
        item.style.borderBottom = '1px dashed #eee';
        item.style.paddingBottom = '10px';
        
        const currentAvatar = icityData.avatar || contact.avatar || '';
        
        item.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px; color: #333;">${contact.name}</div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <div style="position: relative; width: 50px; height: 50px; flex-shrink: 0;">
                    <img src="${currentAvatar}" id="icity-custom-avatar-preview-${id}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd; cursor: pointer;">
                    <div style="position: absolute; bottom: 0; right: 0; background: #007AFF; color: #fff; width: 16px; height: 16px; border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center; pointer-events: none;"><i class="fas fa-camera"></i></div>
                    <input type="file" id="icity-custom-avatar-input-${id}" accept="image/*" class="file-input-hidden">
                </div>
                <div style="flex: 1;">
                    <input type="text" id="icity-custom-name-${id}" placeholder="iCity 昵称" value="${icityData.name || contact.name}" style="width: 100%; margin-bottom: 5px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                    <input type="text" id="icity-custom-id-${id}" placeholder="iCity ID (@开头)" value="${icityData.handle || '@user' + id.toString().slice(-4)}" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                </div>
            </div>
        `;
        
        container.appendChild(item);
        
        // Add event listener for image upload
        const img = item.querySelector(`#icity-custom-avatar-preview-${id}`);
        const fileInput = item.querySelector(`#icity-custom-avatar-input-${id}`);
        
        img.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                compressImage(file, 300, 0.7).then(base64 => {
                    if (!contact.icityData) contact.icityData = {};
                    contact.icityData.avatar = base64;
                    img.src = base64;
                    // Don't saveConfig here to avoid premature saving, but we update state.
                    // Actually saving is better to persist draft? No, stick to save button.
                    // But for base64 which is large, maybe better to keep in memory until save?
                    // We updated contact object in memory.
                });
            }
        });
    });
}

function handleIcitySend() {
    const textInput = document.getElementById('icity-compose-text');
    const visibilityBtn = document.getElementById('icity-visibility-btn');
    
    const content = textInput.value.trim();
    if (!content) {
        alert('请输入内容');
        return;
    }

    // Determine visibility from button content or state
    // We can infer from the icon class in the button
    let visibility = 'public';
    const iconClass = visibilityBtn.querySelector('i').className;
    if (iconClass.includes('fa-lock')) visibility = 'private';
    else if (iconClass.includes('fa-user-friends')) visibility = 'friends';
    else visibility = 'public';

    if (!window.iphoneSimState.icityDiaries) window.iphoneSimState.icityDiaries = [];
    
    const newDiary = {
        id: Date.now(),
        content: content,
        visibility: visibility,
        time: Date.now(),
        likes: 0,
        comments: 0
    };
    
    window.iphoneSimState.icityDiaries.unshift(newDiary);

    // Notify Linked Contacts (Context Injection)
    if (visibility === 'public' || visibility === 'friends') {
        const linkedIds = window.iphoneSimState.icityProfile.linkedContactIds || [];
        if (linkedIds.length === 0 && window.iphoneSimState.icityProfile.linkedContactId) {
            linkedIds.push(window.iphoneSimState.icityProfile.linkedContactId);
        }

        if (!window.iphoneSimState.chatHistory) window.iphoneSimState.chatHistory = {};

        linkedIds.forEach(id => {
            if (!window.iphoneSimState.chatHistory[id]) window.iphoneSimState.chatHistory[id] = [];
            
            window.iphoneSimState.chatHistory[id].push({
                role: 'system',
                type: 'system_event',
                content: `(用户发布了 iCity 动态: "${content}")`,
                time: Date.now()
            });
        });
    }
    
    // Check for 'Night Owl' or 'Early Bird'
    if (!window.iphoneSimState.icityBadges) initIcityBadges();
    const hour = new Date().getHours();
    
    const nightOwl = window.iphoneSimState.icityBadges.find(b => b.id === 'night_owl');
    if (nightOwl && !nightOwl.obtained && hour >= 0 && hour < 4) {
        nightOwl.obtained = true;
        alert(`解锁新徽章：${nightOwl.name}`);
    }
    
    const earlyBird = window.iphoneSimState.icityBadges.find(b => b.id === 'early_bird');
    if (earlyBird && !earlyBird.obtained && hour >= 5 && hour < 8) {
        earlyBird.obtained = true;
        alert(`解锁新徽章：${earlyBird.name}`);
    }

    const day = new Date().getDay();
    const weekendWarrior = window.iphoneSimState.icityBadges.find(b => b.id === 'weekend_warrior');
    if (weekendWarrior && !weekendWarrior.obtained && (day === 0 || day === 6)) {
        weekendWarrior.obtained = true;
        alert(`解锁新徽章：${weekendWarrior.name}`);
    }

    // New Badges Logic
    // Deep Thinker
    const deepThinker = window.iphoneSimState.icityBadges.find(b => b.id === 'deep_thinker');
    if (deepThinker && !deepThinker.obtained && content.length > 100) {
        deepThinker.obtained = true;
        alert(`解锁新徽章：${deepThinker.name}`);
    }

    // Minimalist
    const minimalist = window.iphoneSimState.icityBadges.find(b => b.id === 'minimalist');
    if (minimalist && !minimalist.obtained && content.length <= 2) {
        minimalist.obtained = true;
        alert(`解锁新徽章：${minimalist.name}`);
    }

    // Party Animal (Friday or Saturday 20:00-23:59)
    const partyAnimal = window.iphoneSimState.icityBadges.find(b => b.id === 'party_animal');
    if (partyAnimal && !partyAnimal.obtained && (day === 5 || day === 6) && hour >= 20) {
        partyAnimal.obtained = true;
        alert(`解锁新徽章：${partyAnimal.name}`);
    }

    // Monday Warrior (Monday 06:00-09:00)
    const mondayWarrior = window.iphoneSimState.icityBadges.find(b => b.id === 'monday_warrior');
    if (mondayWarrior && !mondayWarrior.obtained && day === 1 && hour >= 6 && hour < 9) {
        mondayWarrior.obtained = true;
        alert(`解锁新徽章：${mondayWarrior.name}`);
    }

    // Emoji Lover (Regex for emojis)
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
    const emojiLover = window.iphoneSimState.icityBadges.find(b => b.id === 'emoji_lover');
    if (emojiLover && !emojiLover.obtained && emojiRegex.test(content)) {
        emojiLover.obtained = true;
        alert(`解锁新徽章：${emojiLover.name}`);
    }

    // Questioner
    const questioner = window.iphoneSimState.icityBadges.find(b => b.id === 'questioner');
    if (questioner && !questioner.obtained && (content.includes('?') || content.includes('？'))) {
        questioner.obtained = true;
        alert(`解锁新徽章：${questioner.name}`);
    }

    // Positive Vibes
    const positiveVibes = window.iphoneSimState.icityBadges.find(b => b.id === 'positive_vibes');
    if (positiveVibes && !positiveVibes.obtained) {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('happy') || lowerContent.includes('good') || lowerContent.includes('love') || 
            content.includes('开心') || content.includes('快乐') || content.includes('爱')) {
            positiveVibes.obtained = true;
            alert(`解锁新徽章：${positiveVibes.name}`);
        }
    }

    // Storyteller (3 diaries today)
    const storyteller = window.iphoneSimState.icityBadges.find(b => b.id === 'storyteller');
    if (storyteller && !storyteller.obtained) {
        const today = new Date().setHours(0,0,0,0);
        const todayCount = window.iphoneSimState.icityDiaries.filter(d => d.time >= today).length;
        // Note: newDiary is already unshifted, so count includes current one
        if (todayCount >= 3) {
            storyteller.obtained = true;
            alert(`解锁新徽章：${storyteller.name}`);
        }
    }

    // Copycat (Identical to previous)
    const copycat = window.iphoneSimState.icityBadges.find(b => b.id === 'copycat');
    if (copycat && !copycat.obtained && window.iphoneSimState.icityDiaries.length >= 2) {
        // newDiary is at index 0, previous is at index 1
        const prevDiary = window.iphoneSimState.icityDiaries[1];
        if (prevDiary && prevDiary.content === content) {
            copycat.obtained = true;
            alert(`解锁新徽章：${copycat.name}`);
        }
    }

    checkIcityAchievements(); // Check count based achievements
    
    saveConfig();
    
    renderIcityDiaryList();
    if (!document.getElementById('icity-all-diaries-screen').classList.contains('hidden')) {
        renderIcityAllDiaries();
    }
    
    // Close and cleanup
    document.getElementById('icity-compose-modal').classList.add('hidden');
    textInput.value = '';

    // Generate Interactions if Public
    if (visibility === 'public') {
        setTimeout(() => {
            generateIcityInteractions(newDiary);
        }, 3000);
    }
}

async function generateIcityInteractions(diary) {
    const followers = window.iphoneSimState.icityProfile.followers || 0;
    
    // 1. Calculate Likes based on followers
    // Base 0-5 + 10%-30% of followers
    const baseLikes = Math.floor(Math.random() * 5);
    const followerLikes = Math.floor(followers * (0.1 + Math.random() * 0.2));
    const newLikes = baseLikes + followerLikes;
    
    setTimeout(() => {
        const targetDiary = window.iphoneSimState.icityDiaries.find(d => d.id === diary.id);
        if (targetDiary) {
            targetDiary.likes = (targetDiary.likes || 0) + newLikes;
            if (!window.iphoneSimState.icityProfile.totalLikes) window.iphoneSimState.icityProfile.totalLikes = 0;
            window.iphoneSimState.icityProfile.totalLikes += newLikes;
            
            saveConfig();
            renderIcityDiaryList(); // Refresh list to show like
            renderIcityProfile(); // Refresh profile to show total likes
        }
    }, 2000);

    // 2. NPC Follow Logic
    // Chance to gain new followers: 50% + small bonus based on content length?
    // Let's say randomly gain 0-3 followers per post usually
    const gainedFollowers = Math.floor(Math.random() * 4); // 0 to 3
    if (gainedFollowers > 0) {
        setTimeout(() => {
            window.iphoneSimState.icityProfile.followers = (window.iphoneSimState.icityProfile.followers || 0) + gainedFollowers;
            saveConfig();
            renderIcityProfile();
            // Optional: Notification?
        }, 3000);
    }

    // 3. Generate Comments & DMs via AI
    // DMs: 2-4
    const dmCount = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
    
    // Comments: Base 0-2 + 1%-5% of followers (but limit AI calls)
    // We will generate 1-3 actual comments via AI, and if the count should be higher, we just bump the number.
    const followerComments = Math.floor(followers * (0.01 + Math.random() * 0.04));
    const aiCommentCount = Math.min(3, 1 + Math.floor(Math.random() * 2)); // 1 to 3 AI comments
    const totalComments = Math.max(aiCommentCount, followerComments); // Ensure at least AI ones

    try {
        const notification = document.getElementById('summary-notification');
        const notificationText = document.getElementById('summary-notification-text');
        if (notification && notificationText) {
            notificationText.textContent = '正在生成互动...';
            notification.classList.remove('hidden');
        }

        const prompt = `用户在潮流社交APP（类似小红书/Instagram/即刻）发布了一篇日记：
"${diary.content}"

请模拟真实的互联网用户（Z世代、00后），生成以下互动内容。请务必拒绝“人机感”，内容要**极其生活化、口语化**。

【风格要求】
1. **网名**：不要用“小明”、“李华”这种假名字。要用现代网名，例如：全小写英文（"momo", "pluto"）、带emoji（"kiki ☁️", "77🍒"）、抽象短语（"想喝冰美式", "没睡醒"）、或者很有氛围感的词（"半岛铁盒", "Crush"）。
2. **语气**：不要像客服或机器人。要口语化、带网感。可以使用流行梗、颜文字、缩写。不要太书面。
3. **评论**：
   - 可以是简短的吐槽、共鸣（"演我"）、夸奖（"好美！"）。
   - 可以只发emoji，或者很短的一句话。
   - 甚至可以稍微有点阴阳怪气或无厘头。
4. **私信**：
   - 不要用“你好，我看到了你的动态...”这种正式开场白。
   - 就像朋友一样直接说话，或者像是在搭讪。例如：“姐妹这个哪里买的”、“笑死我了”、“dd”、“求图”。

【生成任务】
1. 生成 ${aiCommentCount} 条评论。
2. 生成 ${dmCount} 条私信（DMs）。

请严格返回以下 JSON 格式：
{
    "comments": [
        { "name": "网名", "content": "评论内容" },
        ...
    ],
    "dms": [
        { "name": "网名", "content": "私信内容" },
        ...
    ]
}`;
        
        const messages = [{ role: 'user', content: prompt }];
        const responseContent = await safeCallAiApi(messages);
        
        if (notification) {
            notification.classList.add('hidden');
        }
        
        let data = null;
        try {
            const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                data = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {}

        if (data) {
            const targetDiary = window.iphoneSimState.icityDiaries.find(d => d.id === diary.id);
            
            // Add Comments
            if (data.comments && Array.isArray(data.comments)) {
                if (targetDiary) {
                    if (!targetDiary.commentsList) targetDiary.commentsList = [];
                    
                    data.comments.forEach(c => {
                        targetDiary.commentsList.push({
                            id: Date.now() + Math.random(),
                            name: c.name,
                            content: c.content,
                            time: Date.now()
                        });
                    });
                    
                    // If totalComments is higher than what we generated, assume "ghost" comments
                    targetDiary.comments = (targetDiary.comments || 0) + Math.max(data.comments.length, totalComments);
                    saveConfig();
                    renderIcityDiaryList();
                }
            }

            // Add Messages
            if (data.dms && Array.isArray(data.dms)) {
                if (!window.iphoneSimState.icityMessages) window.iphoneSimState.icityMessages = [];
                
                data.dms.forEach(dm => {
                    const newMessage = {
                        id: Date.now() + Math.random(),
                        sender: dm.name,
                        handle: '@' + Math.random().toString(36).substring(7),
                        content: dm.content,
                        time: Date.now(),
                        diaryId: diary.id,
                        read: false,
                        type: 'stranger'
                    };
                    window.iphoneSimState.icityMessages.unshift(newMessage);
                });
                
                saveConfig();
                
                // If on messages tab, refresh
                const messagesTab = document.getElementById('icity-tab-content-messages');
                if (messagesTab && messagesTab.style.display !== 'none') {
                    renderIcityMessages();
                } else {
                    // Maybe show a badge on the tab?
                    // Simplified: just refresh if open.
                }
            }
        }

    } catch (e) {
        console.error("Failed to generate interactions", e);
        if (document.getElementById('summary-notification')) {
            document.getElementById('summary-notification').classList.add('hidden');
        }
    }
}

// Message Selection Mode State
window.icityMessageSelectionMode = false;
window.selectedIcityMessageIds = new Set();

function renderIcityMessages() {
    const list = document.getElementById('icity-messages-list');
    const empty = document.getElementById('icity-messages-empty');
    if (!list) return;

    const messages = window.iphoneSimState.icityMessages || [];
    
    if (messages.length === 0) {
        list.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    if (empty) empty.style.display = 'none';
    list.innerHTML = '';

    messages.forEach(msg => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center'; // Align center for checkbox
        item.style.padding = '15px';
        item.style.borderBottom = '1px solid #f0f0f0';
        item.style.cursor = 'pointer';
        item.style.backgroundColor = '#fff';
        item.style.transition = 'all 0.3s ease';

        // Selection Checkbox (Hidden by default)
        if (window.icityMessageSelectionMode) {
            const isSelected = window.selectedIcityMessageIds.has(msg.id);
            const checkboxHtml = `
                <div style="margin-right: 15px; width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${isSelected ? '#007AFF' : '#ccc'}; background: ${isSelected ? '#007AFF' : 'transparent'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${isSelected ? '<i class="fas fa-check" style="color: #fff; font-size: 14px;"></i>' : ''}
                </div>
            `;
            item.innerHTML = checkboxHtml;
        }

        // Time logic
        let timeStr = '刚刚';
        const diff = Date.now() - msg.time;
        if (diff < 60000) timeStr = '刚刚';
        else if (diff < 3600000) timeStr = Math.floor(diff/60000) + '分钟前';
        else if (diff < 86400000) timeStr = Math.floor(diff/3600000) + '小时前';
        else timeStr = '1天前'; 

        const contentHtml = `
            <div style="width: 50px; height: 50px; border-radius: 50%; background: #ccc; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; flex-shrink: 0;">
                <i class="fas fa-user"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: bold; font-size: 16px; color: #333;">${msg.sender}</span>
                    <span style="font-size: 12px; color: #ccc;">${timeStr}</span>
                </div>
                <div style="font-size: 14px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${msg.content}
                </div>
            </div>
        `;
        
        item.innerHTML += contentHtml;

        // Event Listeners
        if (window.icityMessageSelectionMode) {
            item.onclick = (e) => {
                e.stopPropagation();
                toggleIcityMessageSelection(msg.id);
            };
        } else {
            item.onclick = () => openIcityMessageDetail(msg);
            
            // Long Press Logic
            let pressTimer;
            const startPress = () => {
                pressTimer = setTimeout(() => {
                    enterIcityMessageSelectionMode(msg.id);
                }, 600); // 600ms for long press
            };
            const cancelPress = () => {
                clearTimeout(pressTimer);
            };

            item.addEventListener('touchstart', startPress);
            item.addEventListener('touchend', cancelPress);
            item.addEventListener('touchmove', cancelPress);
            item.addEventListener('mousedown', startPress);
            item.addEventListener('mouseup', cancelPress);
            item.addEventListener('mouseleave', cancelPress);
        }

        list.appendChild(item);
    });
}

function enterIcityMessageSelectionMode(initialId) {
    if (window.icityMessageSelectionMode) return;
    
    window.icityMessageSelectionMode = true;
    window.selectedIcityMessageIds = new Set();
    if (initialId) window.selectedIcityMessageIds.add(initialId);
    
    updateIcityMessageHeader();
    renderIcityMessages();
    
    // Haptic feedback if supported (simulated)
    if (navigator.vibrate) navigator.vibrate(50);
}

function exitIcityMessageSelectionMode() {
    window.icityMessageSelectionMode = false;
    window.selectedIcityMessageIds = new Set();
    
    updateIcityMessageHeader();
    renderIcityMessages();
}

function toggleIcityMessageSelection(id) {
    if (window.selectedIcityMessageIds.has(id)) {
        window.selectedIcityMessageIds.delete(id);
    } else {
        window.selectedIcityMessageIds.add(id);
    }
    
    updateIcityMessageHeader(); // Update count
    renderIcityMessages(); // Refresh UI
}

function deleteSelectedIcityMessages() {
    if (window.selectedIcityMessageIds.size === 0) return;
    
    if (!confirm(`确定删除这 ${window.selectedIcityMessageIds.size} 条对话吗？`)) return;
    
    window.iphoneSimState.icityMessages = window.iphoneSimState.icityMessages.filter(
        msg => !window.selectedIcityMessageIds.has(msg.id)
    );
    
    saveConfig();
    exitIcityMessageSelectionMode();
}

function updateIcityMessageHeader() {
    const header = document.querySelector('#icity-tab-content-messages .app-header');
    if (!header) return;
    
    if (window.icityMessageSelectionMode) {
        const count = window.selectedIcityMessageIds.size;
        header.innerHTML = `
            <button onclick="window.exitIcityMessageSelectionMode()" style="position: absolute; left: 15px; background: none; border: none; font-size: 16px; color: #333; cursor: pointer;">取消</button>
            <div style="font-weight: bold; font-size: 16px;">已选择 ${count}</div>
            <button onclick="window.deleteSelectedIcityMessages()" style="position: absolute; right: 15px; background: none; border: none; font-size: 16px; color: ${count > 0 ? '#FF3B30' : '#ccc'}; cursor: pointer;" ${count === 0 ? 'disabled' : ''}>删除</button>
        `;
    } else {
        // Restore default header
        header.innerHTML = `
            <div style="display: flex; background: #f0f0f0; border-radius: 8px; padding: 2px;">
                <div style="padding: 4px 15px; font-size: 14px; color: #666; cursor: pointer;">通讯录</div>
                <div style="padding: 4px 15px; font-size: 14px; font-weight: bold; background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer;">私信</div>
            </div>
            <button style="position: absolute; right: 15px; background: none; border: none; font-size: 20px; color: #666;"><i class="far fa-plus-square"></i></button>
        `;
    }
}

// Make globally accessible
window.enterIcityMessageSelectionMode = enterIcityMessageSelectionMode;
window.exitIcityMessageSelectionMode = exitIcityMessageSelectionMode;
window.toggleIcityMessageSelection = toggleIcityMessageSelection;
window.deleteSelectedIcityMessages = deleteSelectedIcityMessages;

function openIcityMessageDetail(msg) {
    window.currentOpenIcityMessageId = msg.id;
    
    const screen = document.getElementById('icity-message-detail-screen');
    const nameEl = document.getElementById('icity-message-detail-name');
    const handleEl = document.getElementById('icity-message-detail-handle');
    const backBtn = document.getElementById('close-icity-message-detail');

    if (nameEl) nameEl.textContent = msg.sender;
    if (handleEl) handleEl.textContent = msg.handle;
    
    // Initialize history if needed
    if (!msg.history) {
        msg.history = [
            { role: 'stranger', content: msg.content, time: msg.time }
        ];
    }
    
    renderIcityMessageDetailList(msg);

    if (backBtn) {
        backBtn.onclick = () => {
            screen.classList.add('hidden');
            window.currentOpenIcityMessageId = null;
        };
    }

    screen.classList.remove('hidden');
}

function renderIcityMessageDetailList(msg) {
    const listEl = document.getElementById('icity-message-detail-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    // Get user avatar for "Me" messages
    const userAvatar = (window.iphoneSimState.icityProfile && window.iphoneSimState.icityProfile.avatar) ? window.iphoneSimState.icityProfile.avatar : '';

    msg.history.forEach((item, index) => {
        // Date Label logic (simplified: show for first message)
        if (index === 0) {
            const dateDiv = document.createElement('div');
            dateDiv.style.textAlign = 'center';
            dateDiv.style.color = '#ccc';
            dateDiv.style.fontSize = '12px';
            dateDiv.style.marginBottom = '20px';
            dateDiv.innerText = new Date(item.time).toLocaleDateString() + ' ' + new Date(item.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            listEl.appendChild(dateDiv);
        }

        const isMe = item.role === 'me' || item.role === 'user';
        const msgDiv = document.createElement('div');
        msgDiv.className = `icity-msg-row ${isMe ? 'me' : 'other'}`;
        
        let avatarStyle = '';
        let avatarInner = '';

        if (isMe) {
            if (userAvatar) {
                avatarStyle = `background-image: url('${userAvatar}'); background-color: transparent;`;
            } else {
                avatarStyle = `background-color: #000;`;
            }
        } else {
            // Check if we can find avatar from contacts
            let otherAvatar = '';
            if (msg.avatar) otherAvatar = msg.avatar;
            // Also check contact list if handle matches or name matches
            if (!otherAvatar && window.iphoneSimState.contacts) {
                const c = window.iphoneSimState.contacts.find(c => c.name === msg.sender || (c.icityData && c.icityData.handle === msg.handle));
                if (c) {
                    if (c.icityData && c.icityData.avatar) otherAvatar = c.icityData.avatar;
                    else if (c.avatar) otherAvatar = c.avatar;
                }
            }

            if (otherAvatar) {
                avatarStyle = `background-image: url('${otherAvatar}'); background-color: transparent;`;
            } else {
                avatarStyle = `background-color: #ccc;`;
                avatarInner = `<i class="fas fa-user"></i>`;
            }
        }
        
        if (isMe) {
            msgDiv.innerHTML = `
                <div class="icity-bubble me">
                    ${item.content}
                </div>
                <div class="icity-avatar" style="${avatarStyle}">
                    ${avatarInner}
                </div>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="icity-avatar" style="${avatarStyle}">
                    ${avatarInner}
                </div>
                <div class="icity-bubble other">
                    ${item.content}
                </div>
            `;
        }
        listEl.appendChild(msgDiv);
    });
    
    // Scroll to bottom
    setTimeout(() => {
        const body = document.getElementById('icity-message-detail-body');
        if (body) body.scrollTop = body.scrollHeight;
    }, 100);
}

async function handleIcityMessageSend(triggerAi = true) {
    const input = document.getElementById('icity-message-input');
    const content = input.value.trim();
    
    if (!content && !triggerAi) return;
    
    if (!window.currentOpenIcityMessageId) return;
    
    const msgObj = window.iphoneSimState.icityMessages.find(m => m.id === window.currentOpenIcityMessageId);
    if (!msgObj) return;
    
    // 1. Add User Message
    if (content) {
        if (!msgObj.history) msgObj.history = [];
        msgObj.history.push({
            role: 'me',
            content: content,
            time: Date.now()
        });
        
        // Update preview
        msgObj.content = content;
        msgObj.time = Date.now();
        
        input.value = '';
        renderIcityMessageDetailList(msgObj);
        saveConfig();
        renderIcityMessages(); // Update list view order/preview
    }
    
    // 2. Generate AI Reply
    if (triggerAi) {
        try {
            const historyContext = msgObj.history.slice(-10).map(h => 
                `${h.role === 'me' ? '我' : '对方'}: ${h.content}`
            ).join('\n');
            
            const prompt = `你正在扮演一个网络用户（${msgObj.sender}），正在与“我”进行私信聊天。
以下是聊天记录：
${historyContext}

请回复“我”的上一条消息。
要求：
1. 保持人设（${msgObj.sender}），语气口语化、生活化、像真人。
2. 回复不要太长，符合聊天习惯。
3. 只返回回复内容，不要包含其他文字。`;

            const messages = [{ role: 'user', content: prompt }];
            
            // Show typing indicator
            const nameEl = document.getElementById('icity-message-detail-name');
            if (nameEl) nameEl.textContent = '对方正在输入中...';

            const responseContent = await safeCallAiApi(messages);
            
            // Restore name
            if (nameEl) nameEl.textContent = msgObj.sender;

            if (responseContent) {
                if (!msgObj.history) msgObj.history = [];
                msgObj.history.push({
                    role: 'stranger',
                    content: responseContent,
                    time: Date.now()
                });
                msgObj.content = responseContent; // Update preview to latest
                msgObj.time = Date.now();
                
                saveConfig();
                if (window.currentOpenIcityMessageId === msgObj.id) {
                    renderIcityMessageDetailList(msgObj);
                }
                renderIcityMessages();
            }
            
        } catch (e) {
            console.error("Failed to generate reply", e);
            // Restore name on error
            const nameEl = document.getElementById('icity-message-detail-name');
            if (nameEl) nameEl.textContent = msgObj.sender;
        }
    }
}

function renderIcityDiaryList() {
    const listContainer = document.querySelector('.icity-diary-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    const diaries = window.iphoneSimState.icityDiaries || [];
    
    // Update diary count
    const countEl = document.getElementById('icity-diary-count');
    if (countEl) countEl.textContent = diaries.length;

    const limit = 3;
    const displayDiaries = diaries.slice(0, limit);
    
    displayDiaries.forEach(diary => {
        const item = document.createElement('div');
        item.style.borderBottom = '1px solid #f0f0f0';
        item.style.padding = '10px 0';
        
        let visIconHtml = '';
        if (diary.visibility === 'private') {
            visIconHtml = '<i class="fas fa-lock"></i>';
        } else if (diary.visibility === 'friends') {
            visIconHtml = '<i class="fas fa-user"></i>'; 
        }
        
        const date = new Date(diary.time);
        const timeStr = `${date.getMonth() + 1}月${date.getDate()}日`;

        item.onclick = (e) => {
            // Prevent if clicking on menu items
            if (e.target.closest('.fa-ellipsis-h') || e.target.closest('[id^="icity-menu"]')) return;
            openIcityDiaryDetail(diary.id);
        };
        item.style.cursor = 'pointer';

        item.innerHTML = `
            <div style="font-size: 16px; color: #333; line-height: 1.5; margin-bottom: 5px; white-space: pre-wrap; word-break: break-word;">${diary.content}</div>
            <div style="display: flex; align-items: center; color: #ccc; font-size: 14px; gap: 15px; justify-content: flex-end;">
                ${visIconHtml}
                <div style="display: flex; align-items: center; gap: 4px; cursor: pointer;" onclick="event.stopPropagation(); window.toggleIcityLike(${diary.id})">
                    <i class="${diary.isLiked ? 'fas' : 'far'} fa-heart" style="${diary.isLiked ? 'color: #FF3B30;' : ''}"></i>
                    ${diary.likes > 0 ? `<span style="${diary.isLiked ? 'color: #FF3B30;' : ''}">${diary.likes}</span>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <i class="far fa-comment"></i>
                    ${diary.comments > 0 ? `<span style="${diary.isLiked ? 'color: #FF3B30;' : ''}">${diary.comments}</span>` : ''}
                </div>
                <span style="font-size: 12px;">${timeStr}</span>
                <div style="position: relative;">
                    <i class="fas fa-ellipsis-h" style="cursor: pointer; padding: 5px;" onclick="event.stopPropagation(); toggleIcityMenu(this, ${diary.id})"></i>
                    <div id="icity-menu-${diary.id}" class="hidden" style="position: absolute; right: 0; bottom: 25px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 4px; padding: 5px 0; min-width: 80px; z-index: 10;">
                        <div onclick="event.stopPropagation(); deleteIcityDiary(${diary.id})" style="padding: 8px 15px; color: #FF3B30; font-size: 14px; cursor: pointer; text-align: center;">删除</div>
                    </div>
                </div>
            </div>
        `;
        
        listContainer.appendChild(item);
    });

    if (diaries.length > limit) {
        const moreDiv = document.createElement('div');
        moreDiv.style.textAlign = 'center';
        moreDiv.style.padding = '15px 0';
        moreDiv.style.color = '#999';
        moreDiv.style.fontSize = '14px';
        moreDiv.style.cursor = 'pointer';
        moreDiv.innerText = '更多日记';
        moreDiv.onclick = openIcityAllDiaries;
        listContainer.appendChild(moreDiv);
    }
}

function openIcityAllDiaries() {
    renderIcityAllDiaries();
    document.getElementById('icity-all-diaries-screen').classList.remove('hidden');
}

function renderIcityAllDiaries() {
    const listContainer = document.getElementById('icity-all-diaries-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    listContainer.style.background = '#f2f2f7'; // Ensure background color for gap visibility
    
    const activeTabEl = document.querySelector('.icity-diary-tab.active');
    const activeTab = activeTabEl ? activeTabEl.dataset.tab : 'all';

    let diaries = window.iphoneSimState.icityDiaries || [];
    
    if (activeTab !== 'all') {
        diaries = diaries.filter(d => d.visibility === activeTab);
    }
    
    // User Info
    const profile = window.iphoneSimState.icityProfile || {};
    const userName = profile.nickname || 'Kaneki'; 
    const userId = profile.id || '@heanova1';
    const avatarSrc = profile.avatar || '';
    
    // Update Header Name
    const headerTitle = document.getElementById('icity-all-diaries-title');
    if (headerTitle) {
        headerTitle.textContent = `${userName} · 日记`;
    } else {
        // Fallback for old structure
        const headerName = document.getElementById('icity-all-diaries-user-name');
        if (headerName) {
            headerName.textContent = userName;
            const subText = headerName.nextElementSibling;
            if (subText) subText.textContent = '日记';
        }
    }

    // Group diaries by day
    const groupedDiaries = [];
    let currentGroup = null;

    diaries.forEach(diary => {
        const date = new Date(diary.time);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        
        if (!currentGroup || currentGroup.key !== key) {
            currentGroup = { key: key, list: [] };
            groupedDiaries.push(currentGroup);
        }
        currentGroup.list.push(diary);
    });

    groupedDiaries.forEach(group => {
        const item = document.createElement('div');
        // Card styling: grey top, shadow, margin
        item.style.backgroundColor = '#fff';
        item.style.margin = '10px 5px'; // Reduced vertical margin, no horizontal margin
        item.style.borderRadius = '0'; // No border radius
        item.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)'; // Subtle shadow
        item.style.overflow = 'hidden'; // Ensure header background clips
        
        // Use first diary for header date info
        const firstDiary = group.list[0];
        const date = new Date(firstDiary.time);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const dayOfWeek = daysOfWeek[date.getDay()];
        
        const datePart = `${month}月${day}日 · ${dayOfWeek}`;
        const yearPart = `${year}`;

        // Header HTML
        let html = `
            <!-- Grey Header Strip with Avatar, Name, Date -->
            <div style="background-color: #f9f9f9; padding: 6px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0;">
                <div style="display: flex; align-items: center;">
                    <div style="width: 30px; height: 30px; border-radius: 50%; background: #000; margin-right: 10px; background-image: url('${avatarSrc}'); background-size: cover; background-position: center;"></div>
                    <div style="display: flex; flex-direction: column; justify-content: center;">
                        <div style="font-weight: bold; font-size: 14px; color: #333; line-height: 1.2;">${userName}</div>
                        <div style="font-size: 10px; color: #999; margin-top: 2px; line-height: 1.2;">${userId}</div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
                    <div style="font-size: 12px; color: #999; line-height: 1.2;">${datePart}</div>
                    <div style="font-size: 12px; color: #999; margin-top: 2px; line-height: 1.2;">${yearPart}</div>
                </div>
            </div>
        `;

        // Content List HTML
        group.list.forEach((diary, index) => {
            let visIconHtml = '';
            if (diary.visibility === 'private') {
                visIconHtml = '<i class="fas fa-lock"></i>';
            } else if (diary.visibility === 'friends') {
                visIconHtml = '<i class="fas fa-user-friends"></i>'; 
            }

            const dDate = new Date(diary.time);
            const timeStr = `${dDate.getHours().toString().padStart(2, '0')}:${dDate.getMinutes().toString().padStart(2, '0')}`;
            
            // Add separator for subsequent items
            const separatorStyle = index > 0 ? 'border-top: 1px dashed #f0f0f0;' : '';

            html += `
                <div style="${separatorStyle} cursor: pointer;" onclick="openIcityDiaryDetail(${diary.id})">
                    <!-- Content -->
                    <div style="padding: 10px 15px 5px 15px;">
                        <div style="font-size: 15px; color: #333; line-height: 1.6; margin-bottom: 5px; white-space: pre-wrap; word-break: break-word;">${diary.content}</div>
                    </div>
                    
                    <!-- Footer: Icons, Time -->
                    <div style="padding: 0 15px 10px 15px; display: flex; align-items: center; justify-content: flex-end; color: #ccc; font-size: 12px; gap: 15px;">
                        ${visIconHtml}
                        <i class="far fa-heart"></i>
                        <i class="far fa-comment"></i>
                        <span>${timeStr}</span>
                        <div style="position: relative;">
                            <i class="fas fa-ellipsis-v" style="cursor: pointer; padding: 5px;" onclick="event.stopPropagation(); toggleIcityMenu(this, ${diary.id})"></i>
                            <div id="icity-menu-all-${diary.id}" class="hidden" style="position: absolute; right: 0; bottom: 25px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 4px; padding: 5px 0; min-width: 80px; z-index: 10;">
                                <div onclick="event.stopPropagation(); deleteIcityDiary(${diary.id})" style="padding: 8px 15px; color: #FF3B30; font-size: 14px; cursor: pointer; text-align: center;">删除</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        item.innerHTML = html;
        listContainer.appendChild(item);
    });
}

function toggleIcityMenu(btn, id) {
    // Determine which menu to toggle (main list or all list)
    // Actually we can just try to toggle both or check context. 
    // Simplified: toggle based on ID.
    
    // Close all first
    document.querySelectorAll('[id^="icity-menu-"]').forEach(el => el.classList.add('hidden'));
    
    let menu = document.getElementById(`icity-menu-${id}`);
    if (!menu) menu = document.getElementById(`icity-menu-all-${id}`);
    
    if (menu) {
        menu.classList.toggle('hidden');
        
        // Close on click outside
        const closeMenu = (e) => {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.add('hidden');
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }
}

function deleteIcityDiary(id) {
    if (confirm('确定删除这条日记吗？')) {
        window.iphoneSimState.icityDiaries = window.iphoneSimState.icityDiaries.filter(d => d.id !== id);
        saveConfig();
        renderIcityDiaryList();
        renderIcityAllDiaries();
    }
}

function openIcityEditProfile() {
    const profile = window.iphoneSimState.icityProfile || {};
    document.getElementById('icity-edit-nickname').value = profile.nickname || 'Kaneki';
    document.getElementById('icity-edit-id').value = profile.id || '@heanova1';
    document.getElementById('icity-edit-profile-screen').classList.remove('hidden');
}

function handleSaveIcityProfile() {
    const nickname = document.getElementById('icity-edit-nickname').value.trim();
    const id = document.getElementById('icity-edit-id').value.trim();

    if (!window.iphoneSimState.icityProfile) {
        window.iphoneSimState.icityProfile = {};
    }

    window.iphoneSimState.icityProfile.nickname = nickname || 'Kaneki';
    window.iphoneSimState.icityProfile.id = id || '@heanova1';
    
    saveConfig();
    document.getElementById('icity-edit-profile-screen').classList.add('hidden');
    
    // Update UI
    const nameEl = document.querySelector('#icity-app .app-body div[style*="margin-top: 10px; text-align: center;"] div[style*="font-size: 24px"]');
    const idEl = document.querySelector('#icity-app .app-body div[style*="margin-top: 10px; text-align: center;"] div[style*="color: #999; font-size: 14px;"]');
    
    if (nameEl) nameEl.textContent = window.iphoneSimState.icityProfile.nickname;
    if (idEl) idEl.textContent = window.iphoneSimState.icityProfile.id;
    
    renderIcityAllDiaries(); // Update names in list
}

function openIcityDiaryDetail(id, source = 'diary') {
    let post = null;
    let userAvatar = '';
    let userName = '';
    let userHandle = '';
    let visibility = 'public'; // default

    if (source === 'diary') {
        post = window.iphoneSimState.icityDiaries.find(d => d.id === id);
        if (!post) return;
        
        const profile = window.iphoneSimState.icityProfile || {};
        userAvatar = profile.avatar;
        userName = profile.nickname || 'Kaneki';
        userHandle = profile.id || '@heanova1';
        visibility = post.visibility || 'public';
        
    } else if (source === 'world') {
        post = window.iphoneSimState.icityWorldPosts.find(p => p.id === id);
        if (!post) return;
        
        userAvatar = post.avatar;
        userName = post.name;
        userHandle = post.handle;
        visibility = 'public';
        
    } else if (source === 'friends') {
        post = window.iphoneSimState.icityFriendsPosts.find(p => p.id === id);
        if (!post) return;
        
        // Similar logic to renderIcityFriends to resolve user info
        let contact = null;
        if (post.contactId) {
            contact = window.iphoneSimState.contacts.find(c => c.id === post.contactId);
        } else {
            contact = window.iphoneSimState.contacts.find(c => c.name === post.name);
        }

        userName = post.name;
        userHandle = post.handle;
        userAvatar = post.avatar;

        if (contact) {
            if (contact.icityData) {
                if (contact.icityData.name) userName = contact.icityData.name;
                if (contact.icityData.handle) userHandle = contact.icityData.handle;
                if (contact.icityData.avatar) userAvatar = contact.icityData.avatar;
            } else {
                if (!userAvatar) userAvatar = contact.avatar;
            }
        }
        
        // Fallback
        if (!userName) userName = post.name;
        if (!userHandle) userHandle = post.handle || '@user';
        
        visibility = 'friends';
    }

    if (!post) return;
    
    // Update Header Title
    const titleEl = document.getElementById('icity-detail-title');
    if (titleEl) {
        titleEl.textContent = `${userName} · 日记`;
    }

    // Populate Avatar
    const avatarEl = document.getElementById('icity-detail-avatar');
    avatarEl.innerHTML = ''; // Clear previous icon
    avatarEl.style.display = 'block'; // Reset display

    if (source === 'world') {
        // World: Gray avatar with icon
        avatarEl.style.backgroundImage = '';
        avatarEl.style.backgroundColor = '#ccc';
        avatarEl.style.display = 'flex';
        avatarEl.style.alignItems = 'center';
        avatarEl.style.justifyContent = 'center';
        avatarEl.innerHTML = '<i class="fas fa-user" style="color: #fff; font-size: 20px;"></i>';
    } else if (userAvatar) {
        avatarEl.style.backgroundImage = `url('${userAvatar}')`;
        avatarEl.style.backgroundColor = 'transparent';
    } else {
        avatarEl.style.backgroundImage = '';
        avatarEl.style.backgroundColor = '#ccc';
        if (source === 'diary') {
            avatarEl.style.backgroundColor = '#000';
        } else {
            // Friends without avatar: Show icon
            avatarEl.style.display = 'flex';
            avatarEl.style.alignItems = 'center';
            avatarEl.style.justifyContent = 'center';
            avatarEl.innerHTML = '<i class="fas fa-user" style="color: #fff; font-size: 20px;"></i>';
        }
    }
    
    document.getElementById('icity-detail-name').textContent = userName;
    document.getElementById('icity-detail-handle').textContent = userHandle;
    
    document.getElementById('icity-detail-text').textContent = post.content;
    
    let timeStr = '';
    if (typeof post.time === 'number') {
        const date = new Date(post.time);
        timeStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
    } else {
        // Handle string time (legacy world posts)
        timeStr = post.time || '刚刚';
    }
    document.getElementById('icity-detail-time').textContent = timeStr;
    
    const visMap = { 'public': '公开', 'private': '私密', 'friends': '仅好友' };
    const visIconMap = { 'public': 'fa-globe', 'private': 'fa-lock', 'friends': 'fa-user-friends' };
    
    document.getElementById('icity-detail-visibility').innerHTML = `<i class="fas ${visIconMap[visibility] || 'fa-globe'}"></i> ${visMap[visibility] || '公开'}`;
    
    // Clear Comments for now
    const commentsList = document.getElementById('icity-detail-comments-list');
    commentsList.innerHTML = '';
    
    // Render comments if any
    const comments = post.commentsList || [];
    
    comments.forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.style.display = 'flex';
        commentItem.style.marginBottom = '15px';
        commentItem.style.borderBottom = '1px dashed #f0f0f0';
        commentItem.style.paddingBottom = '10px';

        let timeStr = '刚刚';
        const diff = Date.now() - comment.time;
        if (diff < 60000) timeStr = '刚刚';
        else if (diff < 3600000) timeStr = Math.floor(diff/60000) + '分钟前';
        else timeStr = new Date(comment.time).toLocaleString();

        commentItem.innerHTML = `
            <div style="width: 30px; height: 30px; border-radius: 50%; background: #ccc; margin-right: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px;">
                <i class="fas fa-user"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: bold; font-size: 14px; color: #333;">${comment.name}</span>
                    <span style="font-size: 10px; color: #ccc;">${timeStr}</span>
                </div>
                <div style="font-size: 14px; color: #666; line-height: 1.4;">${comment.content}</div>
            </div>
        `;
        commentsList.appendChild(commentItem);
    });
    
    const displayCount = (post.commentsList && post.commentsList.length > 0) ? post.commentsList.length : (post.comments || 0);
    document.getElementById('icity-detail-comments-count').innerHTML = `${displayCount} 条评论 <i class="fas fa-chevron-down"></i>`;

    document.getElementById('icity-detail-screen').classList.remove('hidden');
}

function toggleIcityLike(id) {
    const diary = window.iphoneSimState.icityDiaries.find(d => d.id === id);
    if (diary) {
        if (diary.isLiked) {
            diary.isLiked = false;
            diary.likes = Math.max(0, (diary.likes || 0) - 1);
        } else {
            diary.isLiked = true;
            diary.likes = (diary.likes || 0) + 1;
        }
        saveConfig();
        renderIcityDiaryList();
    }
}

// Global Exports
window.toggleIcityLike = toggleIcityLike;
window.openIcityDiaryDetail = openIcityDiaryDetail;
window.renderIcityProfile = renderIcityProfile;
window.renderIcityDiaryList = renderIcityDiaryList;
window.toggleIcityMenu = toggleIcityMenu;
window.deleteIcityDiary = deleteIcityDiary;
window.openIcityAllDiaries = openIcityAllDiaries;
window.openIcityBadges = openIcityBadges;
window.checkIcityAchievements = checkIcityAchievements;
window.toggleEquipBadge = toggleEquipBadge;
window.openIcityTitles = openIcityTitles;
window.equipIcityTitle = equipIcityTitle;
window.handleCreateCustomTitle = handleCreateCustomTitle;
window.deleteIcityTitle = deleteIcityTitle;

function getRandomWorldPosts(count = 5) {
    const names = ["7", "bye", "evenlonelinessanddeath", "iiio77_iuz", "林深见鹿", "半岛铁盒", "Cloud", "Momo", "Kiki", "Jia"];
    const handles = ["@lovejiangrenhhh", "@sickodyuu", "@n_annan7", "@iiio77_iuz", "@lin_deep", "@bandao", "@cloud_9", "@momo_world", "@kiki_delivery", "@jia_home"];
    const contents = [
        "十七岁的谢辞，打架抽烟喝大酒泡吧，喜欢和高年级的男生混在一起。\n在盛夏的一天，许呦抱着书，在众目睽睽下推开教室的门进来。\n有男生坐在桌上吹口哨。",
        "再次见面的时候你对怎么对我毫无波澜了，好无力，我已经把你的喜欢耗尽了吗，为什么会这样",
        "我想去卸甲 有事缠身。我不得劲\n好难抉择才做一周",
        "现在也终于理解了什么是门当户对 谈恋爱可以凭感觉 结婚不可以 我也遇到了想要结婚在一起的人 可终究要回到现实 相爱不会抵万难 我们两个即使再相爱",
        "今天的天气真好，适合出去走走。\n阳光洒在身上暖洋洋的。",
        "最近在读一本很有意思的书，推荐给大家。",
        "好想去旅行啊，去一个没有人认识我的地方。",
        "生活总是有起有落，保持平常心就好。",
        "就在一瞬间，我突然觉得我好像不喜欢你了。",
        "有些路，只能一个人走。"
    ];
    
    const posts = [];
    for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * names.length);
        const contentIdx = Math.floor(Math.random() * contents.length);
        posts.push({
            id: Date.now() + i,
            name: names[idx],
            handle: handles[idx],
            avatar: '',
            content: contents[contentIdx],
            time: Date.now() - Math.floor(Math.random() * 100000000),
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 20)
        });
    }
    return posts;
}

function renderIcityWorld() {
    const list = document.getElementById('icity-world-list');
    if (!list) return;
    
    // Ensure state exists
    if (!window.iphoneSimState.icityWorldPosts) {
        window.iphoneSimState.icityWorldPosts = [];
    }
    
    const posts = window.iphoneSimState.icityWorldPosts;
    
    if (posts.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 50px; color: #999;">点击右上角生成动态</div>';
        return;
    }
    
    list.innerHTML = '';
    
    posts.forEach(post => {
        const item = document.createElement('div');
        item.style.backgroundColor = '#fff';
        item.style.padding = '15px';
        item.style.borderBottom = '1px solid #f0f0f0';
        item.style.cursor = 'pointer';

        item.onclick = (e) => {
            if (e.target.closest('.fa-heart') || e.target.closest('.fa-comment') || e.target.closest('.fa-ellipsis-v')) return;
            openIcityDiaryDetail(post.id, 'world');
        };
        
        const date = new Date(post.time);
        // Random relative time strings like "22秒钟前", "24秒钟前" as in image
        const seconds = Math.floor(Math.random() * 60);
        const timeStr = `${seconds}秒钟前`;
        
        item.innerHTML = `
            <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: #ccc; margin-right: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas fa-user" style="color: #fff; font-size: 20px;"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 15px; color: #333;">${post.name}</div>
                    <div style="font-size: 12px; color: #999;">${post.handle}</div>
                </div>
            </div>
            <div style="font-size: 15px; color: #333; line-height: 1.6; margin-bottom: 10px; white-space: pre-wrap;">${post.content}</div>
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 20px; color: #ccc; font-size: 13px;">
                <i class="far fa-heart"></i>
                <i class="far fa-comment"></i>
                <div style="display: flex; align-items: center; gap: 5px;"><i class="far fa-clock"></i> ${timeStr}</div>
                <i class="fas fa-ellipsis-v"></i>
            </div>
        `;
        list.appendChild(item);
    });
}

async function handleGenerateIcityWorld() {
    const btn = document.getElementById('icity-world-generate-btn');
    if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const posts = await callAiForWorldPosts();
        if (posts && posts.length > 0) {
            window.iphoneSimState.icityWorldPosts = posts;
            saveConfig();
            renderIcityWorld();
        }
    } catch (e) {
        console.error('Failed to generate world posts:', e);
        alert('生成失败，请检查 API 设置');
    } finally {
        if (btn) btn.innerHTML = '<i class="fas fa-magic"></i>';
    }
}

async function callAiForWorldPosts() {
    const prompt = `生成5条模仿社交媒体动态的内容。每条内容包含：昵称、用户ID（@开头）、头像关键词（用于生成头像）、正文内容（可以是心情、小说摘录、吐槽等，风格多样化）、点赞数（0-100）、评论数（0-20）。
    
    请严格按照以下 JSON 格式返回，不要包含其他解释性文字：
    [
        {
            "name": "昵称",
            "handle": "@userid",
            "avatar_seed": "avatar_keyword",
            "content": "正文内容",
            "likes": 10,
            "comments": 2
        },
        ...
    ]`;

    const messages = [{ role: 'user', content: prompt }];
    
    try {
        const response = await callAiApi(messages); // Assuming callAiApi is available globally from chat.js or core.js
        // If callAiApi is not available, we might need to implement a simple fetch here or ensure chat.js is loaded.
        // Based on file list, chat.js is present. Let's assume callAiApi or a similar function exists or we implement a local one.
        // Actually, looking at previous context, there is a `callAiApi` in `js/chat.js` but it might be scoped.
        // Let's check `js/core.js` or `js/chat.js` for available AI functions.
        // Since I cannot check other files right now, I will implement a safe local version of API call using state settings.
        
        return parseAiResponse(response);
    } catch (error) {
        // If external call fails, fallback to a local mock for robustness if needed, or rethrow.
        console.error("AI API Call failed", error);
        throw error;
    }
}

async function safeCallAiApi(messages) {
    const { url, key, model } = window.iphoneSimState.aiSettings;
    if (!url || !key) {
        throw new Error("AI Settings missing");
    }

    const response = await fetch(url + '/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: model || 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.8
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function parseAiResponse(content) {
    try {
        // Try to find JSON array in the content
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return data.map((item, index) => ({
                id: Date.now() + index,
                name: item.name,
                handle: item.handle,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.avatar_seed}`,
                content: item.content,
                time: Date.now() - Math.floor(Math.random() * 10000000), // Random recent time
                likes: item.likes,
                comments: item.comments
            }));
        }
        throw new Error("No JSON found");
    } catch (e) {
        console.error("Parse error", e);
        return [];
    }
}

// Override callAiApi usage with safeCallAiApi
async function callAiForWorldPosts() {
    const prompt = `生成5条模仿社交媒体动态的内容。要求：
    1. 风格类似朋友圈或微博，包含生活感悟、小说片段、心情记录等。
    2. 内容要有换行。
    3. 严格返回 JSON 数组格式。
    
    格式示例：
    [
        {
            "name": "用户昵称",
            "handle": "@user_handle",
            "avatar_seed": "seed_string",
            "content": "动态正文\\n第二行",
            "likes": 42,
            "comments": 5
        }
    ]`;

    const messages = [{ role: 'user', content: prompt }];
    const content = await safeCallAiApi(messages);
    return parseAiResponse(content);
}

// Register Init Function
if (window.appInitFunctions) {
    window.appInitFunctions.push(setupIcityListeners);
} else {
    window.appInitFunctions = [setupIcityListeners];
}

// Append new functions for Friends feature

// Feed Selection Mode State
window.icityFeedSelectionMode = false;
window.selectedIcityFeedIds = new Set();

function switchIcityFeedTab(tab) {
    const headerWorld = document.getElementById('icity-header-world');
    const headerFriends = document.getElementById('icity-header-friends');
    
    if (tab === 'world') {
        if (headerWorld) {
            headerWorld.style.color = '#000';
            headerWorld.style.borderBottom = '2px solid #000';
            headerWorld.dataset.active = 'true';
        }
        if (headerFriends) {
            headerFriends.style.color = '#999';
            headerFriends.style.borderBottom = 'none';
            headerFriends.dataset.active = 'false';
        }
        renderIcityWorld();
    } else {
        if (headerFriends) {
            headerFriends.style.color = '#000';
            headerFriends.style.borderBottom = '2px solid #000';
            headerFriends.dataset.active = 'true';
        }
        if (headerWorld) {
            headerWorld.style.color = '#999';
            headerWorld.style.borderBottom = 'none';
            headerWorld.dataset.active = 'false';
        }
        renderIcityFriends();
    }
}
window.switchIcityFeedTab = switchIcityFeedTab;

function updateIcityFeedHeader() {
    const header = document.querySelector('#icity-tab-content-world .app-header');
    if (!header) return;
    
    if (window.icityFeedSelectionMode) {
        const count = window.selectedIcityFeedIds.size;
        // Selection Mode Header
        header.innerHTML = `
            <button onclick="window.exitIcityFeedSelectionMode()" style="position: absolute; left: 15px; background: none; border: none; font-size: 16px; color: #333; cursor: pointer;">取消</button>
            <div style="font-weight: bold; font-size: 16px;">已选择 ${count}</div>
            <button onclick="window.deleteSelectedIcityFeedItems()" style="position: absolute; right: 15px; background: none; border: none; font-size: 16px; color: ${count > 0 ? '#FF3B30' : '#ccc'}; cursor: pointer;" ${count === 0 ? 'disabled' : ''}>删除</button>
        `;
    } else {
        // Restore Default Header
        header.innerHTML = `
            <div style="display: flex; gap: 20px; font-size: 16px;">
                <span id="icity-header-world" style="color: #999; border-bottom: none; padding-bottom: 5px; cursor: pointer;" onclick="window.switchIcityFeedTab('world')">世界</span>
                <span id="icity-header-friends" style="font-weight: bold; color: #000; cursor: pointer; border-bottom: 2px solid #000; padding-bottom: 5px;" data-active="true" onclick="window.switchIcityFeedTab('friends')">朋友</span>
                <span style="color: #999;">@ 通知</span>
                <span style="color: #999;">♡ 喜欢</span>
            </div>
            <button id="icity-world-generate-btn" style="position: absolute; right: 15px; background: none; border: none; color: #007AFF; font-size: 16px;" onclick="window.handleGenerateIcityFriends()"><i class="fas fa-magic"></i></button>
        `;
    }
}

function renderIcityFriends() {
    const list = document.getElementById('icity-world-list');
    if (!list) return;
    
    // Update header for selection mode if needed
    updateIcityFeedHeader();

    // Ensure state exists
    if (!window.iphoneSimState.icityFriendsPosts) {
        window.iphoneSimState.icityFriendsPosts = [];
    }
    
    const posts = window.iphoneSimState.icityFriendsPosts;
    
    if (posts.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 50px; color: #999;">暂无朋友动态，点击右上角生成</div>';
        return;
    }
    
    list.innerHTML = '';
    
    posts.forEach(post => {
        const item = document.createElement('div');
        item.style.backgroundColor = '#fff';
        item.style.padding = '15px';
        item.style.borderBottom = '1px solid #f0f0f0';
        item.style.cursor = 'pointer';
        item.style.position = 'relative';

        // Selection mode style adjustment
        if (window.icityFeedSelectionMode) {
            item.style.paddingLeft = '50px';
        }

        item.onclick = (e) => {
            if (window.icityFeedSelectionMode) {
                toggleIcityFeedSelection(post.id);
                return;
            }
            if (e.target.closest('.fa-heart') || e.target.closest('.fa-comment') || e.target.closest('.fa-ellipsis-v') || e.target.closest('[id^="icity-feed-menu"]')) return;
            openIcityDiaryDetail(post.id, 'friends');
        };
        
        // Lookup dynamic contact info
        let displayName = post.name;
        let displayHandle = post.handle;
        let displayAvatar = post.avatar;
        
        let contact = null;
        if (post.contactId) {
            contact = window.iphoneSimState.contacts.find(c => c.id === post.contactId);
        } else {
            // Fallback: try to find by name match (legacy posts)
            contact = window.iphoneSimState.contacts.find(c => c.name === post.name);
        }

        if (contact) {
            if (contact.icityData) {
                if (contact.icityData.name) displayName = contact.icityData.name;
                if (contact.icityData.handle) displayHandle = contact.icityData.handle;
                if (contact.icityData.avatar) displayAvatar = contact.icityData.avatar;
            }
        }

        // Random relative time strings or actual time
        let timeStr = '刚刚';
        if (typeof post.time === 'number') {
             const seconds = Math.floor((Date.now() - post.time) / 1000);
             if (seconds < 60) timeStr = `${Math.max(1, seconds)}秒钟前`;
             else if (seconds < 3600) timeStr = `${Math.floor(seconds/60)}分钟前`;
             else timeStr = '今天';
        } else {
             timeStr = post.time || '刚刚';
        }
        
        // Use contact avatar if available
        let avatarStyle = 'background: #ccc;';
        if (displayAvatar) {
            avatarStyle = `background-image: url('${displayAvatar}'); background-size: cover; background-position: center;`;
        }

        // Checkbox HTML
        let checkboxHtml = '';
        if (window.icityFeedSelectionMode) {
            const isSelected = window.selectedIcityFeedIds.has(post.id);
            checkboxHtml = `
                <div style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${isSelected ? '#007AFF' : '#ccc'}; background: ${isSelected ? '#007AFF' : 'transparent'}; display: flex; align-items: center; justify-content: center; z-index: 10;">
                    ${isSelected ? '<i class="fas fa-check" style="color: #fff; font-size: 14px;"></i>' : ''}
                </div>
            `;
        }

        item.innerHTML = `
            ${checkboxHtml}
            <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ${avatarStyle}">
                    ${!displayAvatar ? '<i class="fas fa-user" style="color: #fff; font-size: 20px;"></i>' : ''}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 15px; color: #333;">${displayName}</div>
                    <div style="font-size: 12px; color: #999;">${displayHandle || ''}</div>
                </div>
            </div>
            <div style="font-size: 15px; color: #333; line-height: 1.6; margin-bottom: 10px; white-space: pre-wrap;">${post.content}</div>
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 20px; color: #ccc; font-size: 13px;">
                <i class="far fa-heart"></i>
                <i class="far fa-comment"></i>
                <div style="display: flex; align-items: center; gap: 5px;"><i class="far fa-clock"></i> ${timeStr}</div>
                <div style="position: relative;">
                    <i class="fas fa-ellipsis-v" style="cursor: pointer; padding: 5px;" onclick="event.stopPropagation(); toggleIcityFeedMenu(this, ${post.id})"></i>
                    <div id="icity-feed-menu-${post.id}" class="hidden" style="position: absolute; right: 0; bottom: 25px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 4px; padding: 5px 0; min-width: 100px; z-index: 10;">
                        <div onclick="event.stopPropagation(); enterIcityFeedSelectionMode(${post.id})" style="padding: 8px 15px; color: #333; font-size: 14px; cursor: pointer; text-align: left;">多选</div>
                        <div onclick="event.stopPropagation(); deleteIcityFeedItem(${post.id})" style="padding: 8px 15px; color: #FF3B30; font-size: 14px; cursor: pointer; text-align: left; border-top: 1px solid #f0f0f0;">删除</div>
                    </div>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

function toggleIcityFeedMenu(btn, id) {
    // Close all others
    document.querySelectorAll('[id^="icity-feed-menu-"]').forEach(el => {
        if (el.id !== `icity-feed-menu-${id}`) el.classList.add('hidden');
    });
    
    const menu = document.getElementById(`icity-feed-menu-${id}`);
    if (menu) {
        menu.classList.toggle('hidden');
        
        // Close on click outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== btn) {
                menu.classList.add('hidden');
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }
}

function deleteIcityFeedItem(id) {
    if (confirm('确定删除这条动态吗？')) {
        window.iphoneSimState.icityFriendsPosts = window.iphoneSimState.icityFriendsPosts.filter(p => p.id !== id);
        saveConfig();
        renderIcityFriends();
    }
}

function enterIcityFeedSelectionMode(initialId) {
    if (window.icityFeedSelectionMode) return;
    
    window.icityFeedSelectionMode = true;
    window.selectedIcityFeedIds = new Set();
    if (initialId) window.selectedIcityFeedIds.add(initialId);
    
    // Close menus
    document.querySelectorAll('[id^="icity-feed-menu-"]').forEach(el => el.classList.add('hidden'));
    
    renderIcityFriends();
}

function exitIcityFeedSelectionMode() {
    window.icityFeedSelectionMode = false;
    window.selectedIcityFeedIds = new Set();
    renderIcityFriends();
}

function toggleIcityFeedSelection(id) {
    if (window.selectedIcityFeedIds.has(id)) {
        window.selectedIcityFeedIds.delete(id);
    } else {
        window.selectedIcityFeedIds.add(id);
    }
    renderIcityFriends(); // Trigger re-render to update header count and checkboxes
}

function deleteSelectedIcityFeedItems() {
    if (window.selectedIcityFeedIds.size === 0) return;
    
    if (!confirm(`确定删除这 ${window.selectedIcityFeedIds.size} 条动态吗？`)) return;
    
    window.iphoneSimState.icityFriendsPosts = window.iphoneSimState.icityFriendsPosts.filter(
        p => !window.selectedIcityFeedIds.has(p.id)
    );
    
    saveConfig();
    exitIcityFeedSelectionMode();
}

// Export new functions to window
window.switchIcityFeedTab = switchIcityFeedTab;
window.handleGenerateIcityFriends = handleGenerateIcityFriends;
window.enterIcityFeedSelectionMode = enterIcityFeedSelectionMode;
window.exitIcityFeedSelectionMode = exitIcityFeedSelectionMode;
window.toggleIcityFeedSelection = toggleIcityFeedSelection;
window.deleteSelectedIcityFeedItems = deleteSelectedIcityFeedItems;
window.deleteIcityFeedItem = deleteIcityFeedItem;
window.toggleIcityFeedMenu = toggleIcityFeedMenu;

async function handleGenerateIcityFriends() {
    const btn = document.getElementById('icity-world-generate-btn');
    if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const linkedIds = window.iphoneSimState.icityProfile.linkedContactIds || [];
        // Support legacy single ID
        if (linkedIds.length === 0 && window.iphoneSimState.icityProfile.linkedContactId) {
            linkedIds.push(window.iphoneSimState.icityProfile.linkedContactId);
        }

        if (linkedIds.length === 0) {
            alert('请先在设置中关联联系人');
            if (btn) btn.innerHTML = '<i class="fas fa-magic"></i>';
            return;
        }

        const contacts = window.iphoneSimState.contacts.filter(c => linkedIds.includes(c.id));
        if (contacts.length === 0) {
            alert('未找到关联的联系人信息');
            if (btn) btn.innerHTML = '<i class="fas fa-magic"></i>';
            return;
        }

        const posts = await callAiForFriendsPosts(contacts);
        if (posts && posts.length > 0) {
            // Prepend new posts
            if (!window.iphoneSimState.icityFriendsPosts) window.iphoneSimState.icityFriendsPosts = [];
            window.iphoneSimState.icityFriendsPosts = [...posts, ...window.iphoneSimState.icityFriendsPosts];
            saveConfig();
            renderIcityFriends();
        }
    } catch (e) {
        console.error('Failed to generate friends posts:', e);
        alert('生成失败，请检查 API 设置');
    } finally {
        if (btn) btn.innerHTML = '<i class="fas fa-magic"></i>';
    }
}

async function callAiForFriendsPosts(contacts) {
    const postsData = [];
    
    for (const contact of contacts) {
        // Use custom iCity name if available for the prompt
        const displayName = (contact.icityData && contact.icityData.name) ? contact.icityData.name : contact.name;

        // Chat History
        const history = window.iphoneSimState.chatHistory && window.iphoneSimState.chatHistory[contact.id] ? window.iphoneSimState.chatHistory[contact.id].slice(-10) : [];
        const chatContext = history.map(m => `${m.role === 'user' ? '用户' : '我'}: ${m.content}`).join('\n');
        
        // Memories
        const memories = window.iphoneSimState.memories ? window.iphoneSimState.memories.filter(m => m.contactId === contact.id).slice(-5) : [];
        const memoryContext = memories.map(m => m.content).join('\n');
        
        // Worldbook (Linked in iCity settings)
        let wbContext = '';
        if (window.iphoneSimState.icityProfile.linkedWbId) {
             const entries = window.iphoneSimState.worldbook ? window.iphoneSimState.worldbook.filter(e => e.categoryId == window.iphoneSimState.icityProfile.linkedWbId && e.enabled) : [];
             wbContext = entries.map(e => e.content).join('\n').slice(0, 800); // Limit length
        }
        
        // Contact's Linked Worldbooks (from Chat Settings)
        if (contact.linkedWbCategories && contact.linkedWbCategories.length > 0) {
             const entries = window.iphoneSimState.worldbook ? window.iphoneSimState.worldbook.filter(e => contact.linkedWbCategories.includes(e.categoryId) && e.enabled) : [];
             const contactWb = entries.map(e => e.content).join('\n').slice(0, 500);
             if (contactWb) wbContext += '\n' + contactWb;
        }
        
        postsData.push({
            name: displayName,
            originalName: contact.name,
            persona: contact.persona || '无',
            chat: chatContext,
            memory: memoryContext,
            wb: wbContext
        });
    }

    const contextStr = postsData.map(d => `
【角色: ${d.name}】
人设: ${d.persona}
最近聊天片段:
${d.chat}
重要记忆:
${d.memory}
世界观背景:
${d.wb}
`).join('\n--------------------------------\n');

    const prompt = `请基于以下角色的详细上下文，为他们生成一些 iCity 动态（类似日记、感悟、emo时刻）。
    
${contextStr}

要求：
1. 为每个角色生成 1 条内容。
2. **风格要求**：不要写成普通的社交动态。要是日记、心理活动、感悟、或者emo时刻。可以是短句，也可以是长文。要体现角色的内心世界。
3. **结合上下文**：必须深度结合该角色的【人设】、【最近聊天】、【记忆】和【世界观背景】。
   - 如果最近和用户聊了某事，可以在日记中体现对那件事的看法。
   - 如果有特定的世界观（如末世、古代等），日记内容要符合该世界观。
   - 如果有记忆，可以呼应记忆中的事件。
4. 严格返回 JSON 数组格式。

格式示例：
[
    {
        "name": "角色姓名",
        "content": "日记正文内容...",
        "likes": 5,
        "comments": 0
    }
]`;

    const messages = [{ role: 'user', content: prompt }];
    const content = await safeCallAiApi(messages);
    
    // Parse
    try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return data.map((item, index) => {
                // Find contact by matching either custom name or original name
                // Note: contacts is the list of linked contact objects
                // item.name should match what we sent in prompt (displayName)
                const contact = contacts.find(c => {
                    const customName = (c.icityData && c.icityData.name) ? c.icityData.name : c.name;
                    return customName === item.name || c.name === item.name;
                });

                let name = item.name;
                let handle = '@user';
                let avatar = '';
                
                if (contact) {
                    handle = (contact.icityData && contact.icityData.handle) ? contact.icityData.handle : `@User_${contact.id.toString().substring(0, 4)}`;
                    avatar = (contact.icityData && contact.icityData.avatar) ? contact.icityData.avatar : contact.avatar;
                }

                return {
                    id: Date.now() + index,
                    contactId: contact ? contact.id : null,
                    name: name,
                    handle: handle,
                    avatar: avatar,
                    content: item.content,
                    time: Date.now(),
                    likes: item.likes || 0,
                    comments: item.comments || 0
                };
            });
        }
        throw new Error("No JSON found");
    } catch (e) {
        console.error("Parse error", e);
        return [];
    }
}

window.renderIcityFriends = renderIcityFriends;
window.handleGenerateIcityFriends = handleGenerateIcityFriends;

// Calendar Functions
function renderIcityCalendar(year = 2026) {
    const calendarScreen = document.getElementById('icity-calendar-screen');
    if (!calendarScreen) return;

    // Update Year Selector
    const yearsContainer = document.getElementById('icity-calendar-years');
    if (yearsContainer) {
        yearsContainer.innerHTML = '';
        const years = [2026];
        years.forEach(y => {
            const span = document.createElement('span');
            span.textContent = y;
            if (y === year) {
                span.style.cssText = 'color: #fff; background: #7C9BF8; padding: 2px 12px; border-radius: 12px; cursor: default;';
            } else {
                span.style.cssText = 'cursor: pointer;';
                span.onclick = () => renderIcityCalendar(y);
            }
            yearsContainer.appendChild(span);
        });
    }

    // Filter diaries for this year
    const diaries = window.iphoneSimState.icityDiaries || [];
    const yearDiaries = diaries.filter(d => new Date(d.time).getFullYear() === year);
    
    // Stats
    const distinctDays = new Set(yearDiaries.map(d => {
        const date = new Date(d.time);
        return `${date.getMonth()}-${date.getDate()}`;
    })).size;
    
    const daysEl = document.getElementById('icity-calendar-days');
    if (daysEl) daysEl.textContent = distinctDays;
    const countEl = document.getElementById('icity-calendar-count');
    if (countEl) countEl.textContent = yearDiaries.length;

    // Heatmap
    renderIcityHeatmap(year, yearDiaries);

    // Monthly List
    renderIcityMonthlyList(year, yearDiaries);
}

function renderIcityHeatmap(year, diaries) {
    const container = document.getElementById('icity-calendar-heatmap');
    if (!container) return;
    container.innerHTML = '';
    
    const diaryDates = new Set(diaries.map(d => {
        const date = new Date(d.time);
        return `${date.getMonth()}-${date.getDate()}`;
    }));

    const today = new Date(); // Uses system/simulated time
    
    for (let m = 0; m < 12; m++) {
        for (let d = 1; d <= 31; d++) {
            const el = document.createElement('div');
            el.style.width = '100%';
            el.style.aspectRatio = '1/1';
            
            // Check validity
            // Note: Date(2026, 1, 30) -> March 2
            const date = new Date(year, m, d);
            if (date.getMonth() !== m) {
                el.style.background = 'transparent'; // Invalid date
            } else {
                el.style.background = '#f0f0f0';
                el.style.borderRadius = '1px';
                
                const key = `${m}-${d}`;
                
                // Today check (Yellow)
                if (year === today.getFullYear() && m === today.getMonth() && d === today.getDate()) {
                    el.style.background = '#FFCC00';
                }
                
                if (diaryDates.has(key)) {
                    el.style.background = '#7C9BF8'; // Blue for diary
                } else if (year === today.getFullYear() && m === today.getMonth() && d === today.getDate()) {
                    el.style.background = '#FFCC00'; // Yellow for today (no diary)
                }
            }
            container.appendChild(el);
        }
    }
}

function renderIcityMonthlyList(year, diaries) {
    const container = document.getElementById('icity-calendar-months');
    if (!container) return;
    container.innerHTML = '';

    // Weekday Header
    const weekHeader = document.createElement('div');
    weekHeader.style.display = 'flex';
    weekHeader.style.gap = '10px';
    weekHeader.style.marginBottom = '10px';
    
    const spacer = document.createElement('div');
    spacer.style.width = '50px';
    spacer.style.flexShrink = '0';
    weekHeader.appendChild(spacer);
    
    const weekGrid = document.createElement('div');
    weekGrid.style.flex = '1';
    weekGrid.style.display = 'grid';
    weekGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    weekGrid.style.gap = '5px';
    weekGrid.style.textAlign = 'center';
    weekGrid.style.fontSize = '12px';
    weekGrid.style.color = '#ccc';
    
    ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].forEach(d => {
        const el = document.createElement('div');
        el.textContent = d;
        weekGrid.appendChild(el);
    });
    weekHeader.appendChild(weekGrid);
    container.appendChild(weekHeader);

    const today = new Date();
    const diaryDates = new Set(diaries.map(d => {
        const date = new Date(d.time);
        return `${date.getMonth()}-${date.getDate()}`;
    }));

    let startM = 11;
    if (year === today.getFullYear()) startM = today.getMonth();
    else if (year > today.getFullYear()) startM = -1;

    // Months reverse order
    for (let m = startM; m >= 0; m--) {
        const monthDiv = document.createElement('div');
        monthDiv.style.marginBottom = '20px';
        
        const monthNameEn = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][m];
        const monthNameCn = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"][m];
        
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '10px';
        
        const header = document.createElement('div');
        header.style.width = '50px';
        header.style.textAlign = 'right';
        header.style.paddingTop = '0px';
        header.innerHTML = `
            <div style="font-weight: bold; font-size: 14px;">${monthNameEn}</div>
            <div style="font-weight: bold; font-size: 12px;">${monthNameCn}</div>
            <div style="font-size: 10px; color: #999;">${year}</div>
            <div style="margin-top: 5px; font-size: 10px; color: #999; background: #f0f0f0; display: inline-block; padding: 2px 5px; border-radius: 4px;">
                ${getDiariesCountInMonth(diaries, m)}天
            </div>
        `;
        
        const grid = document.createElement('div');
        grid.style.flex = '1';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        grid.style.gap = '10px';
        grid.style.rowGap = '15px';
        grid.style.marginTop = '10px';
        
        // Days
        let firstDay = new Date(year, m, 1).getDay(); // 0 = Sun
        firstDay = (firstDay + 6) % 7; // 0 = Mon
        
        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(document.createElement('div'));
        }
        
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dayEl = document.createElement('div');
            dayEl.style.aspectRatio = '1/1';
            dayEl.style.display = 'flex';
            dayEl.style.alignItems = 'center';
            dayEl.style.justifyContent = 'center';
            dayEl.style.borderRadius = '4px';
            dayEl.style.fontSize = '14px';
            dayEl.style.color = '#666';
            dayEl.style.background = '#f9f9f9'; // Default box
            dayEl.textContent = d;
            
            const key = `${m}-${d}`;
            if (diaryDates.has(key)) {
                dayEl.style.background = '#7C9BF8'; // Blue
                dayEl.style.color = '#fff';
            }
            
            // Today Highlight
            if (year === today.getFullYear() && m === today.getMonth() && d === today.getDate()) {
                dayEl.style.position = 'relative';
                const line = document.createElement('div');
                line.style.position = 'absolute';
                line.style.bottom = '2px';
                line.style.width = '15px';
                line.style.height = '2px';
                line.style.background = '#FFCC00';
                dayEl.appendChild(line);
            }
            
            grid.appendChild(dayEl);
        }
        
        wrapper.appendChild(header);
        wrapper.appendChild(grid);
        monthDiv.appendChild(wrapper);
        container.appendChild(monthDiv);
    }
}

function getDiariesCountInMonth(diaries, month) {
    return new Set(diaries.filter(d => new Date(d.time).getMonth() === month).map(d => new Date(d.time).getDate())).size;
}

// Calendar Functions
function renderIcityCalendar(year = 2026) {
    const calendarScreen = document.getElementById('icity-calendar-screen');
    if (!calendarScreen) return;

    // Update Year Selector
    const yearsContainer = document.getElementById('icity-calendar-years');
    if (yearsContainer) {
        yearsContainer.innerHTML = '';
        const years = [2026];
        years.forEach(y => {
            const span = document.createElement('span');
            span.textContent = y;
            if (y === year) {
                span.style.cssText = 'color: #fff; background: #7C9BF8; padding: 2px 12px; border-radius: 12px; cursor: default;';
            } else {
                span.style.cssText = 'cursor: pointer;';
                span.onclick = () => renderIcityCalendar(y);
            }
            yearsContainer.appendChild(span);
        });
    }

    // Filter diaries for this year
    const diaries = window.iphoneSimState.icityDiaries || [];
    const yearDiaries = diaries.filter(d => new Date(d.time).getFullYear() === year);
    
    // Stats
    const distinctDays = new Set(yearDiaries.map(d => {
        const date = new Date(d.time);
        return `${date.getMonth()}-${date.getDate()}`;
    })).size;
    
    const daysEl = document.getElementById('icity-calendar-days');
    if (daysEl) daysEl.textContent = distinctDays;
    const countEl = document.getElementById('icity-calendar-count');
    if (countEl) countEl.textContent = yearDiaries.length;

    // Heatmap
    renderIcityHeatmap(year, yearDiaries);

    // Monthly List
    renderIcityMonthlyList(year, yearDiaries);
}

function renderIcityHeatmap(year, diaries) {
    const container = document.getElementById('icity-calendar-heatmap');
    if (!container) return;
    container.innerHTML = '';
    
    const diaryDates = new Set(diaries.map(d => {
        const date = new Date(d.time);
        return `${date.getMonth()}-${date.getDate()}`;
    }));

    const today = new Date(); // Uses system/simulated time
    // In ACT MODE, environment time is 2026/2/1.
    // If we rely on system Date(), it might be 2026.
    
    for (let m = 0; m < 12; m++) {
        for (let d = 1; d <= 31; d++) {
            const el = document.createElement('div');
            el.style.width = '100%';
            el.style.aspectRatio = '1/1';
            
            // Check validity
            // Note: Date(2026, 1, 30) -> March 2
            const date = new Date(year, m, d);
            if (date.getMonth() !== m) {
                el.style.background = 'transparent'; // Invalid date
            } else {
                el.style.background = '#f0f0f0';
                el.style.borderRadius = '1px';
                
                const key = `${m}-${d}`;
                
                // Today check (Yellow)
                if (year === today.getFullYear() && m === today.getMonth() && d === today.getDate()) {
                    el.style.background = '#FFCC00';
                }
                // Diary check (Blue) - overrides today? Or prioritized?
                // User said: "When user published text on a day ... square will turn blue."
                // "Today ... square is yellow".
                // If I published today, is it blue or yellow?
                // Usually "Today" is status, "Diary" is record.
                // If I wrote today, maybe it should be Blue to indicate record?
                // Or maybe both?
                // Let's assume Blue takes precedence if recorded, or Yellow if just today?
                // User: "Today ... top little square is yellow".
                // Let's keep Yellow for today regardless of diary, or Blue if diary?
                // Let's make Blue overwrite Yellow if diary exists, as "Record" is more important visualization in heatmap.
                // Or maybe the user implies "Today is yellow" means the cursor.
                
                if (diaryDates.has(key)) {
                    el.style.background = '#7C9BF8'; // Blue for diary
                } else if (year === today.getFullYear() && m === today.getMonth() && d === today.getDate()) {
                    el.style.background = '#FFCC00'; // Yellow for today (no diary)
                }
            }
            container.appendChild(el);
        }
    }
}

function renderIcityMonthlyList(year, diaries) {
    const container = document.getElementById('icity-calendar-months');
    if (!container) return;
    container.innerHTML = '';

    // Weekday Header
    const weekHeader = document.createElement('div');
    weekHeader.style.display = 'flex';
    weekHeader.style.gap = '10px';
    weekHeader.style.marginBottom = '10px';
    
    const spacer = document.createElement('div');
    spacer.style.width = '50px';
    weekHeader.appendChild(spacer);
    
    const weekGrid = document.createElement('div');
    weekGrid.style.flex = '1';
    weekGrid.style.display = 'grid';
    weekGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    weekGrid.style.gap = '5px';
    weekGrid.style.textAlign = 'center';
    weekGrid.style.fontSize = '12px';
    weekGrid.style.color = '#ccc';
    
    ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].forEach(d => {
        const el = document.createElement('div');
        el.textContent = d;
        weekGrid.appendChild(el);
    });
    weekHeader.appendChild(weekGrid);
    container.appendChild(weekHeader);

    const today = new Date();
    const diaryDates = new Set(diaries.map(d => {
        const date = new Date(d.time);
        return `${date.getMonth()}-${date.getDate()}`;
    }));

    let startM = 11;
    if (year === today.getFullYear()) startM = today.getMonth();
    else if (year > today.getFullYear()) startM = -1;

    // Months reverse order
    for (let m = startM; m >= 0; m--) {
        const monthDiv = document.createElement('div');
        monthDiv.style.marginBottom = '20px';
        
        const monthNameEn = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][m];
        const monthNameCn = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"][m];
        
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '10px';
        
        const header = document.createElement('div');
        header.style.width = '50px';
        header.style.flexShrink = '0';
        header.style.textAlign = 'right';
        header.style.paddingTop = '0px';
        header.innerHTML = `
            <div style="font-weight: bold; font-size: 14px;">${monthNameEn}</div>
            <div style="font-weight: bold; font-size: 12px;">${monthNameCn}</div>
            <div style="font-size: 10px; color: #999;">${year}</div>
            <div style="margin-top: 5px; font-size: 10px; color: #999; background: #f0f0f0; display: inline-block; padding: 2px 5px; border-radius: 4px;">
                ${getDiariesCountInMonth(diaries, m)}天
            </div>
        `;
        
        const grid = document.createElement('div');
        grid.style.flex = '1';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        grid.style.gap = '5px';
        
        // Days
        let firstDay = new Date(year, m, 1).getDay(); // 0 = Sun
        firstDay = (firstDay + 6) % 7; // 0 = Mon
        
        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(document.createElement('div'));
        }
        
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dayEl = document.createElement('div');
            dayEl.style.aspectRatio = '1/1';
            dayEl.style.display = 'flex';
            dayEl.style.alignItems = 'center';
            dayEl.style.justifyContent = 'center';
            dayEl.style.borderRadius = '4px';
            dayEl.style.fontSize = '14px';
            dayEl.style.color = '#666';
            dayEl.style.background = '#f9f9f9'; // Default box
            dayEl.textContent = d;
            
            const key = `${m}-${d}`;
            if (diaryDates.has(key)) {
                dayEl.style.background = '#7C9BF8'; // Blue
                dayEl.style.color = '#fff';
            }
            
            // Today Highlight
            if (year === today.getFullYear() && m === today.getMonth() && d === today.getDate()) {
                dayEl.style.position = 'relative';
                const line = document.createElement('div');
                line.style.position = 'absolute';
                line.style.bottom = '2px';
                line.style.width = '15px';
                line.style.height = '2px';
                line.style.background = '#FFCC00';
                dayEl.appendChild(line);
            }
            
            grid.appendChild(dayEl);
        }
        
        wrapper.appendChild(header);
        wrapper.appendChild(grid);
        monthDiv.appendChild(wrapper);
        container.appendChild(monthDiv);
    }
}

function getDiariesCountInMonth(diaries, month) {
    return new Set(diaries.filter(d => new Date(d.time).getMonth() === month).map(d => new Date(d.time).getDate())).size;
}
