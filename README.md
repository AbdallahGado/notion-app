# Jotion - A Notion Clone

[![CI](https://github.com/AbdallahGado/notion-app/actions/workflows/ci.yml/badge.svg)](https://github.com/AbdallahGado/notion-app/actions/workflows/ci.yml)

Jotion is a powerful, collaborative workspace that brings together your notes, documents, and tasks in one beautiful, intuitive interface. Built as a modern Notion clone, it offers real-time collaboration, rich text editing, task management, and much more.

## ✨ Features

- **Real-time Collaboration**: Work together with your team in real-time, anywhere in the world
- **Rich Text Editor**: Powered by Tiptap with support for tables, code blocks, math equations, images, and more
- **Task Management**: Track tasks, set reminders, and stay productive
- **Templates**: Pre-built templates to kickstart your projects
- **Version History**: Keep track of document changes with version history
- **Comments**: Add comments and discussions to documents
- **Dark Mode**: Beautiful dark and light themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Secure & Private**: Your data is encrypted and protected with industry best practices

## 🛠 Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Tiptap** - Rich text editor framework
- **Radix UI** - Accessible UI components
- **Lucide React** - Icon library

### Backend & Database

- **Convex** - Real-time backend-as-a-service
- **Clerk** - Authentication and user management

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Testing framework
- **Storybook** - Component development

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AbdallahGado/notion-app.git
   cd notion-app
   ```

2. **Install dependencies**

   ```bash
   npm ci
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory and add your environment variables:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Convex Backend
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   CONVEX_DEPLOYMENT=your_convex_deployment
   ```

4. **Set up Convex**

   Install Convex CLI and initialize:

   ```bash
   npm install -g convex
   convex dev
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage

### Creating Documents

1. Click the "New Document" button from the documents page
2. Choose from available templates or start with a blank document
3. Use the rich text editor to add content, tables, images, and more

### Collaboration

- Share documents with team members
- See real-time cursors and changes
- Add comments to specific parts of documents

### Task Management

- Create tasks within documents
- Set due dates and priorities
- Track progress with checklists

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy is using Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This app can also be deployed to Netlify, Railway, or any platform that supports Next.js.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests
4. Run linting: `npm run lint`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Development Setup

After cloning the repo, run the following to install deps and enable Git hooks:

```bash
npm ci
npm run prepare    # installs Husky hooks
```

To run checks locally:

```bash
npm run lint
node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json
npm test
```

If you edit tooling (husky / lint-staged), re-run `npm run prepare`.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Notion](https://notion.so)
- Built with [Next.js](https://nextjs.org)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check our documentation
- Contact support@jotion.com

---

Made with ❤️ by AG
