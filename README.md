# Geo Agentic Starter Kit

A modern, flexible foundation for building AI-powered agentic geospatial web applications. This starter kit brings together cutting-edge technologies to enable intelligent spatial data processing, visualization, and analysis while following best practices for maintainable code architecture.

> **ℹ️ Note:** This repository is continuously updated as new tutorials are added to the YouTube channel. Check back regularly for new features and improvements. The implementation is not complete yet.

## Features

- 🗺️ **Interactive Maps**: Built with MapLibre GL for performance and flexibility
- 🔍 **Drawing Tools**: Integrated MapBox GL Draw for creating points, lines, and polygons
- 🤖 **AI Integration**: Ready for AI-powered geospatial analysis
- 📊 **Data Visualization**: Components for displaying geospatial data
- 🧩 **Feature-Wise Architecture**: Clean, maintainable code organization

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **UI**: React 19
- **Styling**: Tailwind CSS 4.x
- **Mapping**: MapLibre GL 5.x, Deck.gl 9.x, `@mapbox/mapbox-gl-draw` 1.x
- **Geospatial**: `@turf/turf` 7.x, `@google/earthengine` 1.x, `shpjs` 6.x, `proj4` 2.x
- **AI**: Vercel AI SDK (`ai` v4.x, `@ai-sdk/*` providers)
- **State Management**: Zustand 5.x
- **Validation**: Zod 3.x

## Project Structure

The project follows a feature-wise organization (similar to Feature-Sliced Design):

```
/
├── app/                   # Next.js App Router files
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── features/              # Feature modules
│   ├── map-display/       # Map display feature
│   │   ├── components/    # React components for this feature
│   │   └── ...            # Other feature-specific files
│   └── home/              # Home page feature
│       └── components/    # React components for this feature
├── components/            # Shared components
│   └── ui/                # Reusable UI components
├── lib/                   # Shared utilities and helpers
└── public/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/georetina/geo_agentic_starter_kit.git
cd geo_agentic_starter_kit
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Adding New Features

Follow the feature-wise structure pattern:

1. Create a new feature directory: `features/feature-name/`
2. Add components in: `features/feature-name/components/`
3. Export components directly (no barrel files)
4. Import components where needed, e.g., `import { Component } from '@/features/feature-name/components/Component'`

### Mapping Tools

The project uses MapLibre GL for rendering maps with OpenStreetMap data:

- The `MapDisplay` component in `features/map-display/components/MapDisplay.tsx` handles map initialization
- Drawing tools are provided by `@mapbox/mapbox-gl-draw`
- Add custom map layers in the `MapDisplay` component

## YouTube Tutorial Series

This project is developed in conjunction with a YouTube tutorial series that walks through building AI-powered geospatial applications. Follow along with the series to learn how to build and extend this starter kit:

[GeoRetina AI & Geospatial Development Tutorials](https://www.youtube.com/playlist?list=PLxZevhetcP5xWyH5LOT4FXk1HLmW7X-5E)

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Roadmap & Future Plans

This starter kit is continuously evolving. Here are some planned enhancements:

- [ ] **Database Integration**: Implement Supabase for geospatial data storage and user authentication
- [ ] **Python Backend**: Develop FastAPI service for advanced geospatial AI workflows
- [ ] **Data Import/Export**: Support for various geospatial formats (GeoJSON, Shapefile, KML)
- [ ] **Advanced Analysis Tools**: Integrate more Turf.js functions for client-side spatial analysis
- [ ] **AI Agents**: Create specialized geospatial agents for data processing and insights
- [ ] **Satellite Imagery**: Add support for remote sensing data analysis and visualization

## Follow Us

- 🌐 Website: https://www.georetina.com
- 🔗 LinkedIn (Personal): https://www.linkedin.com/in/shahab-jozdani-phd-a3978a189/
- 🔗 LinkedIn (Company): https://www.linkedin.com/company/georetina
- 𝕏: https://x.com/shahab_jozdani
