// VK Publisher для УчебаВместе (исправленная версия)
const VK_ACCESS_TOKEN = 'vk1.a.Dx2Q9eBUtyAznTAfQ_NaZP48G_WO0QtpV390AVQ4jvH4evJNUtOL9V2MrZ6ssAmm_DxDkGB3UzJKdYlKsT1ntAUHtvUYL6ItJMk9dB8bg7OZTqhFrDZesWNe35Z62TFvaCUCLbCenYivke-rgetpAH0RkNGkRqfVTyFQHGWceabFUA5eQh_3Ywm6hif80sXhm4rJSUAcqyknYLSfB3wwBg';
const VK_API_VERSION = '5.199';
const VK_GROUP_ID = '233570764';

let postAttachments = [];

// Инициализация VK Publisher
function initVKPublisher() {
    setupVKPublisherUI();
    loadAndDisplayNews();
}

// Настройка UI публикатора
function setupVKPublisherUI() {
    // Обработчик загрузки изображений
    const imageUpload = document.getElementById('vkImageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }
    
    // Счетчик символов
    const postInput = document.getElementById('vkPostText');
    if (postInput) {
        postInput.addEventListener('input', updateCharCounter);
        updateCharCounter();
    }
    
    // Drag and drop для изображений
    const dropZone = document.getElementById('vkDropZone');
    if (dropZone) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            handleDroppedFiles(e.dataTransfer.files);
        });
    }
}

// Загрузка изображений
function handleImageUpload(e) {
    const files = e.target.files;
    handleDroppedFiles(files);
}

// Обработка перетащенных файлов
function handleDroppedFiles(files) {
    if (postAttachments.length + files.length > 10) {
        showVKNotification('Максимум 10 изображений на пост', 'error');
        return;
    }
    
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showVKNotification(`Файл "${file.name}" не является изображением`, 'warning');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
            showVKNotification(`Изображение "${file.name}" слишком большое (макс. 10MB)`, 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            postAttachments.push({
                id: Date.now() + Math.random(),
                name: file.name,
                url: e.target.result,
                file: file
            });
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    });
}

// Обновление превью изображений
function updateImagePreview() {
    const preview = document.getElementById('vkImagePreview');
    if (!preview) return;
    
    if (postAttachments.length === 0) {
        preview.innerHTML = `
            <div class="empty-preview">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Нажмите для загрузки изображений или перетащите их сюда</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="image-grid">';
    postAttachments.forEach((img, index) => {
        html += `
            <div class="image-item">
                <img src="${img.url}" alt="${img.name}">
                <div class="image-overlay">
                    <button class="remove-image" onclick="removeImage(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    preview.innerHTML = html;
}

// Удаление изображения
function removeImage(index) {
    postAttachments.splice(index, 1);
    updateImagePreview();
}

// Обновление счетчика символов
function updateCharCounter() {
    const input = document.getElementById('vkPostText');
    const counter = document.getElementById('charCounter');
    
    if (!input || !counter) return;
    
    const count = input.value.length;
    counter.textContent = `${count}/4096`;
    
    if (count > 4000) {
        counter.style.color = '#ef4444';
    } else if (count > 3500) {
        counter.style.color = '#f59e0b';
    } else {
        counter.style.color = '#64748b';
    }
}

// Основная функция публикации
async function publishToVK() {
    const postText = document.getElementById('vkPostText').value.trim();
    const fromGroup = document.getElementById('vkFromGroup').checked;
    const signed = document.getElementById('vkSigned').checked;
    
    // Валидация
    if (!postText && postAttachments.length === 0) {
        showVKNotification('Введите текст или прикрепите изображения', 'error');
        return;
    }
    
    const groupId = VK_GROUP_ID;
    
    // 1. Сначала сохраняем новость на сайте
    const newsId = Date.now();
    const newsItem = {
        id: newsId,
        text: postText,
        images: postAttachments.map(img => img.url), // Сохраняем base64 изображений
        date: new Date().toISOString(),
        dateFormatted: formatDate(new Date()),
        publishedToVK: false // Пока не опубликовано в VK
    };
    
    // Сохраняем новость локально
    saveNewsToSite(newsItem);
    
    // 2. Обновляем отображение новостей на сайте
    updateNewsDisplay();
    
    // 3. Публикуем в VK
    showVKNotification('Начинаю публикацию...', 'info');
    
    try {
        // Подготовка параметров для VK
        const params = new URLSearchParams({
            owner_id: `-${groupId}`,
            message: postText,
            from_group: fromGroup ? 1 : 0,
            signed: signed ? 1 : 0,
            access_token: VK_ACCESS_TOKEN,
            v: VK_API_VERSION
        });
        
        // Если есть изображения, пробуем загрузить их
        if (postAttachments.length > 0) {
            showVKNotification('Попытка загрузки изображений в VK...', 'info');
            try {
                // Для простоты - пропускаем загрузку изображений через VK API
                // Это сложный процесс, требующий нескольких запросов
                // Вместо этого публикуем пост без изображений
                showVKNotification('Публикую пост без изображений (для загрузки изображений требуется отдельная настройка)', 'warning');
            } catch (imageError) {
                console.log('Ошибка загрузки изображений в VK:', imageError);
            }
        }
        
        // Публикация поста в VK (без изображений для упрощения)
        const response = await fetch('https://api.vk.com/method/wall.post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        
        const data = await response.json();
        console.log('VK API Response:', data);
        
        // Проверяем ответ VK API
        if (data.error) {
            // Ошибка от VK API
            if (data.error.error_code === 14) {
                // Требуется капча - обрабатываем отдельно
                showVKNotification('Требуется капча. Пост опубликован только на сайте', 'error');
                updateNewsVKStatus(newsId, null);
            } else if (data.error.error_code === 15) {
                // Доступ запрещен
                showVKNotification('Доступ запрещен. Проверьте права токена', 'error');
                updateNewsVKStatus(newsId, null);
            } else {
                // Другие ошибки VK
                showVKNotification('Ошибка VK: ' + data.error.error_msg + ' (новость опубликована на сайте)', 'warning');
                updateNewsVKStatus(newsId, null);
            }
        } else if (data.response && data.response.post_id) {
            // Успешная публикация в VK
            const postId = data.response.post_id;
            
            // Обновляем новость - отмечаем как опубликованную в VK
            updateNewsVKStatus(newsId, postId);
            
            // Сохраняем в историю публикаций VK
            saveToHistory({
                id: postId,
                newsId: newsId,
                groupId: groupId,
                text: postText,
                images: postAttachments.length,
                date: new Date().toISOString(),
                vkPublished: true
            });
            
            // Показываем уведомление об успехе
            showVKNotification('Новость опубликована на сайте и в VK! 🎉', 'success');
            
            // Очищаем форму и закрываем модальное окно
            setTimeout(() => {
                clearVKForm();
                closeVKPublishModal();
                showVKNotification('Готово! Можно публиковать следующую новость', 'success');
            }, 2000);
            
        } else {
            // Непонятный ответ от VK
            console.warn('Неожиданный ответ от VK API:', data);
            showVKNotification('Новость опубликована на сайте. Ответ VK не распознан', 'warning');
            updateNewsVKStatus(newsId, null);
        }
        
    } catch (networkError) {
        // Ошибка сети или другие ошибки fetch
        console.error('Network error:', networkError);
        showVKNotification('Ошибка сети. Новость опубликована только на сайте', 'error');
        updateNewsVKStatus(newsId, null);
    }
}

// Сохранение новости на сайте
function saveNewsToSite(newsItem) {
    let news = JSON.parse(localStorage.getItem('ucheba_news')) || [];
    news.unshift(newsItem);
    
    // Сохраняем только последние 50 новостей
    if (news.length > 50) {
        news = news.slice(0, 50);
    }
    
    localStorage.setItem('ucheba_news', JSON.stringify(news));
    return newsItem;
}

// Обновление статуса публикации в VK для новости
function updateNewsVKStatus(newsId, vkPostId) {
    let news = JSON.parse(localStorage.getItem('ucheba_news')) || [];
    const newsIndex = news.findIndex(item => item.id === newsId);
    
    if (newsIndex !== -1) {
        news[newsIndex].publishedToVK = vkPostId !== null;
        news[newsIndex].vkPostId = vkPostId;
        localStorage.setItem('ucheba_news', JSON.stringify(news));
    }
}

// Загрузка и отображение новостей на сайте
function loadAndDisplayNews() {
    updateNewsDisplay();
}

// Обновление отображения новостей
function updateNewsDisplay() {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    const news = JSON.parse(localStorage.getItem('ucheba_news')) || [];
    
    if (news.length === 0) {
        newsContainer.innerHTML = `
            <div class="no-news">
                <i class="fas fa-newspaper"></i>
                <h3>Новостей пока нет</h3>
                <p>Будьте первым, кто опубликует новость!</p>
            </div>
        `;
        return;
    }
    
    let newsHTML = '<div class="news-grid">';
    
    news.forEach((item, index) => {
        // Форматируем дату
        const date = item.dateFormatted || formatDate(new Date(item.date));
        
        // Проверяем есть ли изображения
        const hasImages = item.images && item.images.length > 0;
        const firstImage = hasImages ? item.images[0] : null;
        
        newsHTML += `
            <div class="news-card">
                <div class="news-header">
                    <div class="news-date">
                        <i class="fas fa-calendar-alt"></i>
                        ${date}
                    </div>
                    ${item.publishedToVK ? 
                        '<span class="news-vk-badge"><i class="fab fa-vk"></i> VK</span>' : 
                        '<span class="news-site-badge"><i class="fas fa-globe"></i> Только сайт</span>'
                    }
                </div>
                
                <div class="news-content">
                    <p class="news-text">${escapeHtml(item.text).replace(/\n/g, '<br>')}</p>
                </div>
                
                ${firstImage ? `
                    <div class="news-images">
                        <img src="${firstImage}" alt="Изображение новости" 
                             onclick="openNewsImageGallery(${index})">
                        ${item.images.length > 1 ? 
                            `<div class="more-images">+${item.images.length - 1}</div>` : ''}
                    </div>
                ` : ''}
                
                <div class="news-footer">
                    <span class="news-number">#${news.length - index}</span>
                    <button class="btn btn-sm btn-outline" onclick="deleteNews(${item.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        `;
    });
    
    newsHTML += '</div>';
    newsContainer.innerHTML = newsHTML;
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Форматирование даты
function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} минут назад`;
    if (diffHours < 24) return `${diffHours} часов назад`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дней назад`;
    
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Открытие галереи изображений новости
function openNewsImageGallery(newsIndex) {
    const news = JSON.parse(localStorage.getItem('ucheba_news')) || [];
    if (newsIndex >= news.length || !news[newsIndex].images) return;
    
    const images = news[newsIndex].images;
    
    // Создаем модальное окно для галереи
    const galleryModal = document.createElement('div');
    galleryModal.className = 'modal';
    galleryModal.id = 'imageGalleryModal';
    galleryModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Галерея изображений</h2>
                <button class="modal-close" onclick="closeImageGallery()">×</button>
            </div>
            <div class="modal-body">
                <div class="image-gallery">
                    ${images.map((img, idx) => `
                        <div class="gallery-item ${idx === 0 ? 'active' : ''}">
                            <img src="${img}" alt="Изображение ${idx + 1}">
                        </div>
                    `).join('')}
                </div>
                ${images.length > 1 ? `
                    <div class="gallery-nav">
                        <button class="gallery-prev" onclick="prevGalleryImage()">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div class="gallery-counter">
                            <span id="currentImage">1</span> / ${images.length}
                        </div>
                        <button class="gallery-next" onclick="nextGalleryImage()">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(galleryModal);
    document.body.style.overflow = 'hidden';
    galleryModal.style.display = 'block';
    
    // Инициализируем галерею
    currentGalleryIndex = 0;
}

// Управление галереей
let currentGalleryIndex = 0;

function closeImageGallery() {
    const modal = document.getElementById('imageGalleryModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function prevGalleryImage() {
    const images = document.querySelectorAll('.gallery-item');
    if (images.length === 0) return;
    
    images[currentGalleryIndex].classList.remove('active');
    currentGalleryIndex = (currentGalleryIndex - 1 + images.length) % images.length;
    images[currentGalleryIndex].classList.add('active');
    document.getElementById('currentImage').textContent = currentGalleryIndex + 1;
}

function nextGalleryImage() {
    const images = document.querySelectorAll('.gallery-item');
    if (images.length === 0) return;
    
    images[currentGalleryIndex].classList.remove('active');
    currentGalleryIndex = (currentGalleryIndex + 1) % images.length;
    images[currentGalleryIndex].classList.add('active');
    document.getElementById('currentImage').textContent = currentGalleryIndex + 1;
}

// Удаление новости
function deleteNews(newsId) {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;
    
    let news = JSON.parse(localStorage.getItem('ucheba_news')) || [];
    news = news.filter(item => item.id !== newsId);
    localStorage.setItem('ucheba_news', JSON.stringify(news));
    
    // Обновляем отображение
    updateNewsDisplay();
    showVKNotification('Новость удалена', 'success');
}

// Сохранение в историю публикаций VK
function saveToHistory(post) {
    let history = JSON.parse(localStorage.getItem('vk_publish_history')) || [];
    history.unshift(post);
    
    // Сохраняем только последние 100 постов
    if (history.length > 100) {
        history = history.slice(0, 100);
    }
    
    localStorage.setItem('vk_publish_history', JSON.stringify(history));
}

// Очистка формы
function clearVKForm() {
    document.getElementById('vkPostText').value = '';
    document.getElementById('vkFromGroup').checked = true;
    document.getElementById('vkSigned').checked = false;
    postAttachments = [];
    
    updateCharCounter();
    updateImagePreview();
}

// Показать уведомление
function showVKNotification(message, type = 'info') {
    // Создаем контейнер уведомлений
    let container = document.getElementById('vkNotifications');
    if (!container) {
        container = document.createElement('div');
        container.id = 'vkNotifications';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `vk-notification vk-notification-${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        max-width: 400px;
    `;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Удаляем через 5 секунд
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Закрытие модального окна VK (добавим глобально)
function closeVKPublishModal() {
    const modal = document.getElementById('vkPublishModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Добавляем CSS стили
const vkStyles = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .vk-publisher-container {
        background: white;
        border-radius: 12px;
        padding: 25px;
    }
    
    .vk-form-group {
        margin-bottom: 20px;
    }
    
    .vk-form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #1e293b;
    }
    
    .vk-textarea {
        width: 100%;
        padding: 15px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 16px;
        font-family: inherit;
        resize: vertical;
        min-height: 120px;
        transition: border-color 0.3s;
    }
    
    .vk-textarea:focus {
        outline: none;
        border-color: #4a76a8;
        box-shadow: 0 0 0 3px rgba(74, 118, 168, 0.1);
    }
    
    .char-counter {
        text-align: right;
        font-size: 14px;
        color: #64748b;
        margin-top: 5px;
    }
    
    .image-upload-section {
        border: 2px dashed #e2e8f0;
        border-radius: 8px;
        padding: 25px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .image-upload-section:hover {
        border-color: #4a76a8;
        background: #f8fafc;
    }
    
    .image-upload-section.dragover {
        border-color: #4a76a8;
        background: rgba(74, 118, 168, 0.1);
    }
    
    .empty-preview {
        color: #64748b;
    }
    
    .empty-preview i {
        font-size: 48px;
        margin-bottom: 10px;
        opacity: 0.5;
    }
    
    .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
        margin-top: 15px;
    }
    
    .image-item {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        height: 150px;
    }
    
    .image-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .image-item:hover .image-overlay {
        opacity: 1;
    }
    
    .remove-image {
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .vk-options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin: 20px 0;
    }
    
    .vk-option {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .vk-option input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }
    
    .vk-option label {
        margin: 0;
        cursor: pointer;
        font-weight: 500;
        color: #1e293b;
    }
    
    .vk-actions {
        display: flex;
        gap: 15px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    }
    
    /* Стили для новостей */
    .no-news {
        text-align: center;
        padding: 40px;
        color: #64748b;
    }
    
    .no-news i {
        font-size: 48px;
        margin-bottom: 15px;
        opacity: 0.5;
    }
    
    .news-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 25px;
        margin-top: 30px;
    }
    
    .news-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
    }
    
    .news-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    
    .news-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .news-date {
        color: #64748b;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .news-vk-badge {
        background: #4a76a8;
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .news-site-badge {
        background: #10b981;
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .news-content {
        flex-grow: 1;
        margin-bottom: 20px;
    }
    
    .news-text {
        color: #1e293b;
        line-height: 1.6;
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
    }
    
    .news-images {
        position: relative;
        margin-bottom: 20px;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        height: 200px;
    }
    
    .news-images img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .news-images:hover img {
        transform: scale(1.05);
    }
    
    .more-images {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .news-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
    }
    
    .news-number {
        color: #94a3b8;
        font-size: 14px;
        font-weight: 600;
    }
    
    /* Стили для галереи изображений */
    .image-gallery {
        width: 100%;
        max-height: 60vh;
        overflow: hidden;
        margin-bottom: 20px;
    }
    
    .gallery-item {
        display: none;
        width: 100%;
        height: 60vh;
    }
    
    .gallery-item.active {
        display: block;
    }
    
    .gallery-item img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    
    .gallery-nav {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-top: 20px;
    }
    
    .gallery-prev,
    .gallery-next {
        background: #4a76a8;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 18px;
        transition: background 0.3s;
    }
    
    .gallery-prev:hover,
    .gallery-next:hover {
        background: #3a6698;
    }
    
    .gallery-counter {
        color: #1e293b;
        font-weight: 600;
        min-width: 60px;
        text-align: center;
    }
`;

// Добавляем стили в документ
const styleSheet = document.createElement("style");
styleSheet.textContent = vkStyles;
document.head.appendChild(styleSheet);

// Инициализация при загрузке
if (typeof initVKPublisher === 'function') {
    document.addEventListener('DOMContentLoaded', initVKPublisher);
}