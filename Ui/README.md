# AI Fitness Trainer - React Frontend

A complete, modern React frontend for an AI-powered fitness trainer web application. Built with React 18, TypeScript, Tailwind CSS, and a comprehensive set of modern tools.

## 🚀 Features

### Core Features
- **Authentication System** - Login/Register with form validation
- **Multi-step Onboarding** - Personalized fitness profile setup
- **Dashboard** - Overview of workouts, progress, and AI insights
- **Workout Library** - Browse and filter workout routines
- **Live AI Training** - Real-time pose tracking and feedback UI
- **Progress Reports** - Charts, analytics, and AI-generated insights
- **AI Chatbot** - Interactive fitness coaching assistant
- **User Profile** - Comprehensive profile management
- **Settings** - Theme, language, notifications, and preferences

### Technical Features
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Dark/Light Mode** - Complete theme switching
- **Internationalization** - English and Arabic support with RTL
- **Smooth Animations** - Framer Motion powered transitions
- **Type Safety** - Full TypeScript implementation
- **Form Validation** - React Hook Form with Zod schemas
- **State Management** - Zustand for global state
- **API Layer** - Axios with mock responses

## 🛠️ Tech Stack

- **React 18** - Latest React with hooks
- **TypeScript** - Full type safety
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant forms
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations

## 📁 Project Structure

```
src/
├── app/                    # App configuration
│   ├── store.ts           # Global state management
│   ├── theme.ts           # Theme management
│   └── i18n.ts            # Internationalization
├── components/            # Reusable components
│   ├── ui/                # Base UI components
│   ├── layout/            # Layout components
│   ├── cards/             # Card components
│   ├── charts/            # Chart components
│   └── forms/             # Form components
├── pages/                 # Page components
│   ├── auth/              # Authentication pages
│   ├── onboarding/        # Onboarding flow
│   ├── dashboard/         # Dashboard page
│   ├── workout/           # Workout pages
│   ├── live-training/     # Live training page
│   ├── reports/           # Reports page
│   ├── chatbot/           # Chatbot page
│   ├── profile/           # Profile page
│   └── settings/          # Settings page
├── services/              # API services
│   └── api.ts             # API client and endpoints
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── assets/                # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-fitness-trainer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
```

## 🎨 Design System

### Colors
- **Primary**: `#22c55e` (Fitness Green)
- **Secondary**: `#0f172a` (Dark Blue)
- **Accent**: `#38bdf8` (Light Blue)
- **Background Light**: `#f8fafc`
- **Background Dark**: `#020617`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700

### Components
- **Rounded Corners**: `2xl` (16px)
- **Shadows**: Soft, layered shadows
- **Animations**: Smooth, purposeful transitions

## 🌍 Internationalization

The app supports English and Arabic with full RTL (Right-to-Left) support:

- **English** - Default language
- **Arabic** - Full RTL layout and translations
- **Language Toggle** - Available in settings
- **Dynamic Direction** - Automatic layout adjustment

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

## 🔌 API Integration

The app includes a complete API layer with mock responses:

### Endpoints
- **Auth**: `/auth/login`, `/auth/register`
- **User**: `/user/profile`
- **Workouts**: `/workouts`, `/workouts/:id`
- **Live Training**: `/live/start`, `/live/feedback`
- **Reports**: `/reports`, `/reports/performance`
- **Chat**: `/chat/message`

### Mock Data
All API calls return realistic mock data for development and testing.

## 🎯 Key Features Breakdown

### Authentication
- Email/password login and registration
- Form validation with error handling
- Social login placeholders (Google, Facebook)
- Remember me functionality

### Onboarding
- 4-step personalized setup
- Gender, age, body metrics
- Fitness goals and experience level
- Training preferences

### Dashboard
- Today's workout recommendations
- Activity statistics and charts
- Progress tracking
- Quick action buttons

### Workouts
- Filterable workout library
- Detailed workout views
- Exercise breakdowns with video placeholders
- Difficulty and muscle group filtering

### Live Training
- Webcam feed simulation
- AI pose tracking overlay
- Real-time feedback system
- Rep counting and scoring

### Reports
- Workout history table
- Progress charts and analytics
- AI-generated insights
- Export functionality

### Chatbot
- Interactive AI coach
- Real-time messaging
- Suggested responses
- Typing indicators

### Profile
- Comprehensive user information
- Body metrics tracking
- Progress photos
- Account statistics

### Settings
- Theme switching (Dark/Light)
- Language selection (EN/AR)
- Notification preferences
- Account management

## 🔧 Customization

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/layout/Sidebar.tsx`

### Adding New API Endpoints
1. Add endpoint to `src/services/api.ts`
2. Create mock response data
3. Use in components with error handling

### Styling
- Use Tailwind CSS classes
- Follow the design system colors
- Maintain responsive design patterns

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the fitness community**