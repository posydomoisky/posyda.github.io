// quick_vk_poster.js - Максимально простая публикация
const QUICK_VK_TOKEN = 'vk1.a.Dx2Q9eBUtyAznTAfQ_NaZP48G_WO0QtpV390AVQ4jvH4evJNUtOL9V2MrZ6ssAmm_DxDkGB3UzJKdYlKsT1ntAUHtvUYL6ItJMk9dB8bg7OZTqhFrDZesWNe35Z62TFvaCUCLbCenYivke-rgetpAH0RkNGkRqfVTyFQHGWceabFUA5eQh_3Ywm6hif80sXhm4rJSUAcqyknYLSfB3wwBg';

// Создаем плавающую кнопку для быстрой публикации
function createQuickVKButton() {
    const button = document.createElement('button');
    button.id = 'quickVKButton';
    button.innerHTML = `
        <i class="fab fa-vk"></i>
        <span>Опубликовать хуйню</span>
    `;
    
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #4a76a8, #5b88bd);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 15px 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(74, 118, 168, 0.4);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        transition: all 0.3s;
    `;
    
    button.onmouseenter = () => {
        button.style.transform = 'translateY(-3px)';
        button.style.boxShadow = '0 6px 20px rgba(74, 118, 168, 0.6)';
    };
    
    button.onmouseleave = () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 15px rgba(74, 118, 168, 0.4)';
    };
    
    button.onclick = openQuickVKPoster;
    
    document.body.appendChild(button);
}

// Открытие быстрого публикатора
function openQuickVKPoster() {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.id = 'quickVKModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; width: 90%; max-width: 500px; padding: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #1e293b;">
                    <i class="fab fa-vk" style="color: #4a76a8;"></i>
                    Быстрая публикация
                </h2>
                <button onclick="document.getElementById('quickVKModal').remove()" 
                        style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">
                    ×
                </button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #1e293b;">
                    Твоя хуйня:
                </label>
                <textarea id="quickVKText" 
                          placeholder="Введи любую дичь... 😈" 
                          style="width: 100%; padding: 15px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; min-height: 150px; resize: vertical;"></textarea>
            </div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <label style="flex: 1;">
                    <input type="checkbox" id="quickAddMemes" checked>
                    Добавить рандомные хештеги
                </label>
                <label style="flex: 1;">
                    <input type="checkbox" id="quickAddGif">
                    Добавить GIF
                </label>
            </div>
            
            <div style="margin-bottom: 25px;">
                <button onclick="generateRandomShit()" 
                        style="background: #fbbf24; color: #1e293b; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; margin-right: 10px;">
                    <i class="fas fa-dice"></i> Сгенерировать хуйню
                </button>
                <button onclick="addRandomHashtags()"
                        style="background: #a78bfa; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-hashtag"></i> Добавить хештеги
                </button>
            </div>
            
            <div style="display: flex; gap: 15px;">
                <button onclick="document.getElementById('quickVKModal').remove()" 
                        style="flex: 1; background: #ef4444; color: white; border: none; padding: 15px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                    <i class="fas fa-times"></i> Отмена
                </button>
                <button onclick="quickPublishToVK()" 
                        style="flex: 2; background: #4a76a8; color: white; border: none; padding: 15px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                    <i class="fas fa-paper-plane"></i> Залить эту хуйню в VK!
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Фокусируемся на текстовом поле
    setTimeout(() => {
        document.getElementById('quickVKText').focus();
    }, 100);
}

// Генерация рандомной хуйни
function generateRandomShit() {
    const phrases = [
        "Только что узнал, что у меня аллергия на работу 😂",
        "Мой код работает, но я не знаю почему... как и всё в этой жизни 🤷‍♂️",
        "Если бы у меня был рубль за каждую ошибку в коде, я бы уже не кодил 🤑",
        "Программисты не умирают, они просто теряют свои сессии 💀",
        "Жизнь — это баг, смерть — это фича 🔥",
        "Я не ленивый, я на энергосберегающем режиме 🥱",
        "Мой уровень стресса: пытаться скопировать текст из модального окна 😭",
        "Если бы кринж был электричеством, я бы питал целый город 🌃",
        "Иногда мне кажется, что мой код страдает от депрессии 😔",
        "Я не прокрастинирую, я просто жду правильного вдохновения ✨",
        "Сегодняшнее настроение: кофе, код и кринж ☕💻😬",
        "Моя жизнь — это бесконечный цикл while(true) { ... } 🔄",
        "Если бы глупость была суперсилой, я был бы супергероем 🦸‍♂️",
        "Я не странный, я ограниченная серия 🎨",
        "Мозг: думай о работе. Я: думаю о том, как бы не работать 🧠💭"
    ];
    
    const gifs = [
        "🎮", "🤡", "💩", "👑", "🐒", "🚀", "💣", "🍕", "🥴", "🤯",
        "👽", "🦄", "🍆", "💦", "🔥", "❄️", "⭐", "🌈", "🎯", "⚡"
    ];
    
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    
    document.getElementById('quickVKText').value = `${randomPhrase} ${randomGif}`;
}

// Добавление рандомных хештегов
function addRandomHashtags() {
    const hashtags = [
        "#кринж", "#ахахах", #лох", "#понедельник", "#жуть",
        "#смех", "#слезы", #пиздец", "#реально", "#вау",
        "#шок", "#угар", #прикол", "#жесть", "#ор",
        "#смешно", "#грустно", #странно", "#норм", "#ого"
    ];
    
    const randomHashtags = [];
    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * hashtags.length);
        randomHashtags.push(hashtags[randomIndex]);
    }
    
    const textarea = document.getElementById('quickVKText');
    textarea.value = textarea.value + '\n\n' + randomHashtags.join(' ') + '\n#УчебаВместе #Рандом';
}

// Быстрая публикация
async function quickPublishToVK() {
    const text = document.getElementById('quickVKText').value.trim();
    const addMemes = document.getElementById('quickAddMemes').checked;
    const addGif = document.getElementById('quickAddGif').checked;
    
    if (!text) {
        alert('Напиши хоть какую-то хуйню!');
        return;
    }
    
    // Добавляем хештеги если нужно
    let finalText = text;
    if (addMemes) {
        finalText += '\n\n#прикол #шуточка #смех #кринж #УчебаВместе';
    }
    
    if (addGif) {
        const gifs = ["😂", "🤣", "😭", "💀", "🔥", "✨", "🥴", "🤯"];
        finalText += ' ' + gifs[Math.floor(Math.random() * gifs.length)];
    }
    
    // Показываем загрузку
    const modal = document.getElementById('quickVKModal');
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; width: 90%; max-width: 500px; padding: 25px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <div class="spinner" style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #4a76a8; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <h3 style="margin: 0; color: #1e293b;">Заливаем хуйню в VK...</h3>
                <p style="color: #64748b; margin-top: 10px;">Это может занять пару секунд</p>
            </div>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        </div>
    `;
    
    try {
        // Здесь можно добавить выбор группы, но для простоты используем первую доступную
        // Сначала получаем группы пользователя
        const groupsResponse = await fetch(`https://api.vk.com/method/groups.get?access_token=${QUICK_VK_TOKEN}&filter=admin&extended=1&v=5.199`);
        const groupsData = await groupsResponse.json();
        
        if (groupsData.error) {
            throw new Error(groupsData.error.error_msg);
        }
        
        const groups = groupsData.response.items;
        if (!groups || groups.length === 0) {
            throw new Error('Нет доступных сообществ');
        }
        
        const groupId = groups[0].id;
        
        // Публикуем пост
        const params = new URLSearchParams({
            owner_id: `-${groupId}`,
            message: finalText,
            from_group: 1,
            access_token: QUICK_VK_TOKEN,
            v: '5.199'
        });
        
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
        
        // Успех!
        modal.innerHTML = `
            <div style="background: white; border-radius: 15px; width: 90%; max-width: 500px; padding: 25px; text-align: center;">
                <div style="margin-bottom: 20px;">
                    <div style="width: 80px; height: 80px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-check" style="font-size: 40px; color: white;"></i>
                    </div>
                    <h3 style="margin: 0; color: #1e293b;">Успех! 🎉</h3>
                    <p style="color: #64748b; margin-top: 10px;">Твоя хуйня успешно залита в VK!</p>
                    <p style="color: #4a76a8; font-weight: bold; margin-top: 10px;">ID поста: ${data.response.post_id}</p>
                </div>
                
                <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left;">
                    <p style="margin: 0; color: #1e293b; font-weight: bold;">Опубликовано:</p>
                    <p style="margin: 10px 0 0 0; color: #64748b;">${finalText.substring(0, 100)}${finalText.length > 100 ? '...' : ''}</p>
                </div>
                
                <button onclick="location.reload()" 
                        style="background: #4a76a8; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%;">
                    <i class="fas fa-redo"></i> Опубликовать ещё
                </button>
            </div>
        `;
        
    } catch (error) {
        modal.innerHTML = `
            <div style="background: white; border-radius: 15px; width: 90%; max-width: 500px; padding: 25px; text-align: center;">
                <div style="margin-bottom: 20px;">
                    <div style="width: 80px; height: 80px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-times" style="font-size: 40px; color: white;"></i>
                    </div>
                    <h3 style="margin: 0; color: #1e293b;">Ошибка! 😭</h3>
                    <p style="color: #64748b; margin-top: 10px;">${error.message}</p>
                </div>
                
                <div style="display: flex; gap: 15px;">
                    <button onclick="document.getElementById('quickVKModal').remove()" 
                            style="flex: 1; background: #ef4444; color: white; border: none; padding: 15px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                        Закрыть
                    </button>
                    <button onclick="openQuickVKPoster()" 
                            style="flex: 1; background: #4a76a8; color: white; border: none; padding: 15px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                        Попробовать снова
                    </button>
                </div>
            </div>
        `;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    createQuickVKButton();
    
    // Добавляем FontAwesome если нет
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(faLink);
    }
});