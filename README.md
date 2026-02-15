# FlowState - AI-Powered Developer Learning Platform

🚀 **Live Demo**:https://ai-learing-bharat.vercel.app/ **GitHub**: https://github.com/oye-rahul/ai-learing

FlowState is a comprehensive learning platform that combines AI assistance with interactive coding to help developers learn faster and build better projects. The platform features personalized learning paths, real-time AI code assistance, project collaboration, and detailed analytics.

## 🚀 Features
<img width="1919" height="1079" alt="Screenshot 2026-02-15 171818" src="https://github.com/user-attachments/assets/41dae2e6-21ee-43e8-8cf3-ed6949d773f1" />

<img width="1913" height="976" alt="Screenshot 2026-02-14 230846" src="https://github.com/user-attachments/assets/84b7adb4-263a-4d21-9b0b-035009275a63" />


### Core Features
- **AI-Powered Learning**: Get personalized explanations, code optimization, and debugging assistance
- **Interactive Playground**: Monaco-powered code editor with real-time AI assistance
- **Learning Paths**: Structured modules with progress tracking and skill assessment
- **Project Management**: Create, collaborate, and showcase coding projects
- **Analytics Dashboard**: Track learning progress, coding activity, and skill development
- **Dark/Light Theme**: Customizable UI with responsive design

### AI Capabilities
- Code explanation and documentation
- Performance optimization suggestions
- Bug detection and debugging assistance
- Code conversion between programming languages
- Code generation from natural language descriptions
- **Agentic AI Code Fixing**: Automatically applies fixed code to editor

### Learning Features
- Personalized learning recommendations
- Skill progression tracking with radar charts
- Achievement system and streak tracking
- Interactive coding exercises
- Project-based learning with templates

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Monaco Editor** for code editing
- **Chart.js** for data visualization
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **SQLite** (development) / **Supabase** (production) - Auto-switching database
- **JWT** authentication with **Passport.js**
- **Google Gemini AI** integration (gemini-2.5-flash)
- **bcrypt** for password hashing
- **Piston API** for online code execution (13+ languages)

### DevOps & Deployment
- **Vercel** for frontend hosting
- **Railway/Render** for backend hosting
- **Docker** containerization (optional)
- **Nginx** reverse proxy (optional)

## 📋 Prerequisites

- Node.js 18+ and npm
- Gemini API key (free tier available)
- Git for version control

## 🚀 Quick Start

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/oye-rahul/ai-learing.git
   cd ai-learing
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Gemini API key
   npm start
   ```

3. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Option 2: Deploy to Vercel (Production)

**Quick Deploy (5 minutes):**

1. **Deploy Backend to Railway**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select: `oye-rahul/ai-learing`
   - Root Directory: `backend`
   - Add environment variables (see below)

2. **Deploy Frontend to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - New Project → Import from GitHub
   - Select: `oye-rahul/ai-learing`
   - Root Directory: `frontend`
   - Add environment variables (see below)

3. **Done!** Your app is live 🎉

📖 **Detailed Guide**: See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=AIzaSyDQLirYTllwUuTc2CpddevvPhkuWpDDi3I
FRONTEND_URL=https://your-app.vercel.app

# Optional: Supabase for production database
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_ENV=production
REACT_APP_ENABLE_AI_FEATURES=true
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### AI Endpoints
- `POST /api/ai/explain` - Explain code
- `POST /api/ai/optimize` - Optimize code
- `POST /api/ai/debug` - Debug code (with agentic fixing)
- `POST /api/ai/convert` - Convert code between languages
- `POST /api/ai/generate` - Generate code from description
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/learn-chat` - Learning-focused AI chat

### Learning Endpoints
- `GET /api/learning/modules` - Get learning modules
- `POST /api/learning/start-module` - Start a learning module
- `POST /api/learning/complete-lesson` - Complete a lesson
- `GET /api/learning/recommendations` - Get personalized recommendations
- `GET /api/learning/path` - Get user's learning path

### Projects Endpoints
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Playground Endpoints
- `POST /api/playground/execute` - Execute code (13+ languages)
- `GET /api/playground/languages` - Get supported languages

## 🎨 Key Features

### 1. Agentic AI Code Fixing
- Click "Fix Code" button in any editor
- AI analyzes and fixes bugs automatically
- Fixed code is applied to editor with highlight animation
- Works in Code Editor, Playground, and Python Environment

### 2. Multi-Language Code Execution
Supports 13+ languages:
- Python, JavaScript, TypeScript, Java, C++, C, C#
- Go, Rust, PHP, Ruby, Swift, Kotlin

### 3. Google OAuth Integration
- One-click login with Google
- Auto-creates user account on first login
- Secure JWT token generation

### 4. Flexible Database Support
- **Development**: SQLite (no setup needed)
- **Production**: Supabase (PostgreSQL)
- Automatic switching based on environment

### 5. Real-time AI Chat
- Context-aware conversations
- Code-specific assistance
- Learning path recommendations

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Build Testing (CI simulation)
```bash
cd frontend
CI=true npm run build
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Run automated deployment script
deploy-to-vercel.bat

# Or manually:
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### Netlify Deployment
```bash
# Update backend URL in netlify.toml
# Then push to GitHub
git push origin main
```

📖 **Deployment Guides**:
- [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) - Complete Vercel guide
- [NETLIFY_LOGIN_FIX.md](NETLIFY_LOGIN_FIX.md) - Fix Netlify login issues
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - General deployment guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation for API changes
- Follow semantic commit messages

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check deployment guides in repo
- **Email**: Contact at support@flowstate.dev

## 🙏 Acknowledgments

- Google Gemini AI for AI capabilities
- Piston API for code execution
- Monaco Editor for code editing
- Tailwind CSS for styling
- React and Node.js communities

---

**Built with ❤️ for developers worldwide**

🌟 **Star this repo** if you find it helpful!

📧 **Contact**: https://github.com/oye-rahul
