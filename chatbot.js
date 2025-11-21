// Chatbot Configuration
class ChatbotConfig {
    constructor() {
        this.config = this.loadConfig();
        this.initializeEventListeners();
    }

    loadConfig() {
        const defaultConfig = {
            n8nWebhookUrl: '',
            apiKey: '',
            botName: 'AI Assistant',
            welcomeMessage: "Hello! I'm your AI assistant. How can I help you today?",
            soundEnabled: true,
            darkMode: false,
            // New configurable prompt cards
            promptCards: [
                {
                    id: 1,
                    icon: 'fas fa-file-contract',
                    title: 'RFP Analysis',
                    prompt: 'Analyze this RFP document and provide key requirements, evaluation criteria, and strategic recommendations',
                    enabled: true
                },
                {
                    id: 2,
                    icon: 'fas fa-lightbulb',
                    title: 'Proposal Strategy',
                    prompt: 'Help me develop a winning proposal strategy including competitive analysis and differentiation points',
                    enabled: true
                },
                {
                    id: 3,
                    icon: 'fas fa-chart-line',
                    title: 'Cost Estimation',
                    prompt: 'Assist with RFP cost estimation and pricing strategy for competitive bidding',
                    enabled: true
                },
                {
                    id: 4,
                    icon: 'fas fa-users',
                    title: 'Team Assembly',
                    prompt: 'Help me identify key team members and roles needed for this RFP response',
                    enabled: true
                }
            ],
            // RFP Agent settings
            rfpAgent: {
                enabled: true,
                analysisDepth: 'detailed', // 'basic', 'detailed', 'comprehensive'
                includeCompetitiveAnalysis: true,
                includeRiskAssessment: true,
                generateTimeline: true
            }
        };
        
        const saved = localStorage.getItem('chatbot-config');
        return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    }

    saveConfig(config) {
        this.config = { ...this.config, ...config };
        localStorage.setItem('chatbot-config', JSON.stringify(this.config));
        this.updateUI();
    }

    updateUI() {
        const chatTitle = document.getElementById('chatTitle');
        if (chatTitle) {
            chatTitle.textContent = this.config.botName;
        }
    }

    initializeEventListeners() {
        const configBtn = document.getElementById('configBtn');
        const helpBtn = document.getElementById('helpBtn');
        const configModal = document.getElementById('configModal');
        const helpModal = document.getElementById('helpModal');
        const closeConfigModal = document.getElementById('closeConfigModal');
        const closeHelpModal = document.getElementById('closeHelpModal');
        const saveConfig = document.getElementById('saveConfig');
        const cancelConfig = document.getElementById('cancelConfig');
        const closeHelp = document.getElementById('closeHelp');

        configBtn.addEventListener('click', () => this.openConfigModal());
        helpBtn.addEventListener('click', () => this.openHelpModal());
        closeConfigModal.addEventListener('click', () => this.closeConfigModal());
        closeHelpModal.addEventListener('click', () => this.closeHelpModal());
        cancelConfig.addEventListener('click', () => this.closeConfigModal());
        saveConfig.addEventListener('click', () => this.saveConfiguration());
        closeHelp.addEventListener('click', () => this.closeHelpModal());

        // Close modal on outside click
        configModal.addEventListener('click', (e) => {
            if (e.target === configModal) {
                this.closeConfigModal();
            }
        });

        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                this.closeHelpModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                this.openConfigModal();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.openHelpModal();
            }
        });
    }

    openConfigModal() {
        const modal = document.getElementById('configModal');
        document.getElementById('n8nWebhookUrl').value = this.config.n8nWebhookUrl;
        document.getElementById('apiKey').value = this.config.apiKey;
        document.getElementById('botName').value = this.config.botName;
        document.getElementById('welcomeMessage').value = this.config.welcomeMessage;
        document.getElementById('soundEnabled').checked = this.config.soundEnabled;
        document.getElementById('darkMode').checked = this.config.darkMode;
        
        // Load RFP Agent settings
        if (document.getElementById('rfpAgentEnabled')) {
            document.getElementById('rfpAgentEnabled').checked = this.config.rfpAgent?.enabled || true;
            document.getElementById('analysisDepth').value = this.config.rfpAgent?.analysisDepth || 'detailed';
            document.getElementById('includeCompetitiveAnalysis').checked = this.config.rfpAgent?.includeCompetitiveAnalysis || true;
            document.getElementById('includeRiskAssessment').checked = this.config.rfpAgent?.includeRiskAssessment || true;
            document.getElementById('generateTimeline').checked = this.config.rfpAgent?.generateTimeline || true;
        }
        
        // Load prompt cards configuration
        this.loadPromptCardsConfig();
        
        modal.classList.add('active');
    }

    loadPromptCardsConfig() {
        const container = document.getElementById('promptCardsConfig');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.config.promptCards.forEach((card, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'prompt-card-config';
            cardDiv.innerHTML = `
                <div class="prompt-card-header">
                    <label class="checkbox-label">
                        <input type="checkbox" class="prompt-card-enabled" ${card.enabled ? 'checked' : ''} data-index="${index}">
                        <span class="checkmark"></span>
                        Prompt Card ${index + 1}
                    </label>
                    <button type="button" class="remove-prompt-card" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="prompt-card-fields">
                    <div class="form-group">
                        <label>Icon (Font Awesome class):</label>
                        <input type="text" class="prompt-card-icon" value="${card.icon}" data-index="${index}" placeholder="fas fa-lightbulb">
                    </div>
                    <div class="form-group">
                        <label>Title:</label>
                        <input type="text" class="prompt-card-title" value="${card.title}" data-index="${index}" placeholder="Card Title">
                    </div>
                    <div class="form-group">
                        <label>Prompt Text:</label>
                        <textarea class="prompt-card-prompt" data-index="${index}" rows="3" placeholder="Enter the prompt text...">${card.prompt}</textarea>
                    </div>
                </div>
            `;
            
            container.appendChild(cardDiv);
        });
        
        // Add event listeners for prompt card controls
        this.initializePromptCardListeners();
    }

    initializePromptCardListeners() {
        const container = document.getElementById('promptCardsConfig');
        if (!container) return;
        
        // Remove card buttons
        container.querySelectorAll('.remove-prompt-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                this.removePromptCard(index);
            });
        });
        
        // Add new card button
        const addBtn = document.getElementById('addPromptCard');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addPromptCard());
        }
    }

    addPromptCard() {
        const newCard = {
            id: Date.now(),
            icon: 'fas fa-lightbulb',
            title: 'New Prompt',
            prompt: 'Enter your prompt here...',
            enabled: true
        };
        
        this.config.promptCards.push(newCard);
        this.loadPromptCardsConfig();
    }

    removePromptCard(index) {
        if (confirm('Are you sure you want to remove this prompt card?')) {
            this.config.promptCards.splice(index, 1);
            this.loadPromptCardsConfig();
        }
    }

    saveConfiguration() {
        const newConfig = {
            n8nWebhookUrl: document.getElementById('n8nWebhookUrl').value.trim(),
            apiKey: document.getElementById('apiKey').value.trim(),
            botName: document.getElementById('botName').value.trim() || 'AI Assistant',
            welcomeMessage: document.getElementById('welcomeMessage').value.trim() || "Hello! I'm your AI assistant. How can I help you today?",
            soundEnabled: document.getElementById('soundEnabled').checked,
            darkMode: document.getElementById('darkMode').checked
        };

        // Save RFP Agent settings
        if (document.getElementById('rfpAgentEnabled')) {
            newConfig.rfpAgent = {
                enabled: document.getElementById('rfpAgentEnabled').checked,
                analysisDepth: document.getElementById('analysisDepth').value,
                includeCompetitiveAnalysis: document.getElementById('includeCompetitiveAnalysis').checked,
                includeRiskAssessment: document.getElementById('includeRiskAssessment').checked,
                generateTimeline: document.getElementById('generateTimeline').checked
            };
        }

        // Save prompt cards configuration
        const promptCardsConfig = [];
        document.querySelectorAll('.prompt-card-config').forEach((cardDiv, index) => {
            const enabled = cardDiv.querySelector('.prompt-card-enabled').checked;
            const icon = cardDiv.querySelector('.prompt-card-icon').value.trim();
            const title = cardDiv.querySelector('.prompt-card-title').value.trim();
            const prompt = cardDiv.querySelector('.prompt-card-prompt').value.trim();
            
            if (title && prompt) {
                promptCardsConfig.push({
                    id: this.config.promptCards[index]?.id || Date.now() + index,
                    icon: icon || 'fas fa-lightbulb',
                    title,
                    prompt,
                    enabled
                });
            }
        });
        
        newConfig.promptCards = promptCardsConfig;

        this.saveConfig(newConfig);
        this.closeConfigModal();
        
        // Update prompt cards on welcome screen
        this.updatePromptCards();
        
        // Show success message
        this.showNotification('Configuration saved successfully!', 'success');
    }

    updatePromptCards() {
        const promptGrid = document.querySelector('.prompt-grid');
        if (!promptGrid) return;
        
        promptGrid.innerHTML = '';
        
        this.config.promptCards
            .filter(card => card.enabled)
            .forEach(card => {
                const button = document.createElement('button');
                button.className = 'prompt-card';
                button.setAttribute('data-prompt', card.prompt);
                button.innerHTML = `
                    <i class="${card.icon}"></i>
                    <span>${card.title}</span>
                `;
                
                button.addEventListener('click', () => {
                    const messageInput = document.getElementById('messageInput');
                    messageInput.value = card.prompt;
                    if (window.chatManager) {
                        window.chatManager.sendMessage();
                    }
                });
                
                promptGrid.appendChild(button);
            });
    }

    closeConfigModal() {
        document.getElementById('configModal').classList.remove('active');
    }

    openHelpModal() {
        document.getElementById('helpModal').classList.add('active');
    }

    closeHelpModal() {
        document.getElementById('helpModal').classList.remove('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Chat History Manager
class ChatHistoryManager {
    constructor() {
        this.chats = this.loadChats();
        this.currentChatId = null;
    }

    loadChats() {
        const saved = localStorage.getItem('chat-history');
        return saved ? JSON.parse(saved) : [];
    }

    saveChats() {
        localStorage.setItem('chat-history', JSON.stringify(this.chats));
        this.updateHistoryUI();
    }

    createNewChat() {
        const chatId = 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const newChat = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.chats.unshift(newChat);
        this.currentChatId = chatId;
        this.saveChats();
        return chatId;
    }

    updateChatTitle(chatId, title) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.title = title;
            chat.updatedAt = new Date();
            this.saveChats();
        }
    }

    addMessageToChat(chatId, message) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.messages.push(message);
            chat.updatedAt = new Date();
            
            // Update title based on first user message
            if (chat.title === 'New Chat' && message.type === 'user') {
                const title = message.text.length > 50 
                    ? message.text.substring(0, 50) + '...' 
                    : message.text;
                this.updateChatTitle(chatId, title);
            }
            
            this.saveChats();
        }
    }

    getCurrentChat() {
        return this.chats.find(c => c.id === this.currentChatId);
    }

    switchToChat(chatId) {
        this.currentChatId = chatId;
        this.updateHistoryUI();
    }

    deleteChat(chatId) {
        const chatIndex = this.chats.findIndex(c => c.id === chatId);
        if (chatIndex !== -1) {
            this.chats.splice(chatIndex, 1);
            
            // If we deleted the current chat, switch to the most recent one or clear
            if (this.currentChatId === chatId) {
                if (this.chats.length > 0) {
                    this.currentChatId = this.chats[0].id;
                    window.chatManager.loadChatMessages(this.currentChatId);
                } else {
                    this.currentChatId = null;
                    window.chatManager.showWelcomeScreen();
                    window.chatManager.clearMessages();
                }
            }
            
            this.saveChats();
            return true;
        }
        return false;
    }

    updateHistoryUI() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';

        this.chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = `history-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            item.setAttribute('data-chat-id', chat.id);
            
            const timeAgo = this.getTimeAgo(new Date(chat.updatedAt));
            
            item.innerHTML = `
                <div class="history-item-content">
                    <div class="history-item-title">${chat.title}</div>
                    <div class="history-item-time">${timeAgo}</div>
                </div>
                <div class="history-item-actions">
                    <button class="delete-chat-btn" title="Delete conversation">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add click handler for the chat item (not the delete button)
            const chatContent = item.querySelector('.history-item-content');
            chatContent.addEventListener('click', () => {
                this.switchToChat(chat.id);
                window.chatManager.loadChatMessages(chat.id);
            });
            
            // Add click handler for the delete button
            const deleteBtn = item.querySelector('.delete-chat-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the chat switch
                this.confirmDeleteChat(chat.id, chat.title);
            });
            
            historyList.appendChild(item);
        });
    }

    confirmDeleteChat(chatId, chatTitle) {
        const shortTitle = chatTitle.length > 30 ? chatTitle.substring(0, 30) + '...' : chatTitle;
        
        if (confirm(`Are you sure you want to delete the conversation "${shortTitle}"?\n\nThis action cannot be undone.`)) {
            const deleted = this.deleteChat(chatId);
            if (deleted) {
                // Show notification
                if (window.chatManager && window.chatManager.config) {
                    window.chatManager.config.showNotification('Conversation deleted successfully', 'success');
                }
            }
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }
}

// Enhanced Chat Manager
class ChatManager {
    constructor(config, historyManager) {
        this.config = config;
        this.historyManager = historyManager;
        this.isWelcomeScreen = true;
        this.contentViewer = new ContentViewer(); // Add content viewer
        this.initializeEventListeners();
        this.initializeTextarea();
        this.updateUI();
    }

    initializeEventListeners() {
        // Sidebar controls
        const newChatBtn = document.getElementById('newChatBtn');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');

        newChatBtn.addEventListener('click', () => this.startNewChat());
        sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        sidebarToggleBtn.addEventListener('click', () => this.toggleSidebar());

        // Message handling
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');
        const attachBtn = document.getElementById('attachBtn');

        sendBtn.addEventListener('click', () => this.sendMessage());
        attachBtn.addEventListener('click', () => this.handleAttachment());
        
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        messageInput.addEventListener('input', () => {
            this.updateSendButton();
            this.updateCharCount();
            this.adjustTextareaHeight();
        });

        // Suggested prompts
        const promptCards = document.querySelectorAll('.prompt-card');
        promptCards.forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.getAttribute('data-prompt');
                messageInput.value = prompt;
                this.sendMessage();
            });
        });

        // Close sidebar on outside click (mobile)
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
            
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !mobileSidebarToggle.contains(e.target) &&
                !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
            }
        });
    }

    initializeTextarea() {
        const messageInput = document.getElementById('messageInput');
        this.adjustTextareaHeight();
    }

    adjustTextareaHeight() {
        const messageInput = document.getElementById('messageInput');
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        sendBtn.disabled = !messageInput.value.trim();
    }

    updateCharCount() {
        const messageInput = document.getElementById('messageInput');
        const charCount = document.getElementById('charCount');
        const currentLength = messageInput.value.length;
        charCount.textContent = `${currentLength}/4000`;
        
        if (currentLength > 3800) {
            charCount.style.color = '#ef4444';
        } else {
            charCount.style.color = '#666';
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebarToggleBtn');
        
        sidebar.classList.toggle('collapsed');
        
        // Show/hide toggle button based on sidebar state
        if (sidebar.classList.contains('collapsed')) {
            toggleBtn.classList.add('visible');
        } else {
            toggleBtn.classList.remove('visible');
        }
    }

    updateUI() {
        document.getElementById('chatTitle').textContent = this.config.config.botName;
    }

    startNewChat() {
        const chatId = this.historyManager.createNewChat();
        this.showWelcomeScreen();
        this.clearMessages();
        
        // Close sidebar on mobile after creating new chat
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.add('collapsed');
        }
    }

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'flex';
        document.getElementById('messagesContainer').style.display = 'none';
        this.isWelcomeScreen = true;
    }

    hideWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('messagesContainer').style.display = 'block';
        this.isWelcomeScreen = false;
    }

    clearMessages() {
        const messagesList = document.getElementById('messagesList');
        messagesList.innerHTML = '';
    }

    loadChatMessages(chatId) {
        const chat = this.historyManager.chats.find(c => c.id === chatId);
        if (chat) {
            this.clearMessages();
            this.hideWelcomeScreen();
            
            chat.messages.forEach(message => {
                this.addMessageToDOM(message.text, message.type, message.timestamp);
            });
            
            this.scrollToBottom();
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;

        // Ensure we have a current chat
        if (!this.historyManager.currentChatId) {
            this.historyManager.createNewChat();
        }

        // Hide welcome screen
        if (this.isWelcomeScreen) {
            this.hideWelcomeScreen();
        }

        // Clear input
        messageInput.value = '';
        this.updateSendButton();
        this.updateCharCount();
        this.adjustTextareaHeight();

        // Add user message
        const userMessage = {
            text: message,
            type: 'user',
            timestamp: new Date()
        };
        
        this.addMessageToDOM(message, 'user');
        this.historyManager.addMessageToChat(this.historyManager.currentChatId, userMessage);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            let response;
            if (this.config.config.n8nWebhookUrl) {
                response = await this.sendToN8N(message);
            } else {
                response = await this.getFallbackResponse(message);
            }
            
            this.hideTypingIndicator();
            
            const botMessage = {
                text: response,
                type: 'bot',
                timestamp: new Date()
            };
            
            this.addMessageToDOM(response, 'bot');
            this.historyManager.addMessageToChat(this.historyManager.currentChatId, botMessage);

            // Play sound notification if enabled
            if (this.config.config.soundEnabled) {
                this.playNotificationSound();
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            const errorMessage = 'Sorry, I encountered an error. Please try again later.';
            this.addMessageToDOM(errorMessage, 'bot');
            
            const botMessage = {
                text: errorMessage,
                type: 'bot',
                timestamp: new Date()
            };
            this.historyManager.addMessageToChat(this.historyManager.currentChatId, botMessage);
        }
    }

    async sendToN8N(message) {
        const payload = {
            message: message,
            n8nUrl: this.config.config.n8nWebhookUrl, // dynamic per user
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            chatId: this.historyManager.currentChatId
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.config.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.config.apiKey}`;
            headers['X-API-Key'] = this.config.config.apiKey;
        }

        const response = await fetch('https://rfp-bot.pages.dev/n8n/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response is streaming (Server-Sent Events)
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/plain') || contentType.includes('application/x-ndjson')) {
            return await this.handleStreamingResponse(response);
        }

        // Get response text first to check if it's empty
        const responseText = await response.text();
        
        if (!responseText || responseText.trim() === '') {
            return 'I received your message but got an empty response from the server. Please check your N8N workflow configuration.';
        }

        // Check if response contains multiple JSON objects (streaming format)
        if (this.isStreamingFormat(responseText)) {
            return this.parseStreamingResponse(responseText);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (jsonError) {
            // If JSON parsing fails, treat the response as plain text
            console.warn('Response is not valid JSON, treating as plain text:', responseText);
            return responseText;
        }
        
        if (data.message) {
            return data.message;
        } else if (data.response) {
            return data.response;
        } else if (data.text) {
            return data.text;
        } else if (typeof data === 'string') {
            return data;
        } else {
            return 'Thank you for your message! I\'ve received it successfully.';
        }
    }

    async handleStreamingResponse(response) {
        // Hide the typing indicator since we'll show streaming instead
        this.hideTypingIndicator();
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let allContent = '';
        let currentMessageId = this.createStreamingMessagePlaceholder();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.trim() === '') continue;
                    
                    try {
                        const data = JSON.parse(line);
                        
                        if (data.type === 'item' && data.content) {
                            allContent += data.content;
                            // Simulate typing effect by adding content gradually
                            await this.typeContent(currentMessageId, allContent);
                        }
                    } catch (e) {
                        console.log('Non-JSON line:', line);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        // Finalize the message
        if (currentMessageId) {
            this.finalizeStreamingMessage(currentMessageId, allContent);
        }

        return allContent || 'Streaming completed but no content received.';
    }

    async typeContent(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const contentElement = messageElement.querySelector('.streaming-content');
        if (!contentElement) return;

        // Update content immediately with typing cursor effect
        contentElement.innerHTML = this.formatMessage(content);
        this.scrollToBottom();
        
        // Add a small delay to simulate typing speed
        await new Promise(resolve => setTimeout(resolve, 30));
    }

    isStreamingFormat(text) {
        // Check if text contains multiple JSON objects (typical streaming format)
        const lines = text.trim().split('\n');
        let jsonCount = 0;
        
        for (const line of lines) {
            if (line.trim() === '') continue;
            try {
                const data = JSON.parse(line);
                if (data.type && ['begin', 'item', 'end'].includes(data.type)) {
                    jsonCount++;
                }
            } catch (e) {
                // Not JSON, continue
            }
        }
        
        return jsonCount >= 2; // If we have at least 2 streaming JSON objects
    }

    parseStreamingResponse(text) {
        const lines = text.trim().split('\n');
        let content = '';
        
        for (const line of lines) {
            if (line.trim() === '') continue;
            
            try {
                const data = JSON.parse(line);
                if (data.type === 'item' && data.content) {
                    content += data.content;
                }
            } catch (e) {
                // If line is not valid JSON, append as plain text
                content += line + '\n';
            }
        }
        
        return content.trim() || 'Streaming response received but no content extracted.';
    }

    async getFallbackResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! Welcome to RFP Assistant. Please configure N8N integration for full functionality.";
        } else if (lowerMessage.includes('help')) {
            return "I'm here to help! To enable advanced features, please set up the N8N webhook URL in settings. You can access settings from the sidebar or press Ctrl+, (Cmd+, on Mac).";
        } else if (lowerMessage.includes('config') || lowerMessage.includes('setup') || lowerMessage.includes('n8n')) {
            return "🔧 **N8N Configuration Required**\n\nTo enable intelligent responses:\n\n1. Open Settings (Ctrl+, or sidebar)\n2. Enter your N8N webhook URL\n3. Optionally add API key for authentication\n4. Save configuration\n\nOnce configured, I'll be able to provide intelligent responses through your N8N workflows!";
        } else {
            return "I'm currently running in demo mode. To unlock full AI capabilities, please configure your N8N webhook URL in the settings. You can access settings from the sidebar or press Ctrl+, (Cmd+, on Mac).";
        }
    }

    addMessageToDOM(text, type, timestamp) {
        const messagesList = document.getElementById('messagesList');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const time = timestamp ? new Date(timestamp) : new Date();
        const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const author = type === 'user' ? 'You' : this.config.config.botName;
        
        // Check if message contains document or code content
        const contentType = this.contentViewer.detectContentType(text);
        let messageContent;
        
        if (contentType !== 'text') {
            // Create enhanced content viewer for documents/code
            messageContent = this.contentViewer.createContentViewer(text, contentType);
        } else {
            // Regular text message
            messageContent = `<p>${this.formatMessage(text)}</p>`;
        }
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">
                    <i class="fas ${type === 'user' ? 'fa-user' : 'fa-robot'}"></i>
                </div>
                <span class="message-author">${author}</span>
                <span class="message-time">${timeString}</span>
            </div>
            <div class="message-content">
                ${messageContent}
            </div>
        `;

        messagesList.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicatorContainer');
        if (indicator) {
            indicator.style.display = 'block';
        }
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicatorContainer');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    scrollToBottom() {
        const messagesWrapper = document.querySelector('.messages-wrapper');
        if (messagesWrapper) {
            setTimeout(() => {
                messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
            }, 100);
        }
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('chatbot-session');
        if (!sessionId) {
            sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('chatbot-session', sessionId);
        }
        return sessionId;
    }

    getUserId() {
        let userId = localStorage.getItem('chatbot-user-id');
        if (!userId) {
            userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatbot-user-id', userId);
        }
        return userId;
    }

    handleAttachment() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.md,.doc,.docx,.pdf';
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Show notification that file upload is not yet implemented
                this.config.showNotification('File upload feature coming soon!', 'info');
            }
        };
        
        fileInput.click();
    }

    playNotificationSound() {
        try {
            // Create a simple notification sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silently fail if audio context is not available
            console.log('Audio notification not available');
        }
    }
}

// Content Detection and Viewer Manager
class ContentViewer {
    constructor() {
        this.initializeEventListeners();
    }

    detectContentType(text) {
        // Clean the text for analysis
        const cleanText = text.trim();
        
        // Code detection patterns
        const codePatterns = [
            /^```[\s\S]*```$/m,           // Markdown code blocks
            /^\s*(function|class|def|public|private|protected|import|export|const|let|var|if|for|while)\s/m,
            /^\s*[{}\[\]();,]\s*$/m,      // Brackets and syntax characters on their own lines
            /^[\s]*<[^>]+>[\s\S]*<\/[^>]+>[\s]*$/m, // HTML/XML
            /^\s*#include\s|^\s*package\s|^\s*using\s/m, // C/Java/C# headers
            /{[\s\S]*}[\s]*$/m,           // JSON-like structures
            /^\s*SELECT\s|^\s*INSERT\s|^\s*UPDATE\s|^\s*DELETE\s/im // SQL
        ];

        // Document detection patterns
        const documentPatterns = [
            /^#\s+.+$/m,                  // Markdown headers
            /^\d+\.\s+.+$/m,             // Numbered lists
            /^[-*+]\s+.+$/m,             // Bullet lists
            /^[A-Z][A-Z\s]+:.*$/m,       // ALL CAPS headers (common in documents)
            /\b(abstract|introduction|conclusion|summary|overview|background|methodology|results|discussion)\b/i,
            /\b(executive summary|table of contents|appendix|references|bibliography)\b/i,
            /^(TITLE|SUBJECT|DATE|FROM|TO|RE):\s*.+$/mi // Document headers
        ];

        // Check for code first
        for (const pattern of codePatterns) {
            if (pattern.test(cleanText)) {
                return this.detectSpecificCodeType(cleanText);
            }
        }

        // Check for documents
        for (const pattern of documentPatterns) {
            if (pattern.test(cleanText)) {
                return 'document';
            }
        }

        // Check length and complexity for documents
        if (cleanText.length > 500 && this.hasDocumentStructure(cleanText)) {
            return 'document';
        }

        return 'text';
    }

    detectSpecificCodeType(text) {
        const languagePatterns = {
            'javascript': [/\b(function|const|let|var|=>|console\.log)\b/, /\.js$/],
            'python': [/\b(def|import|from|print|if __name__)\b/, /\.py$/],
            'html': [/<\/?[a-z][\s\S]*>/i, /\.html?$/],
            'css': [/\{[\s\S]*\}/, /\.css$/],
            'json': [/^[\s]*{[\s\S]*}[\s]*$/, /\.json$/],
            'sql': [/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/i, /\.sql$/],
            'java': [/\b(public|private|class|import java)\b/, /\.java$/],
            'csharp': [/\b(using|namespace|public class|private)\b/, /\.cs$/]
        };

        for (const [lang, patterns] of Object.entries(languagePatterns)) {
            for (const pattern of patterns) {
                if (pattern.test(text)) {
                    return `code-${lang}`;
                }
            }
        }

        return 'code-generic';
    }

    hasDocumentStructure(text) {
        const lines = text.split('\n');
        let hasHeaders = 0;
        let hasParagraphs = 0;
        let hasLists = 0;

        for (const line of lines) {
            if (line.match(/^#+\s|^[A-Z][A-Z\s]+:|\d+\.\s/)) hasHeaders++;
            if (line.length > 80 && !line.match(/^[\s]*[{}[\]();,][\s]*$/)) hasParagraphs++;
            if (line.match(/^[-*+]\s|^\d+\.\s/)) hasLists++;
        }

        return hasHeaders >= 2 || (hasParagraphs >= 3 && hasLists >= 1);
    }

    createContentViewer(content, contentType) {
        const viewerId = `content-viewer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        if (contentType === 'document') {
            return this.createDocumentViewer(content, viewerId);
        } else if (contentType.startsWith('code-')) {
            const language = contentType.split('-')[1];
            return this.createCodeEditor(content, language, viewerId);
        }

        // Fallback to regular text
        return `<p>${this.formatMessage(content)}</p>`;
    }

    createDocumentViewer(content, viewerId) {
        const formattedContent = this.formatDocumentContent(content);
        const title = this.extractDocumentTitle(content);
        
        return `
            <div class="content-viewer document-viewer" id="${viewerId}">
                <div class="content-viewer-header">
                    <div class="content-type-indicator document-indicator">
                        <i class="fas fa-file-alt"></i>
                        <span>Document: ${title}</span>
                    </div>
                    <div class="content-actions">
                        <button class="action-btn copy-btn" onclick="contentViewer.copyContent('${viewerId}')">
                            <i class="fas fa-copy"></i>
                            <span>Copy</span>
                        </button>
                        <button class="action-btn download-btn" onclick="contentViewer.downloadContent('${viewerId}', 'document', '${title}')">
                            <i class="fas fa-download"></i>
                            <span>Download</span>
                        </button>
                        <button class="action-btn fullscreen-btn" onclick="contentViewer.openFullscreen('${viewerId}', 'document')">
                            <i class="fas fa-expand"></i>
                            <span>Fullscreen</span>
                        </button>
                    </div>
                </div>
                <div class="document-viewer">
                    <div class="document-content" data-content="${encodeURIComponent(content)}">
                        ${formattedContent}
                    </div>
                </div>
            </div>
        `;
    }

    createCodeEditor(content, language, viewerId) {
        const cleanCode = this.cleanCodeContent(content);
        const lines = cleanCode.split('\n');
        const codeLines = lines.map((line, index) => {
            const lineNumber = index + 1;
            const highlightedLine = this.highlightSyntax(line, language);
            return `
                <div class="code-line">
                    <div class="line-number">${lineNumber}</div>
                    <div class="line-content">${highlightedLine}</div>
                </div>
            `;
        }).join('');

        const languageDisplay = this.getLanguageDisplayName(language);

        return `
            <div class="content-viewer code-editor" id="${viewerId}">
                <div class="content-viewer-header code-editor-header">
                    <div class="content-type-indicator code-indicator">
                        <i class="fas fa-code"></i>
                        <span>Code Editor: ${languageDisplay}</span>
                    </div>
                    <div class="content-actions">
                        <button class="action-btn copy-btn" onclick="contentViewer.copyContent('${viewerId}')">
                            <i class="fas fa-copy"></i>
                            <span>Copy</span>
                        </button>
                        <button class="action-btn download-btn" onclick="contentViewer.downloadContent('${viewerId}', 'code', '${language}')">
                            <i class="fas fa-download"></i>
                            <span>Download</span>
                        </button>
                        <button class="action-btn fullscreen-btn" onclick="contentViewer.openFullscreen('${viewerId}', 'code')">
                            <i class="fas fa-expand"></i>
                            <span>Fullscreen</span>
                        </button>
                    </div>
                </div>
                <div class="code-content" data-content="${encodeURIComponent(cleanCode)}">
                    ${codeLines}
                </div>
            </div>
        `;
    }

    formatDocumentContent(content) {
        return content
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^\* (.+)$/gm, '<li>$1</li>')
            .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[h|l])/gm, '<p>')
            .replace(/(?<!>)$/gm, '</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/<\/ul>\s*<ul>/g, '');
    }

    cleanCodeContent(content) {
        // Remove markdown code block syntax if present
        return content
            .replace(/^```[\w]*\n/, '')
            .replace(/\n```$/, '')
            .trim();
    }

    highlightSyntax(line, language) {
        if (!line.trim()) return line;

        // Basic syntax highlighting
        const keywords = {
            'javascript': ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'extends'],
            'python': ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from'],
            'java': ['public', 'private', 'protected', 'class', 'interface', 'if', 'else', 'for', 'while', 'return'],
            'generic': ['function', 'class', 'if', 'else', 'for', 'while', 'return']
        };

        const langKeywords = keywords[language] || keywords.generic;
        let highlighted = line;

        // Highlight keywords
        langKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>');
        });

        // Highlight strings
        highlighted = highlighted.replace(/(["'])([^"']*)\1/g, '<span class="string">$1$2$1</span>');

        // Highlight numbers
        highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

        // Highlight comments
        highlighted = highlighted.replace(/(\/\/.*|#.*)/g, '<span class="comment">$1</span>');

        // Highlight brackets
        highlighted = highlighted.replace(/([{}[\]()])/g, '<span class="bracket">$1</span>');

        return highlighted;
    }

    extractDocumentTitle(content) {
        const lines = content.split('\n');
        
        // Look for markdown header
        for (const line of lines.slice(0, 5)) {
            const match = line.match(/^#+\s+(.+)$/);
            if (match) return match[1].substring(0, 50);
        }

        // Look for first substantial line
        for (const line of lines.slice(0, 3)) {
            if (line.trim().length > 10) {
                return line.trim().substring(0, 50);
            }
        }

        return 'Untitled Document';
    }

    getLanguageDisplayName(language) {
        const names = {
            'javascript': 'JavaScript',
            'python': 'Python',
            'html': 'HTML',
            'css': 'CSS',
            'json': 'JSON',
            'sql': 'SQL',
            'java': 'Java',
            'csharp': 'C#',
            'generic': 'Code'
        };
        return names[language] || 'Code';
    }

    copyContent(viewerId) {
        const viewer = document.getElementById(viewerId);
        const contentElement = viewer.querySelector('[data-content]');
        const content = decodeURIComponent(contentElement.dataset.content);

        navigator.clipboard.writeText(content).then(() => {
            const copyBtn = viewer.querySelector('.copy-btn');
            copyBtn.classList.add('copy-success');
            copyBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
            
            setTimeout(() => {
                copyBtn.classList.remove('copy-success');
                copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>Copy</span>';
            }, 2000);
        });
    }

    downloadContent(viewerId, type, name) {
        const viewer = document.getElementById(viewerId);
        const contentElement = viewer.querySelector('[data-content]');
        const content = decodeURIComponent(contentElement.dataset.content);

        const extensions = {
            'document': 'md',
            'javascript': 'js',
            'python': 'py',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'sql': 'sql',
            'java': 'java',
            'csharp': 'cs',
            'code': 'txt'
        };

        const extension = extensions[type] || 'txt';
        const filename = `${name.replace(/[^a-z0-9]/gi, '_')}.${extension}`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    openFullscreen(viewerId, type) {
        const viewer = document.getElementById(viewerId);
        const contentElement = viewer.querySelector('[data-content]');
        const content = decodeURIComponent(contentElement.dataset.content);

        const modal = document.getElementById('fullscreenModal');
        const fullscreenContent = document.getElementById('fullscreenContent');
        const header = document.getElementById('fullscreenHeader');
        const body = document.getElementById('fullscreenBody');
        const typeIndicator = document.getElementById('fullscreenTypeIndicator');

        if (type === 'document') {
            fullscreenContent.classList.remove('code-theme');
            header.classList.remove('code-theme');
            typeIndicator.innerHTML = '<i class="fas fa-file-alt"></i><span>Document Viewer</span>';
            body.innerHTML = `<div class="fullscreen-document">${this.formatDocumentContent(content)}</div>`;
        } else if (type === 'code') {
            fullscreenContent.classList.add('code-theme');
            header.classList.add('code-theme');
            typeIndicator.innerHTML = '<i class="fas fa-code"></i><span>Code Editor</span>';
            body.innerHTML = `<div class="fullscreen-code"><pre><code>${content}</code></pre></div>`;
        }

        modal.classList.add('active');
    }

    initializeEventListeners() {
        // Fullscreen modal close
        document.getElementById('fullscreenClose').addEventListener('click', () => {
            document.getElementById('fullscreenModal').classList.remove('active');
        });

        // Close on click outside
        document.getElementById('fullscreenModal').addEventListener('click', (e) => {
            if (e.target.id === 'fullscreenModal') {
                document.getElementById('fullscreenModal').classList.remove('active');
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('fullscreenModal').classList.contains('active')) {
                document.getElementById('fullscreenModal').classList.remove('active');
            }
        });
    }

    formatMessage(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }
}

// Utility Functions
class Utils {
    static addCSSAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    static checkBrowserSupport() {
        const features = {
            fetch: typeof fetch !== 'undefined',
            localStorage: typeof localStorage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            flexbox: CSS.supports('display', 'flex'),
            grid: CSS.supports('display', 'grid')
        };

        const unsupported = Object.entries(features)
            .filter(([feature, supported]) => !supported)
            .map(([feature]) => feature);

        if (unsupported.length > 0) {
            console.warn('Some features may not work properly. Unsupported:', unsupported);
        }

        return unsupported.length === 0;
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS animations
    Utils.addCSSAnimation();
    
    // Check browser support
    Utils.checkBrowserSupport();
    
    // Initialize components
    const config = new ChatbotConfig();
    const historyManager = new ChatHistoryManager();
    const chatManager = new ChatManager(config, historyManager);
    
    // Make chat manager and content viewer globally available
    window.chatManager = chatManager;
    window.contentViewer = chatManager.contentViewer; // Make content viewer globally accessible
    
    // Initialize chat history UI
    historyManager.updateHistoryUI();
    
    // Initialize prompt cards from configuration
    config.updatePromptCards();
    
    // Auto-collapse sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.add('collapsed');
        } else {
            document.getElementById('sidebar').classList.remove('collapsed');
        }
    });
    
    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('Chatbot error:', e.error);
    });

    // Service worker for offline functionality (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.log('Service worker registration failed (optional feature)');
        });
    }

    console.log('✅ RFP Assistant initialized successfully!');
    console.log('🤖 RFP Agent mode enabled with configurable prompt cards');
    console.log('📝 Configure N8N webhook in settings to enable real chat functionality');
    console.log('⌨️ Press Ctrl+, for settings or Ctrl+/ for help');
    console.log('📄 Document viewer and code editor interfaces enabled!');
});