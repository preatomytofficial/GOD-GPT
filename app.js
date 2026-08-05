/**
 * GOD GPT - AI Assistant Core Client Engine
 * Author: PreatomYT © 2026
 */

import { initGalaxyBackground } from './bg-galaxy.js';

// Storage Keys
const KEYS = {
  CHATS: 'god_gpt_chats',
  ACTIVE_CHAT_ID: 'god_gpt_active_chat_id',
  MAIN_API_KEY: 'god_gpt_main_api_key',
  IMAGE_API_KEY: 'god_gpt_image_api_key',
  GALLERY: 'god_gpt_gallery',
  ACTIVE_MODEL: 'god_gpt_active_model'
};

// Application State
const state = {
  chats: [],
  activeChatId: null,
  mainKey: '',
  imageKey: '',
  gallery: [],
  activeModel: 'GOD GPT Ultra',
  activeView: 'chat', // 'chat' or 'images'
  imageAspect: '1:1',
  imageModel: 'GOD Vision',
  isGenerating: false,
  renameTargetId: null
};

// DOM Elements Reference Object
const elements = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initGalaxyBackground();
  cacheElements();
  loadDataFromStorage();
  setupEventListeners();
  configureMarked();
  renderApp();
});

// Cache DOM elements for quick access
function cacheElements() {
  elements.sidebar = document.getElementById('sidebar');
  elements.sidebarOverlay = document.getElementById('sidebar-overlay');
  elements.openSidebarBtn = document.getElementById('open-sidebar-btn');
  elements.closeSidebarBtn = document.getElementById('close-sidebar-btn');
  
  elements.newChatBtn = document.getElementById('new-chat-btn');
  elements.chatHistoryList = document.getElementById('chat-history-list');
  elements.clearAllChatsBtn = document.getElementById('clear-all-chats-btn');
  elements.exportChatBtn = document.getElementById('export-chat-btn');
  
  elements.topSettingsBtn = document.getElementById('top-settings-btn');
  elements.sidebarSettingsBtn = document.getElementById('sidebar-settings-btn');
  elements.threeDotsBtn = document.getElementById('three-dots-btn');
  elements.threeDotsDropdown = document.getElementById('three-dots-dropdown');
  elements.menuItemSettings = document.getElementById('menu-item-settings');
  elements.menuItemExport = document.getElementById('menu-item-export');
  elements.menuItemClear = document.getElementById('menu-item-clear');
  elements.settingsModal = document.getElementById('settings-modal');
  elements.closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
  elements.mainApiKeyInput = document.getElementById('main-api-key-input');
  elements.imageApiKeyInput = document.getElementById('image-api-key-input');
  elements.saveSettingsBtn = document.getElementById('save-settings-btn');
  elements.clearKeysBtn = document.getElementById('clear-keys-btn');

  elements.renameModal = document.getElementById('rename-modal');
  elements.closeRenameModalBtn = document.getElementById('close-rename-modal-btn');
  elements.renameChatInput = document.getElementById('rename-chat-input');
  elements.confirmRenameBtn = document.getElementById('confirm-rename-btn');
  elements.cancelRenameBtn = document.getElementById('cancel-rename-btn');

  elements.modelSelector = document.getElementById('model-selector');
  elements.activeModelBadge = document.getElementById('active-model-badge');

  elements.navModeChat = document.getElementById('nav-mode-chat');
  elements.navModeImages = document.getElementById('nav-mode-images');
  elements.tabBtnChat = document.getElementById('tab-btn-chat');
  elements.tabBtnImages = document.getElementById('tab-btn-images');

  elements.chatModeView = document.getElementById('chat-mode-view');
  elements.imageModeView = document.getElementById('image-mode-view');

  elements.chatMessagesContainer = document.getElementById('chat-messages-container');
  elements.welcomeScreen = document.getElementById('welcome-screen');
  elements.messageList = document.getElementById('message-list');
  elements.typingIndicator = document.getElementById('typing-indicator');

  elements.userPromptInput = document.getElementById('user-prompt-input');
  elements.sendBtn = document.getElementById('send-btn');
  elements.quickImageModeBtn = document.getElementById('quick-image-mode-btn');
  elements.clearCurrentChatBtn = document.getElementById('clear-current-chat-btn');

  elements.imagePromptInput = document.getElementById('image-prompt-input');
  elements.generateImageBtn = document.getElementById('generate-image-btn');
  elements.imageGalleryGrid = document.getElementById('image-gallery-grid');
  elements.clearGalleryBtn = document.getElementById('clear-gallery-btn');

  elements.imagePreviewModal = document.getElementById('image-preview-modal');
  elements.closeImageModalBtn = document.getElementById('close-image-modal-btn');
  elements.previewImageElement = document.getElementById('preview-image-element');
  elements.previewImagePrompt = document.getElementById('preview-image-prompt');
  elements.copyImagePromptBtn = document.getElementById('copy-image-prompt-btn');
  elements.downloadImageBtn = document.getElementById('download-image-btn');

  elements.toastContainer = document.getElementById('toast-container');
}

// Load persisted data from localStorage
function loadDataFromStorage() {
  try {
    const savedChats = localStorage.getItem(KEYS.CHATS);
    state.chats = savedChats ? JSON.parse(savedChats) : [];

    state.activeChatId = localStorage.getItem(KEYS.ACTIVE_CHAT_ID) || null;

    state.mainKey = localStorage.getItem(KEYS.MAIN_API_KEY) || '';
    state.imageKey = localStorage.getItem(KEYS.IMAGE_API_KEY) || '';

    const savedGallery = localStorage.getItem(KEYS.GALLERY);
    state.gallery = savedGallery ? JSON.parse(savedGallery) : [];

    const savedModel = localStorage.getItem(KEYS.ACTIVE_MODEL);
    if (savedModel === 'GOD GPT Ultra' || savedModel === 'GOD GPT Pro') {
      state.activeModel = savedModel;
    } else {
      state.activeModel = 'GOD GPT Ultra';
    }
  } catch (err) {
    console.error('Failed to load localStorage data:', err);
  }
}

// Save current state back to localStorage
function saveChatsToStorage() {
  localStorage.setItem(KEYS.CHATS, JSON.stringify(state.chats));
  if (state.activeChatId) {
    localStorage.setItem(KEYS.ACTIVE_CHAT_ID, state.activeChatId);
  } else {
    localStorage.removeItem(KEYS.ACTIVE_CHAT_ID);
  }
}

function saveGalleryToStorage() {
  localStorage.setItem(KEYS.GALLERY, JSON.stringify(state.gallery));
}

// Setup Event Listeners
function setupEventListeners() {
  // Mobile Sidebar Toggle
  elements.openSidebarBtn?.addEventListener('click', () => {
    elements.sidebar?.classList.add('open');
    elements.sidebarOverlay?.classList.add('active');
  });

  const closeSidebar = () => {
    elements.sidebar?.classList.remove('open');
    elements.sidebarOverlay?.classList.remove('active');
  };
  elements.closeSidebarBtn?.addEventListener('click', closeSidebar);
  elements.sidebarOverlay?.addEventListener('click', closeSidebar);

  // New Chat
  elements.newChatBtn?.addEventListener('click', () => {
    createNewChat();
    closeSidebar();
  });

  // Navigation Mode Tabs
  const handleViewSwitch = (mode) => {
    state.activeView = mode;
    if (mode === 'chat') {
      elements.chatModeView?.classList.remove('hidden-view');
      elements.imageModeView?.classList.add('hidden-view');
      elements.navModeChat?.classList.add('active');
      elements.navModeImages?.classList.remove('active');
      elements.tabBtnChat?.classList.add('active');
      elements.tabBtnImages?.classList.remove('active');
    } else {
      elements.chatModeView?.classList.add('hidden-view');
      elements.imageModeView?.classList.remove('hidden-view');
      elements.navModeChat?.classList.remove('active');
      elements.navModeImages?.classList.add('active');
      elements.tabBtnChat?.classList.remove('active');
      elements.tabBtnImages?.classList.add('active');
    }
  };

  elements.navModeChat?.addEventListener('click', () => handleViewSwitch('chat'));
  elements.navModeImages?.addEventListener('click', () => handleViewSwitch('images'));
  elements.tabBtnChat?.addEventListener('click', () => handleViewSwitch('chat'));
  elements.tabBtnImages?.addEventListener('click', () => handleViewSwitch('images'));
  elements.quickImageModeBtn?.addEventListener('click', () => handleViewSwitch('images'));

  // Settings Modal
  const openSettings = () => {
    if (elements.mainApiKeyInput) elements.mainApiKeyInput.value = state.mainKey;
    if (elements.imageApiKeyInput) elements.imageApiKeyInput.value = state.imageKey;
    elements.settingsModal?.classList.remove('hidden');
  };

  elements.topSettingsBtn?.addEventListener('click', openSettings);
  elements.sidebarSettingsBtn?.addEventListener('click', openSettings);

  // 3-Dot Dropdown Menu Toggle & Options
  elements.threeDotsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.threeDotsDropdown?.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (elements.threeDotsDropdown && !elements.threeDotsDropdown.classList.contains('hidden')) {
      if (!e.target.closest('#three-dots-menu-wrapper')) {
        elements.threeDotsDropdown.classList.add('hidden');
      }
    }
  });

  elements.menuItemSettings?.addEventListener('click', () => {
    elements.threeDotsDropdown?.classList.add('hidden');
    openSettings();
  });

  elements.menuItemExport?.addEventListener('click', () => {
    elements.threeDotsDropdown?.classList.add('hidden');
    exportCurrentChat();
  });

  elements.menuItemClear?.addEventListener('click', () => {
    elements.threeDotsDropdown?.classList.add('hidden');
    const activeChat = getActiveChat();
    if (activeChat && activeChat.messages.length > 0) {
      if (confirm('Clear all messages in this chat?')) {
        activeChat.messages = [];
        saveChatsToStorage();
        renderChatMessages();
        showToast('Chat cleared');
      }
    }
  });

  elements.closeSettingsModalBtn?.addEventListener('click', () => {
    elements.settingsModal?.classList.add('hidden');
  });

  // Toggle Password Visibility
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-password-btn')) {
      const targetId = e.target.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          e.target.textContent = '🙈';
        } else {
          input.type = 'password';
          e.target.textContent = '👁️';
        }
      }
    }
  });

  // Save Settings
  elements.saveSettingsBtn?.addEventListener('click', () => {
    state.mainKey = elements.mainApiKeyInput?.value.trim() || '';
    state.imageKey = elements.imageApiKeyInput?.value.trim() || '';

    localStorage.setItem(KEYS.MAIN_API_KEY, state.mainKey);
    localStorage.setItem(KEYS.IMAGE_API_KEY, state.imageKey);

    elements.settingsModal?.classList.add('hidden');
    showToast('Settings saved successfully!');
  });

  // Clear Keys
  elements.clearKeysBtn?.addEventListener('click', () => {
    state.mainKey = '';
    state.imageKey = '';
    localStorage.removeItem(KEYS.MAIN_API_KEY);
    localStorage.removeItem(KEYS.IMAGE_API_KEY);
    openSettings();
    showToast('All API keys cleared.');
  });

  // Model Selector
  elements.modelSelector?.addEventListener('change', (e) => {
    state.activeModel = e.target.value;
    localStorage.setItem(KEYS.ACTIVE_MODEL, state.activeModel);
    if (elements.activeModelBadge) {
      elements.activeModelBadge.textContent = state.activeModel;
    }
    showToast(`Model switched to ${state.activeModel}`);
  });

  // Clear Current Chat
  elements.clearCurrentChatBtn?.addEventListener('click', () => {
    const activeChat = getActiveChat();
    if (activeChat && activeChat.messages.length > 0) {
      if (confirm('Clear all messages in this chat?')) {
        activeChat.messages = [];
        saveChatsToStorage();
        renderChatMessages();
        showToast('Chat cleared');
      }
    }
  });

  // Clear All Chats
  elements.clearAllChatsBtn?.addEventListener('click', () => {
    state.chats = [];
    state.activeChatId = null;
    saveChatsToStorage();
    renderApp();
    showToast('All chats deleted');
  });

  // Export Chat TXT
  elements.exportChatBtn?.addEventListener('click', () => {
    exportCurrentChat();
  });

  // Textarea Auto-Resize & Enter to Send
  elements.userPromptInput?.addEventListener('input', () => {
    elements.userPromptInput.style.height = 'auto';
    elements.userPromptInput.style.height = `${Math.min(elements.userPromptInput.scrollHeight, 160)}px`;
  });

  elements.userPromptInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  elements.sendBtn?.addEventListener('click', () => {
    handleSendMessage();
  });

  // Suggestion Cards Click
  document.querySelectorAll('.suggestion-card').forEach((card) => {
    card.addEventListener('click', () => {
      const promptText = card.getAttribute('data-prompt');
      if (promptText && elements.userPromptInput) {
        elements.userPromptInput.value = promptText;
        handleSendMessage();
      }
    });
  });

  // Image Aspect Ratio Chips
  document.querySelectorAll('.aspect-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.aspect-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.imageAspect = chip.getAttribute('data-aspect') || '1:1';
    });
  });

  // Preset Prompts
  document.querySelectorAll('.preset-chip').forEach((preset) => {
    preset.addEventListener('click', () => {
      const prompt = preset.getAttribute('data-preset');
      if (prompt && elements.imagePromptInput) {
        elements.imagePromptInput.value = prompt;
      }
    });
  });

  // Generate Image Button
  elements.generateImageBtn?.addEventListener('click', () => {
    handleGenerateImage();
  });

  // Clear Gallery
  elements.clearGalleryBtn?.addEventListener('click', () => {
    if (confirm('Clear image gallery history?')) {
      state.gallery = [];
      saveGalleryToStorage();
      renderGallery();
      showToast('Gallery cleared');
    }
  });

  // Rename Modal
  elements.closeRenameModalBtn?.addEventListener('click', () => {
    elements.renameModal?.classList.add('hidden');
  });
  elements.cancelRenameBtn?.addEventListener('click', () => {
    elements.renameModal?.classList.add('hidden');
  });
  elements.confirmRenameBtn?.addEventListener('click', () => {
    if (state.renameTargetId && elements.renameChatInput) {
      const newTitle = elements.renameChatInput.value.trim();
      if (newTitle) {
        const chat = state.chats.find((c) => c.id === state.renameTargetId);
        if (chat) {
          chat.title = newTitle;
          saveChatsToStorage();
          renderChatHistory();
          showToast('Chat renamed');
        }
      }
    }
    elements.renameModal?.classList.add('hidden');
  });

  // Image Preview Modal Close
  elements.closeImageModalBtn?.addEventListener('click', () => {
    elements.imagePreviewModal?.classList.add('hidden');
  });

  // Modal Backdrop Click to Close
  document.querySelectorAll('.modal-backdrop').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

// Configure Marked Markdown Parser
function configureMarked() {
  if (window.marked) {
    window.marked.setOptions({
      highlight: function (code, lang) {
        if (window.hljs && lang && window.hljs.getLanguage(lang)) {
          return window.hljs.highlight(code, { language: lang }).value;
        }
        return code;
      },
      breaks: true
    });
  }
}

// Get Currently Active Chat Object
function getActiveChat() {
  if (!state.activeChatId && state.chats.length > 0) {
    state.activeChatId = state.chats[0].id;
  }
  return state.chats.find((c) => c.id === state.activeChatId) || null;
}

// Create New Chat Session
function createNewChat() {
  const newChat = {
    id: 'chat_' + Date.now(),
    title: 'New Chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    model: state.activeModel,
    messages: []
  };

  state.chats.unshift(newChat);
  state.activeChatId = newChat.id;
  saveChatsToStorage();
  renderApp();
  if (elements.userPromptInput) elements.userPromptInput.focus();
}

// Render Entire UI State
function renderApp() {
  if (elements.modelSelector) elements.modelSelector.value = state.activeModel;
  if (elements.activeModelBadge) elements.activeModelBadge.textContent = state.activeModel;

  renderChatHistory();
  renderChatMessages();
  renderGallery();
}

// Render Chat History in Left Sidebar
function renderChatHistory() {
  if (!elements.chatHistoryList) return;
  elements.chatHistoryList.innerHTML = '';

  if (state.chats.length === 0) {
    elements.chatHistoryList.innerHTML = `
      <div style="padding: 12px; font-size: 0.82rem; color: var(--text-muted); text-align: center;">
        No saved chats yet.
      </div>
    `;
    return;
  }

  state.chats.forEach((chat) => {
    const item = document.createElement('div');
    item.className = `history-item ${chat.id === state.activeChatId ? 'active' : ''}`;
    
    item.innerHTML = `
      <span class="history-item-title">${escapeHtml(chat.title)}</span>
      <div class="history-item-actions">
        <button class="action-icon-btn rename-btn" title="Rename Chat">✏️</button>
        <button class="action-icon-btn delete-btn" title="Delete Chat">🗑️</button>
      </div>
    `;

    // Click to select chat
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('action-icon-btn')) return;
      state.activeChatId = chat.id;
      saveChatsToStorage();
      renderChatHistory();
      renderChatMessages();
    });

    // Rename
    const renameBtn = item.querySelector('.rename-btn');
    renameBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      state.renameTargetId = chat.id;
      if (elements.renameChatInput) elements.renameChatInput.value = chat.title;
      elements.renameModal?.classList.remove('hidden');
    });

    // Delete
    const deleteBtn = item.querySelector('.delete-btn');
    deleteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const titleToDelete = chat.title;
      state.chats = state.chats.filter((c) => c.id !== chat.id);
      if (state.activeChatId === chat.id) {
        state.activeChatId = state.chats.length > 0 ? state.chats[0].id : null;
      }
      saveChatsToStorage();
      renderApp();
      showToast(`Deleted "${titleToDelete}"`);
    });

    elements.chatHistoryList.appendChild(item);
  });
}

// Render Messages for Current Active Chat
function renderChatMessages() {
  if (!elements.messageList || !elements.welcomeScreen) return;
  elements.messageList.innerHTML = '';

  const activeChat = getActiveChat();

  if (!activeChat || activeChat.messages.length === 0) {
    elements.welcomeScreen.style.display = 'flex';
    elements.messageList.style.display = 'none';
    return;
  }

  elements.welcomeScreen.style.display = 'none';
  elements.messageList.style.display = 'flex';

  activeChat.messages.forEach((msg) => {
    const msgElement = createMessageElement(msg);
    elements.messageList.appendChild(msgElement);
  });

  scrollToBottom();
}

// Create Message DOM Element
function createMessageElement(msg) {
  const item = document.createElement('div');
  const isUser = msg.role === 'user';
  item.className = `message-item ${isUser ? 'user-msg' : 'ai-msg'}`;

  const avatar = isUser
    ? `<div class="avatar user-avatar">YOU</div>`
    : `<div class="avatar ai-avatar"><img src="logo.png" alt="GOD GPT" /></div>`;

  const parsedContent = isUser ? escapeHtml(msg.content) : parseMarkdownAndCode(msg.content);

  item.innerHTML = `
    ${avatar}
    <div class="message-content-wrapper">
      <div class="message-bubble glass-card">${parsedContent}</div>
      <div class="message-actions">
        <button class="msg-action-btn copy-msg-btn" title="Copy Message">📋 Copy</button>
        ${!isUser ? `<button class="msg-action-btn retry-msg-btn" title="Retry AI Prompt">🔄 Retry</button>` : ''}
      </div>
    </div>
  `;

  // Add event handlers for copy and retry
  const copyBtn = item.querySelector('.copy-msg-btn');
  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText(msg.content);
    showToast('Message copied to clipboard');
  });

  const retryBtn = item.querySelector('.retry-msg-btn');
  retryBtn?.addEventListener('click', () => {
    const activeChat = getActiveChat();
    if (activeChat) {
      // Find previous user message
      const lastUserMsg = activeChat.messages.slice().reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        sendPromptToAI(lastUserMsg.content);
      }
    }
  });

  // Code block copy buttons
  item.querySelectorAll('.copy-code-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.closest('.code-block-wrapper').querySelector('code');
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.innerText);
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }
    });
  });

  return item;
}

// Parse Markdown & Code Blocks
function parseMarkdownAndCode(content) {
  if (!content) return '';

  if (window.marked) {
    try {
      let rawHtml = window.marked.parse(content);
      
      // Post process code blocks to inject custom header and copy button
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = rawHtml;

      tempDiv.querySelectorAll('pre').forEach((pre) => {
        const codeEl = pre.querySelector('code');
        const langClass = codeEl ? Array.from(codeEl.classList).find((c) => c.startsWith('language-')) : '';
        const lang = langClass ? langClass.replace('language-', '') : 'code';

        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        wrapper.innerHTML = `
          <div class="code-block-header">
            <span>${lang.toUpperCase()}</span>
            <button class="copy-code-btn">📋 Copy</button>
          </div>
          <pre><code>${codeEl ? codeEl.innerHTML : pre.innerHTML}</code></pre>
        `;

        pre.parentNode.replaceChild(wrapper, pre);
      });

      return tempDiv.innerHTML;
    } catch (e) {
      console.error('Marked parsing error:', e);
    }
  }

  // Simple fallback formatter
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

// Handle User Sending Message
function handleSendMessage() {
  if (state.isGenerating) return;

  const promptText = elements.userPromptInput?.value.trim();
  if (!promptText) return;

  // Clear input
  elements.userPromptInput.value = '';
  elements.userPromptInput.style.height = 'auto';

  // Ensure active chat session exists
  let activeChat = getActiveChat();
  if (!activeChat) {
    createNewChat();
    activeChat = getActiveChat();
  }

  // Set chat title if first message
  if (activeChat.messages.length === 0) {
    activeChat.title = promptText.length > 28 ? promptText.slice(0, 28) + '...' : promptText;
    saveChatsToStorage();
    renderChatHistory();
  }

  // Push user message
  const userMsg = {
    id: 'msg_' + Date.now(),
    role: 'user',
    content: promptText,
    timestamp: new Date().toISOString()
  };

  activeChat.messages.push(userMsg);
  saveChatsToStorage();
  renderChatMessages();

  // Trigger AI Response
  sendPromptToAI(promptText);
}

// Multi-Key Failover Engine for AI Chat
async function sendPromptToAI(promptText) {
  state.isGenerating = true;
  elements.typingIndicator?.classList.remove('hidden');
  scrollToBottom();

  const activeChat = getActiveChat();
  const historyTurns = activeChat ? activeChat.messages.slice(-10) : [];

  // Build key rotation order: Main Key if present, then server fallback
  const failoverQueue = [];
  if (state.mainKey) failoverQueue.push({ type: 'userKey', key: state.mainKey });
  failoverQueue.push({ type: 'serverProxy', key: null });

  let replyText = null;
  let lastError = null;

  for (const item of failoverQueue) {
    try {
      if (item.type === 'serverProxy') {
        // Call local server endpoint
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: promptText,
            history: historyTurns,
            model: state.activeModel
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server returned ${res.status}`);
        }

        const data = await res.json();
        replyText = data.reply;
        break; // Success!
      } else if (item.type === 'userKey' && item.key) {
        // Direct attempt using user API Key
        replyText = await attemptDirectKeyRequest(item.key, promptText, historyTurns);
        if (replyText) break; // Success!
      }
    } catch (err) {
      console.warn(`Failover attempt failed for key (${item.type}):`, err.message);
      lastError = err.message;
    }
  }

  elements.typingIndicator?.classList.add('hidden');
  state.isGenerating = false;

  if (replyText) {
    const aiMsg = {
      id: 'msg_' + Date.now(),
      role: 'assistant',
      content: replyText,
      timestamp: new Date().toISOString()
    };

    if (activeChat) {
      activeChat.messages.push(aiMsg);
      saveChatsToStorage();
      renderChatMessages();
    }
  } else {
    showToast(`Error: ${lastError || 'All API keys failed.'}`);
  }
}

// Attempt API request directly with user provided key (supports OpenAI / Gemini / OpenRouter)
async function attemptDirectKeyRequest(apiKey, promptText, historyTurns) {
  // If key looks like Google Gemini API key
  if (apiKey.startsWith('AIza')) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });
    if (!res.ok) throw new Error(`Gemini Key status ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }

  // OpenRouter / OpenAI Compatible Endpoint
  const endpoint = apiKey.startsWith('or-') || apiKey.startsWith('sk-or-')
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: apiKey.startsWith('or-') ? 'google/gemini-2.5-flash' : 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are GOD GPT, an intelligent AI assistant.' },
        { role: 'user', content: promptText }
      ]
    })
  });

  if (!res.ok) throw new Error(`API Key status ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

// Handle Image Generation
async function handleGenerateImage() {
  const prompt = elements.imagePromptInput?.value.trim();
  if (!prompt) {
    showToast('Please enter an image prompt.');
    return;
  }

  elements.generateImageBtn.disabled = true;
  elements.generateImageBtn.innerHTML = `
    <span class="typing-dots"><span></span><span></span><span></span></span>
    <span>Generating Artwork...</span>
  `;

  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        imageApiKey: state.imageKey,
        aspectRatio: state.imageAspect
      })
    });

    if (!res.ok) {
      throw new Error(`Image API returned ${res.status}`);
    }

    const data = await res.json();
    if (data.imageUrl) {
      const imageObj = {
        id: 'img_' + Date.now(),
        url: data.imageUrl,
        prompt,
        createdAt: new Date().toISOString()
      };

      state.gallery.unshift(imageObj);
      saveGalleryToStorage();
      renderGallery();
      showToast('Image generated successfully!');
    } else {
      throw new Error('No image URL returned.');
    }
  } catch (err) {
    console.error('Image Generation Error:', err);
    showToast(`Image Error: ${err.message}`);
  } finally {
    elements.generateImageBtn.disabled = false;
    elements.generateImageBtn.innerHTML = `
      <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <span>Generate Masterpiece</span>
    `;
  }
}

// Render Gallery Grid
function renderGallery() {
  if (!elements.imageGalleryGrid) return;
  elements.imageGalleryGrid.innerHTML = '';

  if (state.gallery.length === 0) {
    elements.imageGalleryGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 32px; color: var(--text-muted);">
        No generated images yet. Describe a prompt above and click Generate.
      </div>
    `;
    return;
  }

  state.gallery.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';

    card.innerHTML = `
      <img src="${item.url}" alt="${escapeHtml(item.prompt)}" loading="lazy" />
      <div class="gallery-card-overlay">
        <p class="gallery-prompt-text">${escapeHtml(item.prompt)}</p>
        <div class="gallery-card-actions">
          <button class="gallery-action-btn view-btn">🔍 View</button>
          <button class="gallery-action-btn copy-prompt-btn">📋 Prompt</button>
        </div>
      </div>
    `;

    card.querySelector('.view-btn')?.addEventListener('click', () => {
      openImagePreviewModal(item);
    });

    card.querySelector('.copy-prompt-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(item.prompt);
      showToast('Prompt copied!');
    });

    elements.imageGalleryGrid.appendChild(card);
  });
}

// Open High Res Image Modal
function openImagePreviewModal(item) {
  if (!elements.imagePreviewModal) return;
  
  elements.previewImageElement.src = item.url;
  elements.previewImagePrompt.textContent = item.prompt;
  elements.downloadImageBtn.href = item.url;

  elements.copyImagePromptBtn.onclick = () => {
    navigator.clipboard.writeText(item.prompt);
    showToast('Prompt copied');
  };

  elements.imagePreviewModal.classList.remove('hidden');
}

// Export Chat History as TXT File
function exportCurrentChat() {
  const activeChat = getActiveChat();
  if (!activeChat || activeChat.messages.length === 0) {
    showToast('No chat history to export.');
    return;
  }

  let textContent = `==================================================\n`;
  textContent += `GOD GPT CHAT EXPORT: ${activeChat.title}\n`;
  textContent += `Date: ${new Date(activeChat.createdAt).toLocaleString()}\n`;
  textContent += `==================================================\n\n`;

  activeChat.messages.forEach((msg) => {
    const sender = msg.role === 'user' ? 'YOU' : 'GOD GPT';
    textContent += `[${sender}]:\n${msg.content}\n\n`;
  });

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GOD_GPT_Chat_${activeChat.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Chat exported as TXT');
}

// Scroll Chat Container to Bottom
function scrollToBottom() {
  if (elements.chatMessagesContainer) {
    elements.chatMessagesContainer.scrollTop = elements.chatMessagesContainer.scrollHeight;
  }
}

// Toast Notification Popup Helper
function showToast(msg) {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// HTML Escaper Helper
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
