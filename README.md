# MuviFInd 🎬

A movie discovery ap- **Quick movie lookup** - Fast way to identify movies by cas### 🏗️ Architecture

- **🌍 Edge-First**: Runs on Cloudflare Workers for global low-latency
- **📊 Smart Caching**: Optimized TMDB API calls with `append_to_response`
- **🎯 Intelligent Matching**: Perfect matches + partial matches (2+ actors)
- **� Mobile-First**: Responsive design that works on all devices
- **⚡ Performance**: Optimistic UI updates and skeleton loading states🛠️ Tech Stackhat lets you find movies by selecting your favorite actors. Built with modern web technologies and deployed on Cloudflare Workers.

![React](https://img.shields.io/badge/React-19.1-blue?style=flat-square&logo=react)
![React Router](https://img.shields.io/badge/React_Router-7.7-red?style=flat-square&logo=react-router)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-blue?style=flat-square&logo=tailwindcss)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Edge-orange?style=flat-square&logo=cloudflare)

## ✨ Features

- **🎭 Actor Grid Discovery**: Browse popular actors in an intuitive grid layout
- **🤝 Smart Recommendations**: Get actor suggestions based on movie collaborations  
- **🎬 Movie Discovery**: Find movies with perfect and partial actor matches
- **📊 Popularity-Based Ordering**: Results sorted by popularity and ratings
- **🔍 Perfect for Movie Name Discovery**: Ideal for finding movie names when you know the actors
- **🎨 Clean UI**: Modern, responsive design with Tailwind CSS v4
- **⚡ Fast Performance**: Deployed on Cloudflare's global edge network
- **🛡️ TypeScript**: Fully typed for better development experience
- **📱 Mobile Responsive**: Works seamlessly on all devices

## 🎯 How It Works

1. **👥 Browse Popular Actors**: Start with popular actors displayed in a responsive grid
2. **✅ Choose Actors**: Select multiple actors you recognize to build your selection  
3. **🔗 Get Recommendations**: The app suggests actors who worked with your selected ones
4. **🎬 Discover Movies**: Movies appear at the top showing perfect matches (✓ All actors) and partial matches (2/3 actors)
5. **🎯 Find Movie Names**: Perfect for when you know the actors but need the movie title

## 🚀 Use Cases

- **"I know the actors but forgot the movie name"** - Select the actors and find the movie
- **Discovering collaborations** - See which actors frequently work together  
- **Movie browsing** - Explore popular movies through actor connections
- **Quick movie lookup** - Fast way to identify movies by cast

## �️ Tech Stack

- **Frontend**: React 19 + React Router v7 (formerly Remix)
- **Styling**: Tailwind CSS v4 with modern design system
- **Backend**: Cloudflare Workers (Edge Runtime)
- **API**: TMDB (The Movie Database) API v3 with optimizations
- **Language**: TypeScript 5.8
- **Package Manager**: pnpm
- **Build Tool**: Vite 7.0

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **pnpm**
- **TMDB Bearer Token** - Get one at [themoviedb.org](https://www.themoviedb.org/settings/api) (use the "API Read Access Token")
- **Cloudflare account** (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/berkziya/muvifind.git
cd muvifind
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# For local development, create .dev.vars file
echo "TMDB_BEARER_TOKEN=your_tmdb_bearer_token_here" > .dev.vars
```

### Development

Start the development server:
```bash
pnpm run dev
```

The app will be available at `http://localhost:5173`

### Building & Deployment

```bash
# Build the application
pnpm run build

# Deploy to Cloudflare Workers (requires login)
wrangler login
pnpm run deploy
```

## �️ Architecture

- **🌍 Edge-First**: Runs on Cloudflare Workers for global low-latency
- **📊 Smart Caching**: Optimized TMDB API calls with `append_to_response`
- **🎯 Intelligent Matching**: Perfect matches + partial matches (2+ actors)
- **📱 Mobile-First**: Responsive design that works on all devices
- **⚡ Performance**: Optimistic UI updates and skeleton loading states

## 🔧 API Optimization

- **50% Fewer Requests**: Using `append_to_response` for combined data
- **38% Faster Images**: Using optimized `w185` image sizes
- **Smart Rate Limiting**: Respects TMDB API limits
- **DNS Prefetch**: Preloads TMDB image domains

## 📝 API Endpoints

- `GET /api/popular-actors` - Get popular actors for initial display
- `GET /api/search-actors?query={search_term}` - Search for actors by name
- `GET /api/actor-recommendations?actors={actor_ids}` - Get recommended actors
- `GET /api/find-movies?actors={actor_ids}` - Find movies by actor IDs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie and actor data
- [Cloudflare Workers](https://workers.cloudflare.com/) for edge computing platform
- [React Router](https://reactrouter.com/) for the modern full-stack framework

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie and actor data
- [Cloudflare Workers](https://workers.cloudflare.com/) for edge computing platform
- [React Router](https://reactrouter.com/) for the full-stack React framework
