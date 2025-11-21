# Modern Chatbot with N8N Integration

A modern, zero-installation chatbot system that uses CDN-based dependencies and integrates with N8N for real chat functionality. Perfect for websites that need a professional chatbot without complex installations.

## 🚀 Features

- **Zero Installation Required** - Uses CDN dependencies, no Node.js installation needed
- **Modern UI** - Beautiful gradient design with smooth animations
- **N8N Integration** - Connect to N8N workflows for intelligent responses
- **Mobile Responsive** - Works perfectly on all devices
- **Easy Configuration** - Simple settings modal for setup
- **Session Management** - Tracks user sessions and conversations
- **Typing Indicators** - Shows when bot is responding
- **Quick Actions** - Pre-defined message buttons
- **Persistent Settings** - Configuration saved in browser storage

## 📁 File Structure

```
chatbot/
├── index.html      # Main HTML file with chatbot UI
├── styles.css      # Modern CSS with animations and responsive design
├── chatbot.js      # JavaScript functionality and N8N integration
└── README.md       # This file
```

## 🔧 Setup Instructions

### 1. Basic Setup
1. Download or clone these files to any web server
2. Open `index.html` in a web browser
3. The chatbot will work immediately with fallback responses

### 2. N8N Integration Setup

#### Step 1: Create N8N Workflow
1. Open your N8N instance
2. Create a new workflow
3. Add a **Webhook** node as the trigger:
   - Set HTTP Method to `POST`
   - Set Path to `/webhook/chatbot` (or your preferred path)
   - Set Response Mode to `Respond to Webhook`

#### Step 2: Process the Message
Add nodes to process the incoming message. Example workflow:

```
Webhook → Set Node → HTTP Request (to AI API) → Respond to Webhook
```

**Webhook Node Settings:**
- Authentication: None (or configure as needed)
- Response: `Respond to Webhook`

**Set Node (Optional):**
```javascript
// Extract message from webhook data
return [{
  message: $json.body.message,
  sessionId: $json.body.sessionId,
  userId: $json.body.userId,
  timestamp: $json.body.timestamp
}];
```

**HTTP Request Node (Example with OpenAI):**
- Method: POST
- URL: `https://api.openai.com/v1/chat/completions`
- Headers:
  ```json
  {
    "Authorization": "Bearer YOUR_OPENAI_API_KEY",
    "Content-Type": "application/json"
  }
  ```
- Body:
  ```json
  {
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "{{ $json.message }}"
      }
    ],
    "max_tokens": 150
  }
  ```

**Respond to Webhook Node:**
```javascript
// Return the AI response
return [{
  json: {
    message: $node["HTTP Request"].json.choices[0].message.content,
    timestamp: new Date().toISOString(),
    sessionId: $json.sessionId
  }
}];
```

#### Step 3: Configure Chatbot
1. Click the settings (⚙️) button in the chatbot
2. Enter your N8N webhook URL (e.g., `https://your-n8n-instance.com/webhook/chatbot`)
3. Add API key if your N8N instance requires authentication
4. Customize bot name and welcome message
5. Click "Save Configuration"

## 🌐 Deployment Options

### 1. Static Web Hosting
- Upload files to any static hosting service (Netlify, Vercel, GitHub Pages)
- Works immediately without server configuration

### 2. CDN Deployment
- Host files on a CDN for global distribution
- All dependencies are already CDN-based

### 3. Local Development
- Simply open `index.html` in a web browser
- Use a local web server for best results:
  ```bash
  # Python
  python -m http.server 8000
  
  # Node.js (if available)
  npx serve .
  
  # PHP
  php -S localhost:8000
  ```

## 📱 Usage

### For Website Visitors:
1. Click the chat bubble in the bottom-right corner
2. Type messages and press Enter or click send
3. Use quick action buttons for common queries
4. Chat history is maintained during the session

### For Administrators:
1. Click the settings gear icon to configure
2. Set up N8N webhook URL for intelligent responses
3. Customize appearance and messages
4. Monitor conversations through N8N workflow

## 🔧 N8N Workflow Examples

### Example 1: Simple Echo Bot
```json
{
  "nodes": [
    {
      "parameters": {
        "path": "/webhook/chatbot",
        "httpMethod": "POST",
        "responseMode": "respondToWebhook"
      },
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"message\": \"You said: \" + $json.body.message } }}"
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [460, 300]
    }
  ]
}
```

### Example 2: AI-Powered Bot with OpenAI
```json
{
  "nodes": [
    {
      "parameters": {
        "path": "/webhook/chatbot",
        "httpMethod": "POST"
      },
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook"
    },
    {
      "parameters": {
        "url": "https://api.openai.com/v1/chat/completions",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer YOUR_API_KEY"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "model",
              "value": "gpt-3.5-turbo"
            },
            {
              "name": "messages",
              "value": "={{ [{ \"role\": \"user\", \"content\": $json.body.message }] }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.httpRequest",
      "name": "OpenAI API"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"message\": $json.choices[0].message.content } }}"
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "name": "Respond"
    }
  ]
}
```

## 🎨 Customization

### Styling
Edit `styles.css` to customize:
- Colors and gradients
- Animations and transitions
- Layout and positioning
- Mobile responsiveness

### Functionality
Edit `chatbot.js` to modify:
- Message handling logic
- N8N payload format
- Fallback responses
- UI interactions

### Content
Edit `index.html` to change:
- Welcome messages
- Quick action buttons
- UI text and labels

## 🔒 Security Considerations

1. **API Keys**: Store sensitive API keys in N8N, not in the frontend
2. **CORS**: Configure your N8N instance to allow requests from your domain
3. **Rate Limiting**: Implement rate limiting in your N8N workflow
4. **Input Validation**: Validate and sanitize inputs in N8N workflow
5. **HTTPS**: Always use HTTPS for production deployments

## 🐛 Troubleshooting

### Common Issues:

**Chatbot doesn't respond:**
- Check N8N webhook URL in settings
- Verify N8N workflow is active
- Check browser console for errors

**CORS errors:**
- Configure CORS in your N8N instance
- Ensure webhook URL is accessible

**Styling issues:**
- Verify CSS file is loading
- Check for conflicting styles on your website

**Mobile display problems:**
- Ensure viewport meta tag is present
- Test responsive CSS rules

## 📞 Support

For issues with:
- **N8N Integration**: Check N8N documentation and workflow logs
- **Chatbot Functionality**: Review browser console for error messages
- **Styling**: Inspect elements and check CSS conflicts

## 📄 License

This project is open source. Feel free to modify and use for your projects.

---

**Enjoy your modern, zero-installation chatbot! 🤖✨**