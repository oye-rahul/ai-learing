# FlowState - AI-Powered Developer Learning Platform

FlowState is a comprehensive learning platform that combines AI assistance with interactive coding to help developers learn faster and build better projects. The platform features personalized learning paths, real-time AI code assistance, project collaboration, and detailed analytics.

## 🚀 Features

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
- **JWT** authentication
- **Google Gemini AI** integration (gemini-2.5-flash)
- **bcrypt** for password hashing
- **Piston API** for online code execution

### DevOps
- **Docker** containerization
- **Nginx** reverse proxy
- **Redis** for caching (optional)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- OpenAI API key (for AI features)
- Docker and Docker Compose (optional)

## 🚀 Quick Start

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flowstate
   ```

2. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit backend/.env with your settings
   nano backend/.env
   ```

3. **Configure your OpenAI API key**
   ```bash
   # In backend/.env, set:
   OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec backend npm run migrate
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Option 2: Manual Setup

1. **Clone and setup backend**
   ```bash
   git clone <repository-url>
   cd flowstate/backend
   npm install
   cp .env.example .env
   # Edit .env with your database and API settings
   ```

2. **Setup PostgreSQL database**
   ```bash
   # Create database
   createdb flowstate
   
   # Run migrations
   npm run migrate
   ```

3. **Start backend server**
   ```bash
   npm run dev
   ```

4. **Setup frontend** (in new terminal)
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env if needed
   ```

5. **Start frontend development server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/flowstate
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

### Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `user_progress` - Learning progress and skills
- `learning_modules` - Course content and structure
- `projects` - User projects and code
- `ai_interactions` - AI assistance history
- `user_activity` - Activity tracking and analytics

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### AI Endpoints
- `POST /api/ai/explain` - Explain code
- `POST /api/ai/optimize` - Optimize code
- `POST /api/ai/debug` - Debug code
- `POST /api/ai/convert` - Convert code between languages
- `POST /api/ai/generate` - Generate code from description

### Learning Endpoints
- `GET /api/learning/modules` - Get learning modules
- `POST /api/learning/start-module` - Start a learning module
- `POST /api/learning/complete-lesson` - Complete a lesson
- `GET /api/learning/recommendations` - Get personalized recommendations

### Projects Endpoints
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 🎨 UI Components

The application includes a comprehensive component library:

### Shared Components
- `Button` - Customizable button with variants
- `Input` - Form input with validation
- `Card` - Container component with hover effects
- `Modal` - Overlay modal dialogs
- `LoadingSpinner` - Loading indicators
- `ProgressBar` - Progress visualization
- `Tooltip` - Contextual help tooltips

### Feature Components
- `CodeEditor` - Monaco-powered code editor
- `AIChatWindow` - AI assistance chat interface
- `SkillRadarChart` - Skill progression visualization
- `ActivityCalendar` - GitHub-style activity calendar

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

### E2E Testing
```bash
# Install Cypress
npm install -g cypress

# Run E2E tests
cypress open
```

## 🚀 Deployment

### Production Build

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Prepare backend**
   ```bash
   cd backend
   npm install --production
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Setup

For production deployment:
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper database credentials
- Set up SSL certificates
- Configure domain names

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions
- **Email**: Contact support at support@flowstate.dev

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- Monaco Editor team for the excellent code editor
- Chart.js for data visualization components
- Tailwind CSS for the utility-first CSS framework
- The React and Node.js communities

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Core learning platform
- ✅ AI-powered code assistance
- ✅ Project management
- ✅ Analytics dashboard

### Phase 2 (Planned)
- [ ] Mobile app (React Native)
- [ ] VS Code extension
- [ ] Real-time collaboration
- [ ] Advanced AI features
- [ ] Community features

### Phase 3 (Future)
- [ ] Marketplace for learning content
- [ ] Enterprise features
- [ ] Advanced analytics
- [ ] Integration with popular dev tools

---

**Built with ❤️ by the FlowState team**