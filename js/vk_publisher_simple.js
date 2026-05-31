// VK Publisher - упрощенная версия для публикации только в VK
const VK_ACCESS_TOKEN = 'vk1.a.Dx2Q9eBUtyAznTAfQ_NaZP48G_WO0QtpV390AVQ4jvH4evJNUtOL9V2MrZ6ssAmm_DxDkGB3UzJKdYlKsT1ntAUHtvUYL6ItJMk9dB8bg7OZTqhFrDZesWNe35Z62TFvaCUCLbCenYivke-rgetpAH0RkNGkRqfVTyFQHGWceabFUA5eQh_3Ywm6hif80sXhm4rJSUAcqyknYLSfB3wwBg';
const VK_API_VERSION = '5.199';
const VK_GROUP_ID = '233570764';

let postAttachments = [];

// Инициализация VK Publisher
function initVKPublisher() {
    setupVKPublisherUI();
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
        showNotification('Максимум 10 изображений на пост', 'error');
        return;
    }
    
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showNotification(`Файл "${file.name}" не является изображением`, 'warning');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
            showNotification(`Изображение "${file.name}" слишком большое (макс. 10MB)`, 'warning');
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
    
    // Валидация
    if (!postText && postAttachments.length === 0) {
        showNotification('Введите текст или прикрепите изображения', 'error');
        return;
    }
    
    // Показываем уведомление о начале публикации
    showNotification('Начинаю публикацию в VK...', 'info');
    
    try {
        // Подготовка параметров для VK
        const params = new URLSearchParams({
            owner_id: `-${VK_GROUP_ID}`,
            message: postText,
            from_group: 1, // Всегда от имени группы
            access_token: VK_ACCESS_TOKEN,
            v: VK_API_VERSION
        });
        
        // Публикация поста в VK
        const response = await fetch('https://api.vk.com/method/wall.post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        
        const data = await response.json();
        console.log('VK API Response:', data);
        
        if (data.error) {
            // Ошибка от VK API
            let errorMessage = 'Ошибка при публикации в VK: ';
            
            switch(data.error.error_code) {
                case 14:
                    errorMessage = 'Требуется капча. Попробуйте позже';
                    break;
                case 15:
                    errorMessage = 'Доступ запрещен. Проверьте права токена';
                    break;
                case 214:
                    errorMessage = 'Доступ к добавлению записи запрещен';
                    break;
                default:
                    errorMessage += data.error.error_msg;
            }
            
            showNotification(errorMessage, 'error');
            
            // Сохраняем новость локально (даже если ошибка VK)
            saveNewsLocally(postText);
            
        } else if (data.response && data.response.post_id) {
            // Успешная публикация в VK
            const postId = data.response.post_id;
            
            // Сохраняем новость локально
            saveNewsLocally(postText, postId);
            
            // Показываем уведомление об успехе
            showNotification('Новость успешно опубликована в VK! 🎉', 'success');
            
            // Очищаем форму и закрываем модальное окно
            setTimeout(() => {
                clearVKForm();
                closeVKPublishModal();
                
                // Обновляем список новостей
                if (typeof loadVKNews === 'function') {
                    loadVKNews();
                }
                
                showNotification('Готово! Новость появится на сайте', 'success');
            }, 2000);
            
        } else {
            // Непонятный ответ от VK
            console.warn('Неожиданный ответ от VK API:', data);
            showNotification('Новость опубликована локально. Ответ VK не распознан', 'warning');
            saveNewsLocally(postText);
        }
        
    } catch (networkError) {
        // Ошибка сети или другие ошибки fetch
        console.error('Network error:', networkError);
        showNotification('Ошибка сети. Новость сохранена локально', 'error');
        saveNewsLocally(postText);
    }
}

// Сохранение новости локально
function saveNewsLocally(text, vkPostId = null) {
    let news = JSON.parse(localStorage.getItem('ucheba_vk_news')) || [];
    
    const newNews = {
        id: Date.now(),
        text: text,
        date: 'только что',
        fromVK: true,
        vkLink: vkPostId ? `https://vk.com/wall-${VK_GROUP_ID}_${vkPostId}` : null
    };
    
    news.unshift(newNews);
    
    // Сохраняем только последние 20 новостей
    if (news.length > 20) {
        news = news.slice(0, 20);
    }
    
    localStorage.setItem('ucheba_vk_news', JSON.stringify(news));
    return newNews;
}

// Очистка формы
function clearVKForm() {
    document.getElementById('vkPostText').value = '';
    postAttachments = [];
    
    updateCharCounter();
    updateImagePreview();
}

// Показать уведомление
function showNotification(message, type = 'info') {
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

// Закрытие модального окна VK
function closeVKPublishModal() {
    const modal = document.getElementById('vkPublishModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Добавляем CSS стили для VK Publisher
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
    
    .vk-publish-info {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 8px;
        padding: 12px 15px;
        margin: 20px 0;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        color: #0369a1;
    }
    
    .vk-publish-info i {
        font-size: 18px;
        margin-top: 2px;
    }
    
    .vk-actions {
        display: flex;
        gap: 15px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    }
    
    /* Стили для новостей на сайте */
    .loading-news {
        text-align: center;
        padding: 40px;
        color: #64748b;
    }
    
    .loading-news i {
        font-size: 48px;
        margin-bottom: 15px;
        opacity: 0.7;
    }
    
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
    
    /* Стили для социальных ссылок в футере */
    .social-link {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #4a76a8;
        text-decoration: none;
        transition: color 0.3s;
    }
    
    .social-link:hover {
        color: #3a6698;
        text-decoration: underline;
    }
`;

// Добавляем стили в документ
const styleSheet = document.createElement("style");
styleSheet.textContent = vkStyles;
document.head.appendChild(styleSheet);