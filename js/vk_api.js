// VK API Integration
const VK_API_VERSION = '5.199';
const VK_ACCESS_TOKEN = 'vk1.a.Dx2Q9eBUtyAznTAfQ_NaZP48G_WO0QtpV390AVQ4jvH4evJNUtOL9V2MrZ6ssAmm_DxDkGB3UzJKdYlKsT1ntAUHtvUYL6ItJMk9dB8bg7OZTqhFrDZesWNe35Z62TFvaCUCLbCenYivke-rgetpAH0RkNGkRqfVTyFQHGWceabFUA5eQh_3Ywm6hif80sXhm4rJSUAcqyknYLSfB3wwBg';

// Storage keys for drafts and stats
const VK_STORAGE_KEYS = {
    DRAFTS: 'vk_drafts',
    STATS: 'vk_stats',
    LAST_POST: 'vk_last_post'
};

let selectedPhotos = [];
let currentGroupId = null;

// Initialize VK functionality
document.addEventListener('DOMContentLoaded', function() {
    initVKFunctionality();
});

function initVKFunctionality() {
    // Load VK groups
    loadVKGroups();
    
    // Load saved draft
    loadVKDraft();
    
    // Load stats
    loadVKStats();
    
    // Setup event listeners
    setupVKEventListeners();
}

function setupVKEventListeners() {
    // Character counter
    const messageInput = document.getElementById('vkMessage');
    if (messageInput) {
        messageInput.addEventListener('input', updateCharCount);
        updateCharCount();
    }
    
    // Photo upload
    const photoUpload = document.getElementById('vkPhotoUpload');
    if (photoUpload) {
        photoUpload.addEventListener('change', handlePhotoUpload);
    }
    
    // Drag and drop for photos
    const photoPreview = document.getElementById('vkPhotoPreview');
    if (photoPreview) {
        photoPreview.addEventListener('dragover', handleDragOver);
        photoPreview.addEventListener('dragleave', handleDragLeave);
        photoPreview.addEventListener('drop', handleDrop);
        photoPreview.addEventListener('click', () => {
            document.getElementById('vkPhotoUpload').click();
        });
    }
    
    // Auto-save draft every 30 seconds
    setInterval(saveVKDraft, 30000);
}

// Character counter
function updateCharCount() {
    const messageInput = document.getElementById('vkMessage');
    const charCount = document.getElementById('charCount');
    if (messageInput && charCount) {
        const count = messageInput.value.length;
        charCount.textContent = count;
        
        // Change color if approaching limit
        if (count > 3800) {
            charCount.style.color = '#dc3545';
        } else if (count > 3500) {
            charCount.style.color = '#ffc107';
        } else {
            charCount.style.color = 'inherit';
        }
    }
}

// Insert hashtags template
function insertHashtags() {
    const messageInput = document.getElementById('vkMessage');
    if (!messageInput) return;
    
    const hashtags = `#УчебаВместе #Репетитор #Обучение #Образование #Школа #Студент #Математика #Физика #Программирование`;
    
    if (messageInput.value.includes('#')) {
        // Append to existing text
        messageInput.value += '\n\n' + hashtags;
    } else {
        // Insert at cursor position
        const cursorPos = messageInput.selectionStart;
        const textBefore = messageInput.value.substring(0, cursorPos);
        const textAfter = messageInput.value.substring(cursorPos);
        messageInput.value = textBefore + '\n\n' + hashtags + '\n\n' + textAfter;
    }
    
    updateCharCount();
}

// Set current time for scheduling
function setCurrentTime() {
    const scheduleInput = document.getElementById('vkSchedule');
    if (!scheduleInput) return;
    
    const now = new Date();
    // Add 1 hour by default
    now.setHours(now.getHours() + 1);
    
    const formatted = now.toISOString().slice(0, 16);
    scheduleInput.value = formatted;
}

// Photo handling
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const preview = document.getElementById('vkPhotoPreview');
    preview.style.borderColor = '#4a76a8';
    preview.style.background = 'rgba(74, 118, 168, 0.1)';
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const preview = document.getElementById('vkPhotoPreview');
    preview.style.borderColor = '';
    preview.style.background = '';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const preview = document.getElementById('vkPhotoPreview');
    preview.style.borderColor = '';
    preview.style.background = '';
    
    const files = e.dataTransfer.files;
    handlePhotoFiles(files);
}

function handlePhotoUpload(e) {
    const files = e.target.files;
    handlePhotoFiles(files);
}

function handlePhotoFiles(files) {
    if (!files.length) return;
    
    // Clear existing photos if needed
    if (selectedPhotos.length + files.length > 10) {
        alert('Максимальное количество фото - 10');
        return;
    }
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
            alert(`Файл "${file.name}" не является изображением`);
            continue;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert(`Изображение "${file.name}" слишком большое (макс. 10MB)`);
            continue;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedPhotos.push({
                id: Date.now() + i,
                name: file.name,
                data: e.target.result,
                file: file
            });
            updatePhotoPreview();
        };
        reader.readAsDataURL(file);
    }
}

function updatePhotoPreview() {
    const preview = document.getElementById('vkPhotoPreview');
    if (!preview) return;
    
    if (selectedPhotos.length === 0) {
        preview.innerHTML = `
            <div class="empty-attachment">
                <i class="fas fa-image"></i>
                <span>Перетащите сюда изображения или нажмите для выбора</span>
            </div>
        `;
        return;
    }
    
    let html = '<div class="attachment-grid">';
    selectedPhotos.forEach(photo => {
        html += `
            <div class="attachment-item">
                <img src="${photo.data}" alt="${photo.name}">
                <button class="attachment-remove" onclick="removePhoto(${photo.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    html += '</div>';
    preview.innerHTML = html;
}

function removePhoto(id) {
    selectedPhotos = selectedPhotos.filter(photo => photo.id !== id);
    updatePhotoPreview();
}

function clearAttachments() {
    if (selectedPhotos.length === 0) return;
    
    if (confirm('Удалить все прикрепленные фото?')) {
        selectedPhotos = [];
        updatePhotoPreview();
    }
}

// VK API Functions
async function loadVKGroups() {
    const select = document.getElementById('vkGroupSelect');
    if (!select) return;
    
    try {
        select.innerHTML = '<option value="">Загрузка сообществ...</option>';
        
        // Using VK API to get groups where user is admin
        const response = await fetch(`https://api.vk.com/method/groups.get?access_token=${VK_ACCESS_TOKEN}&filter=admin&extended=1&v=${VK_API_VERSION}`);
        const data = await response.json();
        
        if (data.error) {
            console.error('VK API Error:', data.error);
            select.innerHTML = '<option value="">Ошибка загрузки</option>';
            return;
        }
        
        const groups = data.response.items || [];
        
        if (groups.length === 0) {
            select.innerHTML = '<option value="">Нет доступных сообществ</option>';
            return;
        }
        
        select.innerHTML = '<option value="">Выберите сообщество</option>';
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name + (group.screen_name ? ` (@${group.screen_name})` : '');
            option.dataset.name = group.name;
            option.dataset.photo = group.photo_200 || '';
            select.appendChild(option);
        });
        
        // Select the first group by default
        if (groups.length > 0) {
            select.value = groups[0].id;
            currentGroupId = groups[0].id;
        }
        
        // Load stats for selected group
        if (currentGroupId) {
            loadVKStats();
        }
        
    } catch (error) {
        console.error('Error loading VK groups:', error);
        select.innerHTML = '<option value="">Ошибка сети</option>';
    }
}

async function publishToVK(mode) {
    const groupSelect = document.getElementById('vkGroupSelect');
    const messageInput = document.getElementById('vkMessage');
    const scheduleInput = document.getElementById('vkSchedule');
    const fromGroup = document.getElementById('vkFromGroup').checked;
    const signed = document.getElementById('vkSigned').checked;
    const ads = document.getElementById('vkAds').checked;
    
    // Validation
    if (!groupSelect.value) {
        alert('Выберите сообщество для публикации');
        return;
    }
    
    if (!messageInput.value.trim()) {
        alert('Введите текст публикации');
        return;
    }
    
    // Check if scheduling
    if (mode === 'schedule' && !scheduleInput.value) {
        alert('Выберите дату и время для запланированной публикации');
        return;
    }
    
    // Show status
    showVKStatus('Подготовка к публикации...');
    
    try {
        // Get group ID (negative for communities)
        const groupId = parseInt(groupSelect.value);
        const ownerId = -groupId;
        
        let attachments = [];
        
        // Upload photos if any
        if (selectedPhotos.length > 0) {
            showVKStatus('Загрузка изображений...');
            updateProgress(30);
            
            const photoAttachments = await uploadPhotosToVK(groupId);
            attachments = [...attachments, ...photoAttachments];
            
            updateProgress(60);
        }
        
        // Prepare post parameters
        const params = {
            owner_id: ownerId,
            message: messageInput.value.trim(),
            from_group: fromGroup ? 1 : 0,
            signed: signed ? 1 : 0,
            ads: ads ? 1 : 0,
            access_token: VK_ACCESS_TOKEN,
            v: VK_API_VERSION
        };
        
        // Add attachments if any
        if (attachments.length > 0) {
            params.attachments = attachments.join(',');
        }
        
        // Add schedule if needed
        if (mode === 'schedule' && scheduleInput.value) {
            const scheduleDate = new Date(scheduleInput.value);
            params.publish_date = Math.floor(scheduleDate.getTime() / 1000);
        }
        
        // Publish post
        showVKStatus('Публикация записи...');
        updateProgress(80);
        
        const publishResponse = await fetch('https://api.vk.com/method/wall.post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(params)
        });
        
        const publishData = await publishResponse.json();
        
        if (publishData.error) {
            throw new Error(`VK API Error: ${publishData.error.error_msg}`);
        }
        
        // Success
        updateProgress(100);
        showVKStatus('Публикация успешно завершена!', 'success');
        
        // Save to history and update stats
        await savePostToHistory(publishData.response, mode);
        await updateVKStats(publishData.response.post_id);
        
        // Clear form and show success message
        setTimeout(() => {
            hideVKStatus();
            
            if (mode === 'now') {
                alert('Запись успешно опубликована!');
            } else {
                alert('Запись успешно запланирована!');
            }
            
            // Clear form
            messageInput.value = '';
            selectedPhotos = [];
            updatePhotoPreview();
            updateCharCount();
            
            // Load updated stats
            loadVKStats();
            
        }, 2000);
        
    } catch (error) {
        console.error('Publishing error:', error);
        showVKStatus('Ошибка публикации: ' + error.message, 'error');
        
        setTimeout(() => {
            hideVKStatus();
        }, 3000);
    }
}

async function uploadPhotosToVK(groupId) {
    const attachments = [];
    
    for (const photo of selectedPhotos) {
        try {
            // Step 1: Get upload server
            const serverResponse = await fetch(`https://api.vk.com/method/photos.getWallUploadServer?group_id=${groupId}&access_token=${VK_ACCESS_TOKEN}&v=${VK_API_VERSION}`);
            const serverData = await serverResponse.json();
            
            if (serverData.error) {
                console.error('Server error:', serverData.error);
                continue;
            }
            
            const uploadUrl = serverData.response.upload_url;
            
            // Step 2: Upload photo
            const formData = new FormData();
            formData.append('photo', photo.file);
            
            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: formData
            });
            
            const uploadData = await uploadResponse.json();
            
            // Step 3: Save photo
            const saveParams = {
                group_id: groupId,
                server: uploadData.server,
                photo: uploadData.photo,
                hash: uploadData.hash,
                access_token: VK_ACCESS_TOKEN,
                v: VK_API_VERSION
            };
            
            const saveResponse = await fetch('https://api.vk.com/method/photos.saveWallPhoto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(saveParams)
            });
            
            const saveData = await saveResponse.json();
            
            if (saveData.error) {
                console.error('Save error:', saveData.error);
                continue;
            }
            
            const photoData = saveData.response[0];
            attachments.push(`photo${photoData.owner_id}_${photoData.id}`);
            
        } catch (error) {
            console.error('Photo upload error:', error);
        }
    }
    
    return attachments;
}

// Status management
function showVKStatus(message, type = 'loading') {
    const statusDiv = document.getElementById('vkStatus');
    const statusText = document.getElementById('vkStatusText');
    
    if (!statusDiv || !statusText) return;
    
    statusText.textContent = message;
    statusDiv.style.display = 'block';
    
    // Reset and set progress
    const progress = document.getElementById('vkProgress');
    if (progress) {
        progress.style.width = '0%';
        progress.style.background = type === 'error' ? '#dc3545' : 
                                  type === 'success' ? '#28a745' : 
                                  'linear-gradient(90deg, #4a76a8, #5b88bd)';
    }
    
    // Update icon
    const icon = statusDiv.querySelector('i');
    if (icon) {
        icon.className = type === 'error' ? 'fas fa-exclamation-circle' :
                        type === 'success' ? 'fas fa-check-circle' :
                        'fas fa-spinner fa-spin';
    }
}

function updateProgress(percent) {
    const progress = document.getElementById('vkProgress');
    if (progress) {
        progress.style.width = percent + '%';
    }
}

function hideVKStatus() {
    const statusDiv = document.getElementById('vkStatus');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

// Draft management
function saveVKDraft() {
    const draft = {
        message: document.getElementById('vkMessage').value,
        groupId: document.getElementById('vkGroupSelect').value,
        schedule: document.getElementById('vkSchedule').value,
        fromGroup: document.getElementById('vkFromGroup').checked,
        signed: document.getElementById('vkSigned').checked,
        photos: selectedPhotos.map(p => ({
            name: p.name,
            data: p.data
        })),
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(VK_STORAGE_KEYS.DRAFTS, JSON.stringify(draft));
    
    // Show notification
    showVKStatus('Черновик сохранен', 'success');
    setTimeout(hideVKStatus, 2000);
}

function loadVKDraft() {
    const draftStr = localStorage.getItem(VK_STORAGE_KEYS.DRAFTS);
    if (!draftStr) return;
    
    try {
        const draft = JSON.parse(draftStr);
        
        document.getElementById('vkMessage').value = draft.message || '';
        document.getElementById('vkGroupSelect').value = draft.groupId || '';
        document.getElementById('vkSchedule').value = draft.schedule || '';
        document.getElementById('vkFromGroup').checked = draft.fromGroup || false;
        document.getElementById('vkSigned').checked = draft.signed || false;
        
        if (draft.photos && draft.photos.length > 0) {
            selectedPhotos = draft.photos.map((p, i) => ({
                id: Date.now() + i,
                name: p.name,
                data: p.data,
                file: null // Can't restore File object
            }));
            updatePhotoPreview();
        }
        
        updateCharCount();
        
    } catch (error) {
        console.error('Error loading draft:', error);
    }
}

// Stats management
async function loadVKStats() {
    const groupSelect = document.getElementById('vkGroupSelect');
    if (!groupSelect || !groupSelect.value) return;
    
    const groupId = parseInt(groupSelect.value);
    
    try {
        // Get group stats from VK
        const statsResponse = await fetch(`https://api.vk.com/method/stats.get?group_id=${groupId}&interval=week&access_token=${VK_ACCESS_TOKEN}&v=${VK_API_VERSION}`);
        const statsData = await statsResponse.json();
        
        // Get last posts
        const postsResponse = await fetch(`https://api.vk.com/method/wall.get?owner_id=-${groupId}&count=5&access_token=${VK_ACCESS_TOKEN}&v=${VK_API_VERSION}`);
        const postsData = await postsResponse.json();
        
        // Update UI
        updateStatsUI(statsData.response, postsData.response);
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStatsUI(stats, posts) {
    // Update last post time
    const lastPostTime = document.getElementById('vkLastPostTime');
    if (lastPostTime && posts && posts.items && posts.items.length > 0) {
        const lastPost = posts.items[0];
        const date = new Date(lastPost.date * 1000);
        lastPostTime.textContent = date.toLocaleDateString('ru-RU');
    }
    
    // Update scheduled count
    const scheduledCount = document.getElementById('vkScheduledCount');
    if (scheduledCount && posts && posts.items) {
        const scheduled = posts.items.filter(post => post.post_type === 'postponed').length;
        scheduledCount.textContent = scheduled;
    }
    
    // Update average likes
    const avgLikes = document.getElementById('vkAvgLikes');
    if (avgLikes && posts && posts.items && posts.items.length > 0) {
        const totalLikes = posts.items.reduce((sum, post) => sum + (post.likes?.count || 0), 0);
        const average = Math.round(totalLikes / posts.items.length);
        avgLikes.textContent = average.toLocaleString();
    }
}

async function savePostToHistory(response, mode) {
    const history = JSON.parse(localStorage.getItem(VK_STORAGE_KEYS.STATS) || '[]');
    
    const postInfo = {
        id: response.post_id,
        date: new Date().toISOString(),
        mode: mode,
        groupId: currentGroupId
    };
    
    history.push(postInfo);
    
    // Keep only last 100 posts
    if (history.length > 100) {
        history.shift();
    }
    
    localStorage.setItem(VK_STORAGE_KEYS.STATS, JSON.stringify(history));
    localStorage.setItem(VK_STORAGE_KEYS.LAST_POST, new Date().toISOString());
}

async function updateVKStats(postId) {
    // This would be called after successful post to update local stats
    const stats = JSON.parse(localStorage.getItem('vk_posts_stats') || '{}');
    
    if (!stats[currentGroupId]) {
        stats[currentGroupId] = {
            totalPosts: 0,
            lastMonthPosts: 0,
            avgLikes: 0,
            avgReach: 0
        };
    }
    
    stats[currentGroupId].totalPosts++;
    stats[currentGroupId].lastPost = new Date().toISOString();
    
    localStorage.setItem('vk_posts_stats', JSON.stringify(stats));
}

// Preview functionality
function openVKPreview() {
    const message = document.getElementById('vkMessage').value;
    const groupSelect = document.getElementById('vkGroupSelect');
    const selectedOption = groupSelect.selectedOptions[0];
    
    if (!message.trim() && selectedPhotos.length === 0) {
        alert('Нет данных для предпросмотра');
        return;
    }
    
    let previewHtml = `
        <div class="vk-preview">
            <div class="vk-preview-header">
                <div class="vk-avatar">${selectedOption?.dataset.name?.charAt(0) || 'G'}</div>
                <div>
                    <div style="font-weight: bold;">${selectedOption?.textContent || 'Сообщество'}</div>
                    <div style="font-size: 12px; color: #65676b;">только что</div>
                </div>
            </div>
            <div class="vk-preview-body">
    `;
    
    if (message.trim()) {
        previewHtml += `<div class="vk-preview-text">${message.replace(/\n/g, '<br>')}</div>`;
    }
    
    if (selectedPhotos.length > 0) {
        previewHtml += `<div class="vk-preview-image"><img src="${selectedPhotos[0].data}" alt="Preview"></div>`;
    }
    
    previewHtml += `
            </div>
            <div class="vk-preview-stats">
                <span><i class="far fa-thumbs-up"></i> 0</span>
                <span><i class="far fa-comment"></i> 0</span>
                <span><i class="far fa-share-square"></i> 0</span>
            </div>
        </div>
    `;
    
    // Show in modal
    const modal = document.getElementById('vkPreviewModal');
    const content = document.getElementById('vkPreviewContent');
    
    if (modal && content) {
        content.innerHTML = previewHtml;
        modal.style.display = 'block';
    } else {
        // Create modal if doesn't exist
        showPreviewModal(previewHtml);
    }
}

function showPreviewModal(html) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'tempVKPreviewModal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Предпросмотр публикации ВКонтакте</h2>
                <button class="modal-close" onclick="document.getElementById('tempVKPreviewModal').remove()">×</button>
            </div>
            <div>${html}</div>
            <div class="modal-actions" style="padding: 20px; text-align: center;">
                <button class="btn btn-primary" onclick="publishToVK('now')">
                    <i class="fas fa-paper-plane"></i> Опубликовать
                </button>
                <button class="btn btn-outline" onclick="document.getElementById('tempVKPreviewModal').remove()">
                    Закрыть
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}