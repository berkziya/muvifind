# Contributing to MuviFInd

Thank you for your interest in contributing to MuviFInd! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/muvifind.git
   cd muvifind
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Set up environment variables**:
   ```bash
   echo "TMDB_BEARER_TOKEN=your_tmdb_bearer_token_here" > .dev.vars
   ```

## 💻 Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Start the development server**:
   ```bash
   pnpm run dev
   ```

3. **Make your changes** following the coding standards below

4. **Test your changes**:
   ```bash
   pnpm run typecheck
   pnpm run build
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces for all data structures
- Avoid `any` types - use proper typing

### React
- Use functional components with hooks
- Follow React best practices
- Use proper error boundaries where needed

### Styling
- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

### API Routes
- Include proper error handling
- Log errors appropriately
- Respect TMDB API rate limits
- Use TypeScript for request/response types

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and device information
- Screenshots if applicable

## ✨ Feature Requests

For feature requests:
- Describe the feature and its benefits
- Include mockups or examples if possible
- Consider the impact on performance
- Ensure it aligns with the project goals

## 🔍 Code Review Process

All contributions go through code review:
- Ensure code follows the style guidelines
- Check for proper TypeScript usage
- Verify mobile responsiveness
- Test the feature works as expected
- Confirm no performance regressions

## 📚 Resources

- [TMDB API Documentation](https://developer.themoviedb.org/docs)
- [React Router v7 Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## 🎯 Project Goals

Keep these goals in mind when contributing:
- **Performance**: Fast loading and smooth interactions
- **User Experience**: Intuitive and enjoyable to use
- **Mobile-First**: Works great on all devices
- **TypeScript**: Fully typed codebase
- **Modern**: Uses latest web technologies

Thank you for contributing to MuviFInd! 🎬
