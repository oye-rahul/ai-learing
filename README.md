<div align="center">
  <h1>🚀 FlowState</h1>
  <p><strong>The Next-Generation AI-Powered Developer Learning & Productivity Platform</strong></p>

  <p>
    <a href="https://ai-learing-bharat.vercel.app/" target="_blank">View Live Demo</a> ·
    <a href="https://github.com/oye-rahul/ai-learing" target="_blank">Report Bug</a> ·
    <a href="https://github.com/oye-rahul/ai-learing" target="_blank">Request Feature</a>
  </p>

  <!-- Badges -->
  <p>
    <img alt="React" src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />
    <img alt="NodeJS" src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/typescript-%230074c1.svg?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="TailwindCSS" src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img alt="AWS" src="https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white" />
  </p>
</div>

<br />

## 📖 Overview

**FlowState** is a comprehensive, interactive learning platform designed to revolutionize the way developers learn and build. By seamlessly fusing real-time **Agentic AI assistance** with a powerful browser-based coding environment, FlowState acts as your active 1-on-1 coding tutor. Whether you're debugging, learning a new language, or building complex projects, FlowState scales elite-level tech mentorship to anyone, anywhere.

---

## ✨ Key Features

<img width="1919" height="1079" alt="FlowState Dashboard" src="https://github.com/user-attachments/assets/41dae2e6-21ee-43e8-8cf3-ed6949d773f1" />
<br/>
<img width="1913" height="976" alt="Interactive Playground" src="https://github.com/user-attachments/assets/84b7adb4-263a-4d21-9b0b-035009275a63" />

### 🤖 Agentic AI Integrations
- **1-Click Auto Fixing:** The AI doesn't just suggest; it automatically analyzes, patches, and applies code fixes directly into the editor with smooth highlight animations.
- **Context-Aware Chat:** Speak naturally with an AI assistant that understands your current project context.
- **Explain & Optimize:** Have complex snippets broken down line-by-line or rewritten for optimal performance.

### ⚡ Developer Playground
- **Multi-Language Execution:** Compile and execute code securely in the browser alongside your lessons.
- **Monaco Editor:** Powered by the same robust engine behind VS Code for an uncompromised IDE experience natively on the web.

### 🎓 Dynamic Learning
- **Personalized Learning Paths:** Structured curriculums that dynamically rate your skill progression.
- **Visual Analytics:** Radar charts, streak tracking, and project insights to visually track your mastery over time.
- **Project Scaffolding:** Create, collaborate, and manage coding projects directly within your workspace.

---

## 🛠️ Tech Stack & Architecture

FlowState utilizes a modern, serverless-capable architecture designed for scale, speed, and low latency.

| Category | Technologies utilized |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Redux Toolkit, Tailwind CSS, Monaco Editor, Chart.js |
| **Backend** | Node.js, Express.js, JWT/Passport Authentication, bcrypt |
| **Database** | SQLite (Rapid Dev) / PostgreSQL via Supabase (Production) |
| **AI & Compute** | Google Gemini 2.5 API, Piston Code Execution Engine |
| **Cloud Hosting** | AWS Amplify, AWS Elastic Beanstalk, Vercel |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
Make sure you have Node.js and npm installed. You will also need a free [Google Gemini API Key](https://aistudio.google.com/app/apikey).
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. **Clone the repo**
   ```sh
   git clone https://github.com/oye-rahul/ai-learing.git
   cd ai-learing
   ```

2. **Setup the Backend**
   ```sh
   cd backend
   npm install
   cp .env.example .env
   ```
   *Edit `.env` and add your `GEMINI_API_KEY` and a `JWT_SECRET`.*

3. **Start the Backend server**
   ```sh
   npm start
   ```

4. **Setup the Frontend** (In a new terminal window)
   ```sh
   cd frontend
   npm install --legacy-peer-deps
   # (Optional) Edit .env.example and rename to .env for custom configuration
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to dive into the FlowState experience.

---

## ☁️ Deployment

Deploying FlowState is incredibly straightforward. The project is pre-configured for modern hosting platforms.

* **Vercel (Frontend):** 1-click deploy leveraging the root `vercel.json` and optimized build commands.
* **AWS Support:** Fully compatible with AWS Amplify (Frontend CDN) and AWS Elastic Beanstalk (Containerized Backend). View the comprehensive [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for step-by-step instructions.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ❤️ to democratize tech education in Bharat and beyond.</b>
</div>
