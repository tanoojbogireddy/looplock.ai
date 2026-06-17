# LoopLock.AI

A modern, full-featured web application built with cutting-edge technologies for AI-powered interaction and intelligent automation.

[![TypeScript](https://img.shields.io/badge/TypeScript-97.7%25-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TanStack](https://img.shields.io/badge/TanStack-Start-orange?style=flat-square)](https://tanstack.com/start/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## 🌐 Live Demo

Visit the application at: **[looplock-ai.vercel.app](https://looplock-ai.vercel.app)**

## ✨ Features

- **🤖 AI-Powered Interactions** - Seamless integration with OpenAI-compatible APIs for intelligent automation and responses
- **🎨 Beautiful UI Components** - Comprehensive component library built with Radix UI and Tailwind CSS
- **⚡ Type-Safe Development** - Full TypeScript support (97.7% of codebase) for robust and maintainable code
- **🔄 Real-time Data Management** - React Query for efficient server state management and caching
- **📱 Fully Responsive** - Mobile-first design with Tailwind CSS 4
- **🔐 Secure Authentication** - Cloud authentication support via Lovable
- **💾 Database Ready** - Supabase integration for backend services and data persistence
- **📊 Data Visualization** - Recharts for interactive charts and graphs
- **🎭 Rich Form Handling** - React Hook Form with Zod validation for type-safe forms
- **🚀 Modern Tooling** - Vite for fast development and optimized builds

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| TanStack Start | 1.167+ | Full-stack React framework |
| TanStack Router | 1.168+ | Type-safe routing |
| TanStack Query | 5.83+ | Server state management |
| Tailwind CSS | 4 | Styling and responsive design |
| Radix UI | Latest | Accessible component primitives |
| TypeScript | 5.8+ | Type safety |
| Vite | 7.3+ | Build tool and dev server |

### Backend & Services
| Service | Purpose |
|---------|---------|
| Nitro | Backend server and API routes |
| Supabase | Database and authentication |
| Vercel AI SDK | OpenAI-compatible AI integration |
| Lovable Cloud Auth | Authentication service |

### UI & UX Libraries
- **Radix UI** - Complete accessible component set (accordion, dialog, dropdown, etc.)
- **Recharts** - Data visualization and charts
- **Lucide React** - Consistent icon library
- **Embla Carousel** - Responsive carousel component
- **Sonner** - Toast notifications
- **React Hook Form** - Efficient form state management
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript linting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or compatible runtime
- npm, pnpm, or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/tanoojbogireddy/looplock.ai.git
cd looplock.ai

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_api_key_here
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Lovable Authentication
VITE_LOVABLE_PROJECT_ID=your_project_id
```

### Development

```bash
# Start the development server
npm run dev

# Application will be available at http://localhost:5173
```

### Building

```bash
# Build for production
npm run build

# Build in development mode (for debugging)
npm run build:dev

# Preview production build locally
npm run preview
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
looplock.ai/
├── src/
│   ├── routes/              # TanStack Router pages and layouts
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions and helpers
│   ├── styles/              # Global styles and Tailwind config
│   └── App.tsx             # Root application component
├── public/                  # Static assets
├── package.json            # Project dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── eslint.config.js        # ESLint rules
└── README.md              # This file
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run build:dev` | Build with development settings for debugging |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Check code quality with ESLint |
| `npm run format` | Auto-format code with Prettier |

## 🔑 Key Dependencies

### AI & LLM
- `ai` (6.0.184+) - Vercel AI SDK for LLM integration
- `@ai-sdk/openai-compatible` - OpenAI-compatible API support

### State Management
- `@tanstack/react-query` - Server state management
- `zod` - Runtime schema validation

### Styling & UI
- `tailwindcss` - Utility-first CSS framework
- `tailwind-merge` - Merge conflicting Tailwind classes
- `class-variance-authority` - Compile-time type-safe styling patterns
- `lucide-react` - Consistent icon system
- `@radix-ui/*` - Accessible component primitives (20+ packages)

### Forms & Input
- `react-hook-form` - Performant form state management
- `@hookform/resolvers` - Schema validation integration
- `input-otp` - OTP input component

### Utilities
- `date-fns` - Date manipulation and formatting
- `clsx` - Conditional classname utility
- `embla-carousel-react` - Responsive carousel

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Vercel automatically deploys on push to main branch

### Cloudflare

The project includes Cloudflare Vite plugin support:

```bash
npm run build  # Uses @cloudflare/vite-plugin for optimization
```

Deploy to Cloudflare Pages:
1. Build the project
2. Deploy the `dist/` directory to Cloudflare Pages

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | Yes | OpenAI API key for AI features |
| `VITE_OPENAI_BASE_URL` | Yes | OpenAI API endpoint URL |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public/anon key |
| `VITE_LOVABLE_PROJECT_ID` | Yes | Lovable project identifier |

## 📚 Documentation

- [React Documentation](https://react.dev)
- [TanStack Start](https://tanstack.com/start/)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel AI SDK](https://sdk.vercel.ai)

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure:
- Code follows the existing style (run `npm run format`)
- TypeScript types are properly defined
- Changes are tested
- Commit messages are descriptive

## 📋 Development Guidelines

- **Type Safety**: Always provide TypeScript types, avoid `any`
- **Components**: Keep components small and focused
- **Performance**: Use React Query for async state, memoize expensive computations
- **Accessibility**: Follow Radix UI patterns for accessible components
- **Styling**: Use Tailwind utility classes, avoid inline styles
- **Testing**: Add tests for new features

## 🐛 Bug Reports

Found a bug? Please [create an issue](https://github.com/tanoojbogireddy/looplock.ai/issues) with:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)

## 💡 Feature Requests

Have an idea? Open a [discussion](https://github.com/tanoojbogireddy/looplock.ai/discussions) or [issue](https://github.com/tanoojbogireddy/looplock.ai/issues) describing:
- The feature you'd like
- The problem it solves
- Possible implementation approach

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Tanuj Bogireddy**
- GitHub: [@tanoojbogireddy](https://github.com/tanoojbogireddy)
- Repository: [looplock.ai](https://github.com/tanoojbogireddy/looplock.ai)

## 🙏 Acknowledgments

Built with:
- [TanStack](https://tanstack.com) - Excellent React utilities
- [Radix UI](https://radix-ui.com) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Vercel](https://vercel.com) - AI SDK and deployment
- [Supabase](https://supabase.com) - Backend as a service

---

<div align="center">

**[🌐 Live Demo](https://looplock-ai.vercel.app)** • **[📖 Docs](#documentation)** • **[🐛 Issues](https://github.com/tanoojbogireddy/looplock.ai/issues)** • **[💬 Discussions](https://github.com/tanoojbogireddy/looplock.ai/discussions)**

Built with ❤️ using modern web technologies

</div>
