/* ============================================
   ============================================
   ОБЩИЕ ДАННЫЕ И ПЕРЕМЕННЫЕ
   ============================================
   ============================================ */

let users = JSON.parse(localStorage.getItem('users')) || [];
let ads = JSON.parse(localStorage.getItem('ads')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

/* ============================================
   ============================================
   ОБЩИЕ ФУНКЦИИ (для всех страниц)
   ============================================
   ============================================ */

function save() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('ads', JSON.stringify(ads));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function requireAuth() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    if (confirm('Выйти из аккаунта?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showNotification('До свидания!', 'info', 'Выход выполнен');
        window.location.href = 'index.html';
    }
}

function updateAuthLinks() {
    const authLinks = document.getElementById('authLinks');
    if (!authLinks) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        authLinks.innerHTML = `
            <a href="add.html" class="button">Добавить</a>
            <a href="profile.html">Профиль</a>
            <a href="#" onclick="logout()">Выйти (${currentUser.username})</a>
        `;
    } else {
        authLinks.innerHTML = `
            <a href="login.html">Вход</a>
            <a href="register.html">Регистрация</a>
        `;
    }
}

function showNotification(message, type = 'info', title = '') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const config = {
        success: { icon: '✅', defaultTitle: 'Успешно!' },
        error: { icon: '❌', defaultTitle: 'Ошибка!' },
        info: { icon: 'ℹ️', defaultTitle: 'Информация' },
        warning: { icon: '⚠️', defaultTitle: 'Внимание!' }
    };
    
    const cfg = config[type] || config.info;
    const finalTitle = title || cfg.defaultTitle;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${cfg.icon}</div>
        <div class="toast-content">
            <div class="toast-title">${finalTitle}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 300);
        }
    }, 3000);
    
    toast.addEventListener('click', (e) => {
        if (e.target !== toast.querySelector('.toast-close')) {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 300);
        }
    });
}

function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function getWordForCount(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'объявление';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'объявления';
    return 'объявлений';
}

function goToCategory(category) {
    window.location.href = `category.html?cat=${category}`;
}

function viewAd(id) {
    window.location.href = `ad.html?id=${id}`;
}

/* ============================================
   ============================================
   ФУНКЦИИ АВТОРИЗАЦИИ (register.html, login.html)
   ============================================
   ============================================ */

// Регистрация нового пользователя
function register() {
    const username = document.getElementById('username')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value?.trim();
    const password2 = document.getElementById('passwordtwo')?.value?.trim();

    if (!username || !email || !password || !password2) {
        showNotification('Заполните все поля', 'error', 'Ошибка регистрации');
        return;
    }

    if (password !== password2) {
        showNotification('Пароли не совпадают', 'error', 'Ошибка регистрации');
        return;
    }

    if (password.length < 6) {
        showNotification('Пароль должен быть не менее 6 символов', 'error', 'Ошибка регистрации');
        return;
    }

    if (users.find(u => u.username === username)) {
        showNotification('Пользователь уже существует', 'error', 'Ошибка регистрации');
        return;
    }

    // Генерируем код активации (6 символов)
    const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = {
        id: Date.now(),
        username,
        email,
        password,
        registeredAt: new Date().toLocaleString('ru'),
        activated: false,
        activationCode: activationCode
    };

    users.push(user);
    save(); // сохраняем в localStorage

    // Показываем код активации (в реальном проекте отправили бы на email)
    showNotification(`Ваш код активации: ${activationCode}`, 'info', 'Подтверждение регистрации');
    
    // Перенаправляем на страницу активации
    // Вместо window.location.href = 'activate.html';
    window.location.href = `activate.html?code=${activationCode}`;
}
// Активация аккаунта
function activateAccount() {
    const code = document.getElementById('activationCode')?.value?.trim().toUpperCase();
    if (!code) {
        showNotification('Введите код активации', 'error', 'Ошибка');
        return;
    }

    // Ищем пользователя с таким кодом, который ещё не активирован
    const user = users.find(u => u.activationCode === code && !u.activated);
    if (!user) {
        showNotification('Неверный код активации или аккаунт уже активирован', 'error', 'Ошибка');
        return;
    }

    // Активируем пользователя
    user.activated = true;
    delete user.activationCode; // удаляем код, он больше не нужен
    save();

    showNotification('Аккаунт успешно активирован! Теперь вы можете войти', 'success', 'Поздравляем!');
    window.location.href = 'login.html';
}

function login() {
    const username = document.getElementById('loginUser')?.value?.trim();
    const password = document.getElementById('loginPass')?.value?.trim();

    if (!username || !password) {
        showNotification('Заполните все поля', 'error', 'Ошибка входа');
        return;
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        showNotification('Неверное имя пользователя или пароль', 'error', 'Ошибка входа');
        return;
    }

    // Проверка активации
    if (!user.activated) {
        showNotification('Аккаунт не активирован. Введите код активации.', 'warning', 'Требуется активация');
        window.location.href = 'activate.html';
        return;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification(`Добро пожаловать, ${user.username}!`, 'success', 'Вход выполнен');
    window.location.href = 'index.html';
}

/* ============================================
   ============================================
   ДАННЫЕ ДЛЯ ГЛАВНОЙ И КАТЕГОРИЙ
   ============================================
   ============================================ */

const categories = [
    { name: "Все", icon: "📦", key: "all" },
    { name: "Электроника", icon: "📱", key: "Электроника" },
    { name: "Недвижимость", icon: "🏠", key: "Недвижимость" },
    { name: "Транспорт", icon: "🚗", key: "Транспорт" },
    { name: "Работа", icon: "💼", key: "Работа" },
    { name: "Услуги", icon: "🔧", key: "Услуги" },
    { name: "Спорт", icon: "⚽", key: "Спорт" },
    { name: "Одежда", icon: "👕", key: "Одежда" },
    { name: "Другое", icon: "📦", key: "Другое" }
];

const categoryIcons = {
    "Электроника": "📱",
    "Недвижимость": "🏠",
    "Транспорт": "🚗",
    "Работа": "💼",
    "Услуги": "🔧",
    "Спорт": "⚽",
    "Одежда": "👕",
    "Другое": "📦"
};

/* ============================================
   ============================================
   ФУНКЦИИ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ (index.html)
   ============================================
   ============================================ */

let currentPage = 1;
const PER_PAGE = 9;

function renderCategoriesGrid() {
    const allAds = JSON.parse(localStorage.getItem('ads')) || [];
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => {
        let count = 0;
        if (cat.key === 'all') {
            count = allAds.length;
        } else {
            count = allAds.filter(ad => ad.category === cat.key).length;
        }
        return `
            <div class="category-chip" onclick="goToCategory('${cat.key}')">
                <div class="category-chip-icon">${cat.icon}</div>
                <div class="category-chip-name">${cat.name}</div>
                <div class="category-chip-count">${count}</div>
            </div>
        `;
    }).join('');
}

function loadAds() {
    const allAds = JSON.parse(localStorage.getItem('ads')) || [];
    const latestAds = [...allAds].reverse();
    renderAdsGrid(latestAds, currentPage);
}

function renderAdsGrid(adsList, page) {
    const container = document.getElementById('ads');
    if (!container) return;
    
    const start = (page - 1) * PER_PAGE;
    const paginated = adsList.slice(start, start + PER_PAGE);

    if (adsList.length === 0) {
        container.innerHTML = `
            <div class="no-ads-card">
                <div class="no-ads-icon">📭</div>
                <h3>Объявлений пока нет</h3>
                <p>Будьте первым, кто добавит объявление!</p>
                <a href="add.html" class="btn-primary" style="display: inline-block; margin-top: 15px;">+ Добавить объявление</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="ads-grid">
            ${paginated.map(ad => {
                const categoryIcon = categoryIcons[ad.category] || "📦";
                return `
                    <div class="ad-card" onclick="viewAd(${ad.id})">
                        <div class="ad-image">
                            <div class="ad-category-badge">
                                <span>${categoryIcon}</span> ${ad.category || 'Без категории'}
                            </div>
                            <img src="${ad.image || 'https://via.placeholder.com/300x200'}" alt="${ad.title}">
                        </div>
                        <div class="ad-content">
                            <h3 class="ad-title">${ad.title}</h3>
                            <div class="ad-price">${ad.price || 'Цена не указана'}</div>
                            <div class="ad-meta">
                                <span>📅 ${ad.date || ''}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    renderPagination(adsList.length, page);
}

function renderPagination(total, page) {
    const pages = Math.ceil(total / PER_PAGE);
    if (pages <= 1) return;

    let html = '<div class="pagination">';
    
    if (page > 1) {
        html += `<button onclick="changePage(${page - 1})">←</button>`;
    }
    
    for (let i = 1; i <= pages; i++) {
        html += `<button onclick="changePage(${i})" ${i === page ? 'class="active"' : ''}>${i}</button>`;
    }
    
    if (page < pages) {
        html += `<button onclick="changePage(${page + 1})">→</button>`;
    }
    
    html += '</div>';
    
    const container = document.getElementById('ads');
    if (container) {
        container.innerHTML += html;
    }
}

function changePage(page) {
    currentPage = page;
    const allAds = JSON.parse(localStorage.getItem('ads')) || [];
    const latestAds = [...allAds].reverse();
    renderAdsGrid(latestAds, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function search(word) {
    const allAds = JSON.parse(localStorage.getItem('ads')) || [];
    
    if (!word.trim()) {
        currentPage = 1;
        const latestAds = [...allAds].reverse();
        renderAdsGrid(latestAds, 1);
        return;
    }
    
    const filtered = allAds.filter(a =>
        a.title.toLowerCase().includes(word.toLowerCase())
    );
    
    const filteredReversed = [...filtered].reverse();
    currentPage = 1;
    renderAdsGrid(filteredReversed, 1);
}

/* ============================================
   ============================================
   ФУНКЦИИ ДЛЯ СТРАНИЦЫ КАТЕГОРИЙ (category.html)
   ============================================
   ============================================ */

let currentCategory = "all";
let currentCategoryPage = 1;
const PER_PAGE_CATEGORY = 10;

function renderCategories() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <div class="category-item ${currentCategory === cat.key ? 'active' : ''}" onclick="selectCategory('${cat.key}')">
            <div class="category-icon">${cat.icon}</div>
            <div class="category-name">${cat.name}</div>
            <div class="category-ads-count" id="count-${cat.key}">0 объявлений</div>
        </div>
    `).join('');
    
    updateCategoriesCount();
}

function updateCategoriesCount() {
    const allAds = JSON.parse(localStorage.getItem('ads')) || [];
    
    categories.forEach(cat => {
        let count = 0;
        if (cat.key === 'all') {
            count = allAds.length;
        } else {
            count = allAds.filter(ad => ad.category === cat.key).length;
        }
        
        const countElement = document.getElementById(`count-${cat.key}`);
        if (countElement) {
            const word = getWordForCount(count);
            countElement.textContent = `${count} ${word}`;
        }
    });
}

function selectCategory(category) {
    currentCategory = category;
    currentCategoryPage = 1;
    
    document.querySelectorAll('.category-item').forEach((item, index) => {
        if (categories[index].key === category) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    const categoryName = categories.find(c => c.key === category)?.name || 'Все объявления';
    const titleElement = document.getElementById('categoryTitle');
    if (titleElement) titleElement.textContent = categoryName;
    
    loadAdsByCategory();
}

function loadAdsByCategory() {
    const allAds = JSON.parse(localStorage.getItem('ads')) || [];
    let filteredAds = [];
    
    if (currentCategory === 'all') {
        filteredAds = [...allAds];
    } else {
        filteredAds = allAds.filter(ad => ad.category === currentCategory);
    }
    
    filteredAds.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const word = getWordForCount(filteredAds.length);
    const countElement = document.getElementById('categoryCount');
    if (countElement) countElement.textContent = `Найдено ${filteredAds.length} ${word}`;
    
    renderAdsWithPagination(filteredAds, currentCategoryPage);
}

function renderAdsWithPagination(adsList, page) {
    const container = document.getElementById('ads');
    if (!container) return;
    
    const start = (page - 1) * PER_PAGE_CATEGORY;
    const paginated = adsList.slice(start, start + PER_PAGE_CATEGORY);

    if (adsList.length === 0) {
        container.innerHTML = `
            <div class="no-ads-card">
                <div class="no-ads-icon">📭</div>
                <h3>В этой категории пока нет объявлений</h3>
                <p>Будьте первым, кто добавит объявление!</p>
                <a href="add.html" class="btn-primary" style="display: inline-block; margin-top: 20px;">+ Добавить объявление</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="ads-grid">
            ${paginated.map(ad => {
                const categoryIcon = categoryIcons[ad.category] || "📦";
                return `
                    <div class="ad-card" onclick="viewAd(${ad.id})">
                        <div class="ad-image">
                            <div class="ad-category-badge">
                                <span>${categoryIcon}</span> ${ad.category || 'Без категории'}
                            </div>
                            <img src="${ad.image || 'https://via.placeholder.com/200x150'}" alt="${ad.title}">
                        </div>
                        <div class="ad-content">
                            <h3 class="ad-title">${ad.title}</h3>
                            <div class="ad-price">${ad.price || 'Цена не указана'}</div>
                            <div class="ad-meta">
                                <span>📅 ${ad.date || ''}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    renderCategoryPagination(adsList.length, page);
}

function renderCategoryPagination(total, page) {
    const pages = Math.ceil(total / PER_PAGE_CATEGORY);
    if (pages <= 1) return;

    let html = '<div class="pagination">';
    
    if (page > 1) {
        html += `<button onclick="changeCategoryPage(${page - 1})">←</button>`;
    }
    
    for (let i = 1; i <= pages; i++) {
        html += `<button onclick="changeCategoryPage(${i})" ${i === page ? 'class="active"' : ''}>${i}</button>`;
    }
    
    if (page < pages) {
        html += `<button onclick="changeCategoryPage(${page + 1})">→</button>`;
    }
    
    html += '</div>';
    
    const container = document.getElementById('ads');
    if (container) {
        container.innerHTML += html;
    }
}

function changeCategoryPage(page) {
    currentCategoryPage = page;
    loadAdsByCategory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================
   ============================================
   ФУНКЦИИ ДЛЯ СТРАНИЦЫ ПРОФИЛЯ (profile.html)
   ============================================
   ============================================ */

function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const profileData = JSON.parse(localStorage.getItem('profileData_' + currentUser.id)) || {};
    
    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = currentUser.username || 'Имя не указано';
    
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) profileEmail.textContent = currentUser.email || 'email@example.com';
    
    const profilePhone = document.getElementById('profilePhone');
    if (profilePhone) profilePhone.textContent = profileData.phone || '+7 (999) 123-45-67';
    
    const profileCity = document.getElementById('profileCity');
    if (profileCity) profileCity.textContent = profileData.city || 'Москва';
    
    const profileStatus = document.getElementById('profileStatus');
    if (profileStatus) {
        profileStatus.textContent = currentUser.registeredAt ? 'На сайте с ' + currentUser.registeredAt : 'На сайте с 2026';
    }
    
    const avatarImg = document.getElementById('avatarImg');
    if (avatarImg && profileData.avatar) {
        avatarImg.src = profileData.avatar;
    }
}

function loadUserAds() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const allAds = JSON.parse(localStorage.getItem('ads')) || [];
    const userAds = allAds.filter(ad => ad.userId === currentUser.id);
    
    displayUserAds(userAds);
}

function displayUserAds(adsList) {
    const adsGrid = document.getElementById('adsGrid');
    if (!adsGrid) return;
    
    if (adsList.length === 0) {
        adsGrid.innerHTML = `
            <div class="no-ads-card">
                <div class="no-ads-icon">📭</div>
                <h3>У вас пока нет объявлений</h3>
                <p>Нажмите "Подать объявление", чтобы создать первое объявление</p>
            </div>
        `;
        return;
    }
    
    adsGrid.innerHTML = `
        <div class="ads-grid">
            ${adsList.map(ad => createProfileAdCard(ad)).join('')}
        </div>
    `;
}

function createProfileAdCard(ad) {
    const categoryIcon = categoryIcons[ad.category] || "📦";
    return `
        <div class="ad-card" onclick="viewAd(${ad.id})">
            <div class="ad-image">
                <div class="ad-category-badge">
                    <span>${categoryIcon}</span> ${ad.category || 'Без категории'}
                </div>
                <img src="${ad.image || 'https://via.placeholder.com/200x150'}" alt="${ad.title}">
            </div>
            <div class="ad-content">
                <h3 class="ad-title">${ad.title}</h3>
                <div class="ad-price">${ad.price || 'Цена не указана'}</div>
                <div class="ad-meta">
                    <span>📅 ${ad.date || ''}</span>
                </div>
                <div class="ad-views">👁 ${ad.views || 0} просмотров</div>
                <div class="ad-actions" onclick="event.stopPropagation()">
                    <button class="ad-action" onclick="editAd(${ad.id})">✏️</button>
                    <button class="ad-action" onclick="viewAd(${ad.id})">👁️</button>
                    <button class="ad-action delete" onclick="deleteAd(${ad.id})">🗑️</button>
                </div>
            </div>
        </div>
    `;
}

function editAd(id) {
    window.location.href = `edit-ad.html?id=${id}`;
}

function deleteAd(id) {
    if (confirm('Удалить это объявление?')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let adsList = JSON.parse(localStorage.getItem('ads')) || [];
        
        const ad = adsList.find(a => a.id === id);
        if (ad && ad.userId === currentUser.id) {
            adsList = adsList.filter(a => a.id !== id);
            localStorage.setItem('ads', JSON.stringify(adsList));
            showNotification('Объявление удалено', 'success', 'Готово!');
            loadUserAds();
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    }
}

function changePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageUrl = event.target.result;
                document.getElementById('avatarImg').src = imageUrl;
                
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser) {
                    const profileData = JSON.parse(localStorage.getItem('profileData_' + currentUser.id)) || {};
                    profileData.avatar = imageUrl;
                    localStorage.setItem('profileData_' + currentUser.id, JSON.stringify(profileData));
                    showNotification('Фото обновлено!', 'success');
                }
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function editProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const profileData = JSON.parse(localStorage.getItem('profileData_' + currentUser.id)) || {};
    
    document.getElementById('editUsername').value = currentUser.username || '';
    document.getElementById('editCity').value = profileData.city || '';
    document.getElementById('editPhone').value = profileData.phone || '';
    
    document.getElementById('editProfileModal').style.display = 'block';
}

function saveProfileEdit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const newUsername = document.getElementById('editUsername').value;
    const newCity = document.getElementById('editCity').value;
    const newPhone = document.getElementById('editPhone').value;
    
    if (newUsername && newUsername !== currentUser.username) {
        currentUser.username = newUsername;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        const usersList = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = usersList.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            usersList[userIndex].username = newUsername;
            localStorage.setItem('users', JSON.stringify(usersList));
        }
    }
    
    const profileData = {
        city: newCity,
        phone: newPhone,
        avatar: JSON.parse(localStorage.getItem('profileData_' + currentUser.id))?.avatar
    };
    
    localStorage.setItem('profileData_' + currentUser.id, JSON.stringify(profileData));
    
    closeModal();
    showNotification('Профиль обновлен!', 'success');
    loadUserData();
}

function changePassword() {
    document.getElementById('passwordModal').style.display = 'block';
}

function updatePassword() {
    const oldPass = document.getElementById('oldPass').value;
    const newPass = document.getElementById('newPass').value;
    const confirmPass = document.getElementById('confirmPass').value;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser.password !== oldPass) {
        showNotification('Неверный старый пароль', 'error');
        return;
    }
    
    if (newPass.length < 6) {
        showNotification('Пароль должен быть не менее 6 символов', 'error');
        return;
    }
    
    if (newPass !== confirmPass) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    currentUser.password = newPass;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    const usersList = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = usersList.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        usersList[userIndex].password = newPass;
        localStorage.setItem('users', JSON.stringify(usersList));
    }
    
    closeModal();
    showNotification('Пароль изменен!', 'success');
}

function editPhone() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const profileData = JSON.parse(localStorage.getItem('profileData_' + currentUser.id)) || {};
    
    const newPhone = prompt('Введите новый номер телефона:', profileData.phone || '+7 (999) 123-45-67');
    if (newPhone) {
        profileData.phone = newPhone;
        localStorage.setItem('profileData_' + currentUser.id, JSON.stringify(profileData));
        loadUserData();
        showNotification('Телефон обновлен', 'success');
    }
}

function editCity() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const profileData = JSON.parse(localStorage.getItem('profileData_' + currentUser.id)) || {};
    
    const newCity = prompt('Введите ваш город:', profileData.city || 'Москва');
    if (newCity) {
        profileData.city = newCity;
        localStorage.setItem('profileData_' + currentUser.id, JSON.stringify(profileData));
        loadUserData();
        showNotification('Город обновлен', 'success');
    }
}

function deleteAccount() {
    if (confirm('ВНИМАНИЕ! Вы точно хотите удалить аккаунт? Это действие нельзя отменить!')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        const adsList = JSON.parse(localStorage.getItem('ads')) || [];
        const filteredAds = adsList.filter(ad => ad.userId !== currentUser.id);
        localStorage.setItem('ads', JSON.stringify(filteredAds));
        
        const usersList = JSON.parse(localStorage.getItem('users')) || [];
        const filteredUsers = usersList.filter(u => u.id !== currentUser.id);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        localStorage.removeItem('profileData_' + currentUser.id);
        
        logout();
        showNotification('Аккаунт удален', 'info', 'До свидания!');
    }
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = Array.from(tabs).find(tab => tab.textContent.includes(tabName));
    if (activeTab) activeTab.classList.add('active');
    
    const adsGrid = document.getElementById('adsGrid');
    if (!adsGrid) return;
    
    if (tabName === 'Мои объявления') {
        loadUserAds();
    } 
    else if (tabName === 'Избранное') {
        const favoriteAds = getFavoriteAds();
        if (favoriteAds.length === 0) {
            adsGrid.innerHTML = `
                <div class="no-ads-card">
                    <div class="no-ads-icon">🤍</div>
                    <h3>Избранных объявлений пока нет</h3>
                    <p>Нажмите "❤️ В избранное" на странице объявления, чтобы добавить его сюда</p>
                    <a href="index.html" class="btn-primary" style="display: inline-block; margin-top: 15px;">На главную</a>
                </div>
            `;
        } else {
            adsGrid.innerHTML = `
                <div class="ads-grid">
                    ${favoriteAds.map(ad => createProfileAdCard(ad)).join('')}
                </div>
            `;
        }
    }
    else if (tabName === 'История') {
        const historyAds = getHistoryAds();
        if (historyAds.length === 0) {
            adsGrid.innerHTML = `
                <div class="no-ads-card">
                    <div class="no-ads-icon">📜</div>
                    <h3>История просмотров пуста</h3>
                    <p>Просмотренные объявления будут появляться здесь</p>
                    <a href="index.html" class="btn-primary" style="display: inline-block; margin-top: 15px;">На главную</a>
                </div>
            `;
        } else {
            adsGrid.innerHTML = `
                <div class="ads-grid">
                    ${historyAds.map(ad => createProfileAdCard(ad)).join('')}
                </div>
            `;
        }
    }
}

function addNewAd() {
    window.location.href = 'add.html';
}

function closeModal() {
    const passwordModal = document.getElementById('passwordModal');
    const editProfileModal = document.getElementById('editProfileModal');
    
    if (passwordModal) passwordModal.style.display = 'none';
    if (editProfileModal) editProfileModal.style.display = 'none';
    
    const oldPass = document.getElementById('oldPass');
    const newPass = document.getElementById('newPass');
    const confirmPass = document.getElementById('confirmPass');
    
    if (oldPass) oldPass.value = '';
    if (newPass) newPass.value = '';
    if (confirmPass) confirmPass.value = '';
}

function notifications() {
    showNotification('Настройки уведомлений будут доступны скоро', 'info', 'В разработке');
}

function security() {
    showNotification('Настройки безопасности будут доступны скоро', 'info', 'В разработке');
}

/* ============================================
   ============================================
   ФУНКЦИИ ДЛЯ СТРАНИЦЫ ДОБАВЛЕНИЯ (add.html)
   ============================================
   ============================================ */

function initAddPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Необходимо войти в систему', 'warning', 'Требуется авторизация');
        window.location.href = 'login.html';
        return;
    }
    
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('input', function(e) {
            const preview = document.getElementById('preview');
            if (preview) {
                if (e.target.value) {
                    preview.src = e.target.value;
                    preview.style.display = 'block';
                } else {
                    preview.style.display = 'none';
                }
            }
        });
    }

    const form = document.getElementById('addAdForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNewAd();
        });
    }
}

function saveNewAd() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Необходимо войти в систему', 'warning', 'Требуется авторизация');
        window.location.href = 'login.html';
        return;
    }

    let adsList = JSON.parse(localStorage.getItem('ads')) || [];

    const newAd = {
        id: Date.now(),
        userId: currentUser.id,
        title: document.getElementById('title')?.value || '',
        category: document.getElementById('category')?.value || '',
        price: document.getElementById('price')?.value || '',
        description: document.getElementById('description')?.value || '',
        image: document.getElementById('image')?.value || 'https://via.placeholder.com/200x150',
        phone: document.getElementById('phone')?.value || 'Не указан',
        date: new Date().toLocaleString('ru'),
        views: 0,
        comments: [],
        rating: '0.0'
    };

    adsList.push(newAd);
    localStorage.setItem('ads', JSON.stringify(adsList));

    showNotification('Объявление успешно опубликовано!', 'success', 'Готово!');
    window.location.href = 'index.html';
}

/* ============================================
   ============================================
   ФУНКЦИИ ДЛЯ СТРАНИЦЫ ПРОСМОТРА (ad.html)
   ============================================
   ============================================ */

function loadAdDetail() {
    const adId = parseInt(getUrlParam('id'));
    const adsList = JSON.parse(localStorage.getItem('ads')) || [];
    const ad = adsList.find(a => a.id === adId);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const adDetail = document.getElementById('adDetail');
    
    if (!adDetail) return;
    
    if (!ad) {
        adDetail.innerHTML = `
            <div class="not-found">
                <h2>Объявление не найдено</h2>
                <p>Возможно, оно было удалено</p>
                <a href="index.html" class="btn-comment">На главную</a>
            </div>
        `;
        return;
    }

    ad.views = (ad.views || 0) + 1;
    localStorage.setItem('ads', JSON.stringify(adsList));
    
    if (currentUser) {
        addToHistory(ad.id);
    }

    let favoriteButtonHtml = '';
    if (currentUser) {
        const isFav = isFavorite(ad.id);
        favoriteButtonHtml = `
            <button class="btn-favorite ${isFav ? 'active' : ''}" onclick="toggleFavorite(${ad.id}); updateFavoriteButton(this, ${ad.id})">
                ${isFav ? '❤️ В избранном' : '🤍 В избранное'}
            </button>
        `;
    }

    let actionsHtml = '';
    if (currentUser && currentUser.id === ad.userId) {
        actionsHtml = `
            <div class="ad-detail-actions">
                <a href="edit-ad.html?id=${ad.id}" class="btn-edit">✏️ Редактировать</a>
                <button class="btn-delete" onclick="deleteAdDetail(${ad.id})">🗑️ Удалить</button>
            </div>
        `;
    }

    let commentsHtml = '';
    if (ad.comments && ad.comments.length > 0) {
        commentsHtml = ad.comments.map(c => `
            <div class="comment">
                <div class="comment-author">${c.user}</div>
                <div class="comment-text">${c.text}</div>
                <div class="comment-date">${c.date || ''}</div>
            </div>
        `).join('');
    } else {
        commentsHtml = '<p>Пока нет комментариев</p>';
    }

    let commentFormHtml = '';
    if (currentUser) {
        commentFormHtml = `
            <div class="add-comment">
                <textarea id="commentText" placeholder="Ваш комментарий..."></textarea>
                <button class="btn-comment" onclick="addComment(${ad.id})">Отправить комментарий</button>
            </div>
        `;
    }

    adDetail.innerHTML = `
        <div class="ad-detail-card">
            <img src="${ad.image || 'https://via.placeholder.com/800x400'}" alt="${ad.title}" class="ad-detail-image">
            <div class="ad-detail-content">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h1 class="ad-detail-title">${ad.title}</h1>
                    ${favoriteButtonHtml}
                </div>
                <div class="ad-detail-price">${ad.price}</div>
                
                <div class="ad-detail-meta">
                    <span class="ad-detail-meta-item">📁 ${ad.category}</span>
                    <span class="ad-detail-meta-item">📅 ${ad.date}</span>
                    <span class="ad-detail-meta-item">👁 ${ad.views} просмотров</span>
                </div>
                
                <div class="ad-detail-description">
                    ${ad.description}
                </div>
                
                <div class="ad-detail-phone">
                    <strong>📞 Контактный телефон:</strong> ${ad.phone || 'Не указан'}
                </div>
                
                ${actionsHtml}
            </div>
        </div>
        
        <div class="comments-section">
            <h3>Комментарии (${ad.comments ? ad.comments.length : 0})</h3>
            ${commentsHtml}
            ${commentFormHtml}
        </div>
    `;
}

function updateFavoriteButton(button, adId) {
    if (isFavorite(adId)) {
        button.innerHTML = '❤️ В избранном';
        button.classList.add('active');
    } else {
        button.innerHTML = '🤍 В избранное';
        button.classList.remove('active');
    }
}

function addComment(adId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Необходимо войти в систему', 'warning', 'Требуется авторизация');
        window.location.href = 'login.html';
        return;
    }

    const commentText = document.getElementById('commentText')?.value?.trim();
    if (!commentText) {
        showNotification('Введите текст комментария', 'error', 'Ошибка');
        return;
    }

    const adsList = JSON.parse(localStorage.getItem('ads')) || [];
    const ad = adsList.find(a => a.id === adId);
    
    if (ad) {
        if (!ad.comments) ad.comments = [];
        ad.comments.push({
            user: currentUser.username,
            text: commentText,
            date: new Date().toLocaleString('ru')
        });
        
        localStorage.setItem('ads', JSON.stringify(adsList));
        showNotification('Комментарий добавлен', 'success', 'Спасибо!');
        location.reload();
    }
}

function deleteAdDetail(adId) {
    if (confirm('Вы уверены, что хотите удалить это объявление?')) {
        let adsList = JSON.parse(localStorage.getItem('ads')) || [];
        adsList = adsList.filter(ad => ad.id !== adId);
        localStorage.setItem('ads', JSON.stringify(adsList));
        
        showNotification('Объявление удалено', 'success', 'Готово!');
        window.location.href = 'index.html';
    }
}

/* ============================================
   ============================================
   ФУНКЦИИ ДЛЯ СТРАНИЦЫ РЕДАКТИРОВАНИЯ (edit-ad.html)
   ============================================
   ============================================ */

function initEditPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Необходимо войти в систему', 'warning', 'Требуется авторизация');
        window.location.href = 'login.html';
        return;
    }

    loadAdData();
    
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('input', function(e) {
            const preview = document.getElementById('preview');
            if (preview) {
                if (e.target.value) {
                    preview.src = e.target.value;
                    preview.style.display = 'block';
                } else {
                    preview.style.display = 'none';
                }
            }
        });
    }

    const form = document.getElementById('editAdForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAdChanges();
        });
    }
}

function loadAdData() {
    const adId = parseInt(getUrlParam('id'));
    
    if (!adId) {
        showNotification('Объявление не найдено', 'error');
        window.location.href = 'index.html';
        return;
    }
    
    const adsList = JSON.parse(localStorage.getItem('ads')) || [];
    const ad = adsList.find(a => a.id === adId);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!ad) {
        showNotification('Объявление не найдено', 'error');
        window.location.href = 'index.html';
        return;
    }
    
    if (ad.userId !== currentUser.id) {
        showNotification('У вас нет прав на редактирование этого объявления', 'error', 'Доступ запрещен');
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('adId').value = ad.id;
    document.getElementById('title').value = ad.title || '';
    document.getElementById('category').value = ad.category || '';
    document.getElementById('price').value = ad.price || '';
    document.getElementById('description').value = ad.description || '';
    document.getElementById('image').value = ad.image || '';
    document.getElementById('phone').value = ad.phone || '';
    
    if (ad.image) {
        const preview = document.getElementById('preview');
        preview.src = ad.image;
        preview.style.display = 'block';
    }
}

function saveAdChanges() {
    const adId = parseInt(document.getElementById('adId').value);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('Необходимо войти в систему', 'warning', 'Требуется авторизация');
        window.location.href = 'login.html';
        return;
    }
    
    let adsList = JSON.parse(localStorage.getItem('ads')) || [];
    const adIndex = adsList.findIndex(a => a.id === adId);
    
    if (adIndex === -1) {
        showNotification('Объявление не найдено', 'error');
        window.location.href = 'index.html';
        return;
    }
    
    if (adsList[adIndex].userId !== currentUser.id) {
        showNotification('У вас нет прав на редактирование этого объявления', 'error', 'Доступ запрещен');
        window.location.href = 'index.html';
        return;
    }
    
    adsList[adIndex] = {
        ...adsList[adIndex],
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        price: document.getElementById('price').value,
        description: document.getElementById('description').value,
        image: document.getElementById('image').value || 'https://via.placeholder.com/200x150',
        phone: document.getElementById('phone').value || 'Не указан',
        editedAt: new Date().toLocaleString('ru')
    };
    
    localStorage.setItem('ads', JSON.stringify(adsList));
    
    showNotification('Изменения сохранены', 'success', 'Объявление обновлено');
    window.location.href = `ad.html?id=${adId}`;
}

/* ============================================
============================================
ФУНКЦИИ ДЛЯ ИЗБРАННОГО И ИСТОРИИ
============================================
   ============================================ */

function getFavorites() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];
    
    const favorites = JSON.parse(localStorage.getItem('favorites_' + currentUser.id)) || [];
    return favorites;
}

function saveFavorites(favorites) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    localStorage.setItem('favorites_' + currentUser.id, JSON.stringify(favorites));
}

function addToFavorites(adId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Необходимо войти в систему', 'warning', 'Требуется авторизация');
        return false;
    }
    
    const favorites = getFavorites();
    if (!favorites.includes(adId)) {
        favorites.push(adId);
        saveFavorites(favorites);
        showNotification('Добавлено в избранное', 'success');
        return true;
    }
    return false;
}

function removeFromFavorites(adId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(adId);
    if (index !== -1) {
        favorites.splice(index, 1);
        saveFavorites(favorites);
        showNotification('Удалено из избранного', 'info');
        return true;
    }
    return false;
}

function isFavorite(adId) {
    const favorites = getFavorites();
    return favorites.includes(adId);
}

function toggleFavorite(adId) {
    if (isFavorite(adId)) {
        removeFromFavorites(adId);
        return false;
    } else {
        addToFavorites(adId);
        return true;
    }
}

function getHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];
    
    const history = JSON.parse(localStorage.getItem('history_' + currentUser.id)) || [];
    return history;
}

function saveHistory(history) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    localStorage.setItem('history_' + currentUser.id, JSON.stringify(history));
}

function addToHistory(adId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    let history = getHistory();
    history = history.filter(id => id !== adId);
    history.unshift(adId);
    
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    saveHistory(history);
}

function getFavoriteAds() {
    const favorites = getFavorites();
    const allAds = JSON.parse(localStorage.getItem('ads')) || [];
    return allAds.filter(ad => favorites.includes(ad.id));
}

function getHistoryAds() {
    const history = getHistory();
    const allAds = JSON.parse(localStorage.getItem('ads')) || [];
    return history.map(id => allAds.find(ad => ad.id === id)).filter(ad => ad);
}
/* ============================================
ВАЛИДАЦИЯ EMAIL И СЛОЖНОСТЬ ПАРОЛЯ
   ============================================ */

function isValidEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(email);
}

function validateEmailField() {
    const email = document.getElementById('email').value.trim();
    const errorDiv = document.getElementById('emailError');
    if (errorDiv) {
        if (!isValidEmail(email) && email !== '') {
            errorDiv.textContent = 'Неверный формат email';
            errorDiv.style.display = 'block';
        } else {
            errorDiv.style.display = 'none';
        }
    }
}

function checkPasswordStrength(pwd) {
    const strengthDiv = document.getElementById('passwordStrength');
    if (!strengthDiv) return;
    if (pwd.length === 0) {
        strengthDiv.innerHTML = '';
        return;
    }
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    let text = '', color = '';
    if (strength <= 2) { text = 'Слабый'; color = 'red'; }
    else if (strength <= 4) { text = 'Средний'; color = 'orange'; }
    else { text = 'Сильный'; color = 'green'; }
    strengthDiv.innerHTML = `<span style="color:${color}">Сложность пароля: ${text}</span>`;
}

// Обновляем функцию register() – добавим проверку email
// (замените существующую функцию register() на эту)
window.originalRegister = register;
register = function() {
    const username = document.getElementById('username')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value?.trim();
    const password2 = document.getElementById('passwordtwo')?.value?.trim();

    if (!username || !email || !password || !password2) {
        showNotification('Заполните все поля', 'error', 'Ошибка регистрации');
        return;
    }
    if (!isValidEmail(email)) {
        showNotification('Введите корректный email (например, name@domain.com)', 'error', 'Ошибка регистрации');
        return;
    }
    if (password !== password2) {
        showNotification('Пароли не совпадают', 'error', 'Ошибка регистрации');
        return;
    }
    if (password.length < 6) {
        showNotification('Пароль должен быть не менее 6 символов', 'error', 'Ошибка регистрации');
        return;
    }
    if (users.find(u => u.username === username)) {
        showNotification('Пользователь уже существует', 'error', 'Ошибка регистрации');
        return;
    }
    if (users.find(u => u.email === email)) {
        showNotification('Этот email уже зарегистрирован', 'error', 'Ошибка регистрации');
        return;
    }

    const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const user = {
        id: Date.now(),
        username,
        email,
        password,
        registeredAt: new Date().toLocaleString('ru'),
        activated: false,
        activationCode: activationCode
    };
    users.push(user);
    save();
    showNotification(`Ваш код активации: ${activationCode}`, 'info', 'Подтверждение регистрации');
    window.location.href = `activate.html?code=${activationCode}`;
};

/* ============================================
СИСТЕМА ЛИЧНЫХ СООБЩЕНИЙ (обратная связь)
   ============================================ */

let messages = JSON.parse(localStorage.getItem('messages')) || [];

function saveMessages() {
    localStorage.setItem('messages', JSON.stringify(messages));
}

// Отправить сообщение
function sendMessage(toUserId, adId, text) {
    const fromUser = currentUser;
    if (!fromUser) {
        showNotification('Войдите в аккаунт', 'warning');
        return false;
    }
    if (!text.trim()) return false;
    const newMsg = {
        id: Date.now(),
        fromUserId: fromUser.id,
        toUserId: toUserId,
        adId: adId,
        text: text.trim(),
        date: new Date().toISOString(),
        isRead: false
    };
    messages.push(newMsg);
    saveMessages();
    return true;
}

// Получить диалоги пользователя
function getUserDialogs(userId) {
    const userMessages = messages.filter(m => m.fromUserId === userId || m.toUserId === userId);
    const dialogsMap = new Map();
    userMessages.forEach(msg => {
        const otherId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
        if (!dialogsMap.has(otherId)) {
            const otherUser = users.find(u => u.id === otherId);
            const ad = ads.find(a => a.id === msg.adId);
            dialogsMap.set(otherId, {
                userId: otherId,
                username: otherUser ? otherUser.username : 'Пользователь',
                adId: msg.adId,
                adTitle: ad ? ad.title : 'Объявление',
                lastMessage: msg.text,
                lastDate: msg.date
            });
        }
    });
    return Array.from(dialogsMap.values());
}

// Получить переписку с конкретным пользователем по объявлению
function getConversation(userId1, userId2, adId) {
    return messages.filter(m =>
        (m.fromUserId === userId1 && m.toUserId === userId2) ||
        (m.fromUserId === userId2 && m.toUserId === userId1)
    ).sort((a,b) => new Date(a.date) - new Date(b.date));
}

// Загрузить чат в интерфейс
function loadChat(otherUserId, adId) {
    const otherUser = users.find(u => u.id === otherUserId);
    const ad = ads.find(a => a.id === adId);
    const chatDiv = document.getElementById('chatMessages');
    if (!chatDiv) return;
    const conversation = getConversation(currentUser.id, otherUserId, adId);
    chatDiv.innerHTML = conversation.map(msg => `
        <div class="chat-message ${msg.fromUserId === currentUser.id ? 'my-message' : 'other-message'}">
            <strong>${msg.fromUserId === currentUser.id ? 'Вы' : otherUser.username}:</strong>
            <p>${msg.text}</p>
            <small>${new Date(msg.date).toLocaleString()}</small>
        </div>
    `).join('');
    // Отметить сообщения как прочитанные
    messages.forEach(m => {
        if (m.toUserId === currentUser.id && m.fromUserId === otherUserId) m.isRead = true;
    });
    saveMessages();
}

// Отправить сообщение из чата
function sendChatMessage() {
    const otherUserId = parseInt(document.getElementById('chatOtherUserId').value);
    const adId = parseInt(document.getElementById('chatAdId').value);
    const text = document.getElementById('chatMessageInput').value;
    if (sendMessage(otherUserId, adId, text)) {
        document.getElementById('chatMessageInput').value = '';
        loadChat(otherUserId, adId);
    }
}
/* ============================================
   ============================================
   ИНИЦИАЛИЗАЦИЯ СТРАНИЦ
   ============================================
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    updateAuthLinks();
    
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (page === 'index.html' || page === '') {
        if (typeof renderCategoriesGrid === 'function') {
            renderCategoriesGrid();
            loadAds();
        }
    }
    else if (page === 'category.html') {
        if (typeof renderCategories === 'function') {
            const catParam = getUrlParam('cat');
            if (catParam && catParam !== 'all') {
                currentCategory = catParam;
            }
            renderCategories();
            loadAdsByCategory();
        }
    }
    else if (page === 'profile.html') {
        if (typeof loadUserData === 'function') {
            loadUserData();
            loadUserAds();
        }
    }
    else if (page === 'add.html') {
        if (typeof initAddPage === 'function') {
            initAddPage();
        }
    }
    else if (page === 'ad.html') {
        if (typeof loadAdDetail === 'function') {
            loadAdDetail();
        }
    }
    else if (page === 'edit-ad.html') {
        if (typeof initEditPage === 'function') {
            initEditPage();
        }
    }
});








