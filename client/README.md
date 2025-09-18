# Jan-Samadhan Frontend

A real-time citizen grievance portal built with React, Vite, and TailwindCSS.

## Features

### 🏛️ **Citizen Portal**
- **5-Step Complaint Flow**: Camera permission → Photo capture → Location permission → Type selection → User details
- **Live Photo Capture**: Real-time camera access for issue documentation
- **Precise Location**: GPS-based location sharing
- **Complaint Tracking**: View status of submitted complaints
- **Real-time Updates**: Live map showing all complaints

### 🏢 **Authority Dashboard**
- **Live Map View**: See all complaints on an interactive map
- **Complaint Management**: Assign, track, and resolve complaints
- **Role-based Actions**: Different capabilities for citizens vs authorities
- **Real-time Notifications**: Instant updates when new complaints arrive

### 🎨 **Design System**
- **Custom Theme**: Beige/charcoal/orange color palette
- **Mobile-first**: Fully responsive design
- **Smooth Animations**: Framer Motion for delightful interactions
- **Modern UI**: shadcn/ui components with custom styling

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling with custom theme
- **Framer Motion** - Animations
- **React Leaflet** - Interactive maps
- **Socket.IO** - Real-time communication
- **Lucide React** - Icons
- **Radix UI** - Accessible components

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── LiveMap.jsx   # Interactive map component
├── context/
│   └── ComplaintContext.jsx  # State management & Socket.IO
├── pages/
│   ├── Landing.jsx           # Role selection page
│   ├── ComplaintFlow.jsx     # 5-step complaint process
│   ├── CitizenDashboard.jsx  # Citizen complaint tracking
│   └── AuthorityDashboard.jsx # Authority management
└── lib/
    └── utils.js      # Utility functions
```

## Key Features

### 📱 **Mobile-First Design**
- Optimized for mobile devices
- Touch-friendly interactions
- Responsive layouts

### 🗺️ **Interactive Maps**
- OpenStreetMap integration
- Real-time complaint markers
- Color-coded status indicators
- Click-to-view details

### 🔄 **Real-time Updates**
- Socket.IO for live communication
- Instant complaint notifications
- Status updates across all users

### 🎯 **User Experience**
- Intuitive 5-step complaint flow
- Clear progress indicators
- Smooth page transitions
- Success/error feedback

## Color Palette

- **Background**: Light beige (#FAF3E7)
- **Cards**: Slightly darker beige (#F5E6D3)
- **Text**: Dark charcoal (#1A1A1A)
- **Primary**: Orange (#F97316)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

## Development

The app uses a context-based state management system with Socket.IO for real-time features. All components are built with accessibility in mind using Radix UI primitives.

### State Management
- `ComplaintContext` manages global state
- Socket.IO handles real-time updates
- Local state for UI interactions

### Styling
- TailwindCSS with custom theme
- CSS variables for consistent theming
- Responsive design patterns

## Backend Integration

The frontend expects a backend server running on `http://localhost:5000` with:
- REST API endpoints for complaints
- Socket.IO server for real-time updates
- CORS enabled for development

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## License

MIT License - see LICENSE file for details.