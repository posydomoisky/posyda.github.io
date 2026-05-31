// Упрощенный VK Publisher
const VK_ACCESS_TOKEN = 'vk1.a.Dx2Q9eBUtyAznTAfQ_NaZP48G_WO0QtpV390AVQ4jvH4evJNUtOL9V2MrZ6ssAmm_DxDkGB3UzJKdYlKsT1ntAUHtvUYL6ItJMk9dB8bg7OZTqhFrDZesWNe35Z62TFvaCUCLbCenYivke-rgetpAH0RkNGkRqfVTyFQHGWceabFUA5eQh_3Ywm6hif80sXhm4rJSUAcqyknYLSfB3wwBg';
const VK_API_VERSION = '5.199';

let vkGroups = [];
let selectedGroup = null;
let postImages = [];

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadVKGroups();
    setupVKEvents();
});

// Загрузка групп
async function loadVKGroups() {
    try {
        const response = await fetch(`https://api.vk.com/method/groups.get?access_token=${VK_ACCESS_TOKEN}&filter=admin&extended=1&v=${VK_API_VERSION}`);
        const data = await response.json();
        
        if (data.error) {
            showVKNotification('Ошибка загрузки групп: ' + data.error.error_msg, 'error');
            return;
        }
        
        vkGroups = data.response.items || [];
        updateGroupSelect();
        
    } catch (error) {
        showVKNotification('Ошибка сети при загрузке групп', 'error');
    }
}

// Обновление выбора группы
function updateGroupSelect() {
    const select = document.getElementById('vkGroupSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Выберите сообщество</option>';
    
    vkGroups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = `${group.name} (${group.screen_name ? '@' + group.screen_name : 'ID: ' + group.id})`;
        option.dataset.photo = group.photo_200 || '';
        select.appendChild(option);
    });
}

// Настройка событий
function setupVKEvents() {
    const groupSelect = document.getElementById('vkGroupSelect');
    const textInput = document.getElementById('vkPostText');
    const dropZone = document.getElementById('vkDropZone');
    const fileInput = document.getElementById('vkImageUpload');
    
    if (groupSelect) {
        groupSelect.addEventListener('change', function() {
            selectedGroup = this.value;
            updateGroupPreview();
        });
    }
    
    if (textInput) {
        textInput.addEventListener('input', updateCharCounter);
        updateCharCounter();
    }
    
    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#4a76a8';
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '';
            handleImageFiles(e.dataTransfer.files);
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => handleImageFiles(e.target.files));
    }
}

// Обработка изображений
function handleImageFiles(files) {
    if (postImages.length + files.length > 10) {
        showVKNotification('Максимум 10 изображений на пост', 'error');
        return;
    }
    
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showVKNotification(`Файл "${file.name}" не является изображением`, 'warning');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            showVKNotification(`Изображение "${file.name}" слишком большое (макс. 10MB)`, 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            postImages.push({
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
    
    if (postImages.length === 0) {
        preview.innerHTML = `
            <div class="empty-preview">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Перетащите сюда изображения или нажмите для выбора</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="image-grid">';
    postImages.forEach((img, index) => {
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
    postImages.splice(index, 1);
    updateImagePreview();
}

// Обновление счетчика символов
function updateCharCounter() {
    const input = document.getElementById('vkPostText');
    const counter = document.getElementById('charCounter');
    
    if (!input || !counter) return;
    
    const count = input.value.length;
    counter.textContent = `${count}/4096`;
    counter.style.color = count > 4000 ? '#ef4444' : count > 3500 ? '#f59e0b' : '';
}

// Обновление превью группы
function updateGroupPreview() {
    const group = vkGroups.find(g => g.id == selectedGroup);
    const preview = document.getElementById('groupPreview');
    
    if (!preview || !group) return;
    
    preview.innerHTML = `
        <div class="group-preview-card">
            <img src="${group.photo_200 || 'https://via.placeholder.com/100'}" 
                 alt="${group.name}" 
                 class="group-avatar">
            <div class="group-info">
                <h4>${group.name}</h4>
                <p>${group.screen_name ? '@' + group.screen_name : 'ID: ' + group.id}</p>
                ${group.members_count ? `<p>${group.members_count} участников</p>` : ''}
            </div>
        </div>
    `;
}

// Очистка формы
function clearVKForm() {
    document.getElementById('vkPostText').value = '';
    document.getElementById('vkGroupSelect').value = '';
    document.getElementById('vkSchedule').value = '';
    document.getElementById('vkScheduleTime').value = '';
    document.getElementById('vkFromGroup').checked = true;
    document.getElementById('vkSigned').checked = false;
    document.getElementById('vkCloseComments').checked = false;
    postImages = [];
    
    updateCharCounter();
    updateImagePreview();
    document.getElementById('groupPreview').innerHTML = '';
}

// Публикация поста
async function publishToVK() {
    const text = document.getElementById('vkPostText').value.trim();
    const scheduleDate = document.getElementById('vkSchedule').value;
    const scheduleTime = document.getElementById('vkScheduleTime').value;
    const fromGroup = document.getElementById('vkFromGroup').checked;
    const signed = document.getElementById('vkSigned').checked;
    const closeComments = document.getElementById('vkCloseComments').checked;
    
    // Валидация
    if (!selectedGroup) {
        showVKNotification('Выберите сообщество для публикации', 'error');
        return;
    }
    
    if (!text && postImages.length === 0) {
        showVKNotification('Введите текст или прикрепите изображения', 'error');
        return;
    }
    
    showVKNotification('Подготовка к публикации...', 'info');
    
    try {
        // Подготовка параметров
        const params = new URLSearchParams({
            owner_id: `-${selectedGroup}`,
            message: text,
            from_group: fromGroup ? 1 : 0,
            signed: signed ? 1 : 0,
            close_comments: closeComments ? 1 : 0,
            access_token: VK_ACCESS_TOKEN,
            v: VK_API_VERSION
        });
        
        // Запланированная публикация
        if (scheduleDate && scheduleTime) {
            const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
            const publishDate = Math.floor(scheduleDateTime.getTime() / 1000);
            
            if (publishDate > Math.floor(Date.now() / 1000)) {
                params.append('publish_date', publishDate);
            }
        }
        
        // Загрузка изображений
        let attachments = [];
        if (postImages.length > 0) {
            attachments = await uploadImages(selectedGroup, postImages);
            if (attachments.length > 0) {
                params.append('attachments', attachments.join(','));
            }
        }
        
        // Публикация
        const response = await fetch('https://api.vk.com/method/wall.post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.error_msg);
        }
        
        // Успех
        showVKNotification('Пост успешно опубликован!', 'success');
        
        // Сохраняем в историю
        saveToHistory({
            id: data.response.post_id,
            groupId: selectedGroup,
            text: text.substring(0, 100),
            images: postImages.length,
            date: new Date().toISOString(),
            scheduled: !!(scheduleDate && scheduleTime)
        });
        
        // Обновляем статистику
        updateVKStats();
        
        // Очищаем форму через 2 секунды
        setTimeout(clearVKForm, 2000);
        
    } catch (error) {
        console.error('Publish error:', error);
        showVKNotification('Ошибка публикации: ' + error.message, 'error');
    }
}

// Загрузка изображений на сервер VK
async function uploadImages(groupId, images) {
    const attachments = [];
    
    for (const img of images) {
        try {
            // Получаем сервер для загрузки
            const serverResponse = await fetch(`https://api.vk.com/method/photos.getWallUploadServer?group_id=${groupId}&access_token=${VK_ACCESS_TOKEN}&v=${VK_API_VERSION}`);
            const serverData = await serverResponse.json();
            
            if (serverData.error) throw new Error(serverData.error.error_msg);
            
            // Загружаем изображение
            const formData = new FormData();
            formData.append('photo', img.file);
            
            const uploadResponse = await fetch(serverData.response.upload_url, {
                method: 'POST',
                body: formData
            });
            
            const uploadData = await uploadResponse.json();
            
            // Сохраняем фото
            const saveParams = new URLSearchParams({
                group_id: groupId,
                server: uploadData.server,
                photo: uploadData.photo,
                hash: uploadData.hash,
                access_token: VK_ACCESS_TOKEN,
                v: VK_API_VERSION
            });
            
            const saveResponse = await fetch('https://api.vk.com/method/photos.saveWallPhoto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: saveParams
            });
            
            const saveData = await saveResponse.json();
            
            if (saveData.error) throw new Error(saveData.error.error_msg);
            
            const photo = saveData.response[0];
            attachments.push(`photo${photo.owner_id}_${photo.id}`);
            
        } catch (error) {
            console.error('Image upload error:', error);
        }
    }
    
    return attachments;
}

// Сохранение в историю
function saveToHistory(post) {
    let history = JSON.parse(localStorage.getItem('vk_history')) || [];
    history.unshift(post);
    
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('vk_history', JSON.stringify(history));
}

// Обновление статистики
function updateVKStats() {
    const history = JSON.parse(localStorage.getItem('vk_history')) || [];
    const postsCount = document.getElementById('vkPostsCount');
    const groupsCount = document.getElementById('vkGroupsCount');
    const lastPost = document.getElementById('vkLastPost');
    
    if (postsCount) postsCount.textContent = history.length;
    if (groupsCount) {
        const groups = [...new Set(history.map(p => p.groupId))];
        groupsCount.textContent = groups.length;
    }
    if (lastPost && history.length > 0) {
        const date = new Date(history[0].date);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000 / 60); // в минутах
        
        if (diff < 60) {
            lastPost.textContent = `${diff} мин назад`;
        } else if (diff < 1440) {
            lastPost.textContent = `${Math.floor(diff / 60)} ч назад`;
        } else {
            lastPost.textContent = `${Math.floor(diff / 1440)} д назад`;
        }
    }
}

// Уведомления
function showVKNotification(message, type = 'info') {
    const container = document.getElementById('vkNotifications') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `vk-notification vk-notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Удаляем через 5 секунд
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'vkNotifications';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
}

// Инициализация статистики
if (document.getElementById('vkPostsCount')) {
    updateVKStats();
}