# Tours & Travel App

A modern, accessible Angular application for discovering and planning travel experiences including activities, hotels, and restaurants.

## 🚀 Features

- **AI-Powered Search**: Intelligent search using OpenAI API for finding relevant travel options
- **Comprehensive Listings**: Browse activities, hotels, and restaurants with detailed information
- **Favorites System**: Save and manage your favorite travel options
- **Itinerary Planning**: Create and manage multi-day travel itineraries
- **Location Filtering**: Filter options by location with global and local filters
- **Responsive Design**: Modern, mobile-friendly interface
- **Accessibility**: Full ARIA support and screen reader compatibility

## 🏗️ Architecture

- **Frontend**: Angular 17+ with modern features
- **State Management**: Angular Signals for reactive state management
- **Styling**: SCSS with BEM methodology
- **Components**: Modular, reusable component architecture
- **Services**: Injectable services for data management and API integration

## 📁 Project Structure

```
src/
├── app/
│   ├── features/           # Feature modules
│   │   ├── activities/     # Activities listing and details
│   │   ├── ai-search/      # AI-powered search interface
│   │   ├── hotels/         # Hotels listing and details
│   │   ├── profile/        # User profile and favorites
│   │   └── restaurants/    # Restaurants listing and details
│   ├── shared/             # Shared components and services
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # Core services
│   │   └── interfaces/     # TypeScript interfaces
│   └── app.component.ts    # Root component
├── assets/                 # Static assets
└── environments/           # Environment configuration
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tours-and-travel-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify dependencies**
   ```bash
   npm outdated
   ```

## 🚀 Development

### Start Development Server
```bash
npm run start
```
Navigate to [http://localhost:4200](http://localhost:4200) in your browser.

### Code Quality
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix linting issues automatically
```

### Testing
```bash
npm run test          # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run coverage      # Generate test coverage report
```

## 🏗️ Build & Production

### Development Build
```bash
npm run build         # Build without SSR
```

### Production
```bash
npm run build:prod    # Production build
npm run serve         # Serve production build
```
Navigate to [http://localhost:4000](http://localhost:4000) in your browser.

## ♿ Accessibility Features

The application has been built with accessibility as a priority:

- **ARIA Labels**: Comprehensive aria-labels for all interactive elements
- **Semantic HTML**: Proper use of semantic HTML elements and roles
- **Screen Reader Support**: Full compatibility with screen readers
- **Keyboard Navigation**: Complete keyboard navigation support
- **Color Contrast**: High contrast ratios for better visibility
- **Live Regions**: Dynamic content updates with proper ARIA live regions

### Recent Accessibility Improvements

- Added comprehensive aria-labels to all component templates
- Implemented proper semantic roles for navigation, lists, and regions
- Enhanced screen reader support with descriptive labels
- Added keyboard navigation support for interactive elements
- Implemented proper ARIA live regions for dynamic content

## 🔧 Code Quality Standards

### Component Structure
- **JSDoc Documentation**: All public and private methods documented
- **Private Members**: Use of `#` prefix for private class fields
- **Method Organization**: Private methods placed at the bottom of classes
- **TypeScript**: Strict typing with explicit type annotations

### Recent Refactoring
- Converted all components to use modern `#` private field syntax
- Added comprehensive JSDoc documentation
- Reorganized method structure for better readability
- Fixed all TypeScript linter errors
- Improved code organization and maintainability

## 🌐 Environment Configuration

### Required Environment Variables
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Environment Files
- `src/environments/environment.ts` - Development configuration
- `src/environments/environment.prod.ts` - Production configuration

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured interface with grid layouts
- **Tablet**: Adaptive layouts with touch-friendly interactions
- **Mobile**: Mobile-first design with optimized navigation

## 🧪 Testing Strategy

- **Unit Tests**: Component and service testing with Jasmine
- **Integration Tests**: End-to-end testing for critical user flows
- **Accessibility Testing**: Automated accessibility checks
- **Cross-browser Testing**: Support for modern browsers

## 📦 Dependencies

### Core Dependencies
- **Angular**: 17+ with modern features
- **Angular Material**: UI component library
- **RxJS**: Reactive programming support
- **SCSS**: Advanced CSS preprocessing

### Development Dependencies
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Jasmine**: Testing framework
- **Karma**: Test runner

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines
- Follow Angular style guide
- Use TypeScript strict mode
- Maintain accessibility standards
- Add JSDoc documentation for new methods
- Use `#` prefix for private members

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Carl Victor "Vicky" Datu** - Lead Developer

---

## 🚀 Quick Start

For developers who want to get started quickly:

```bash
# Clone and install
git clone <repository-url>
cd tours-and-travel-app
npm install

# Start development
npm run start

# Open browser
# Navigate to http://localhost:4200
```

The application will be available at `http://localhost:4200` with hot reload enabled for development.
