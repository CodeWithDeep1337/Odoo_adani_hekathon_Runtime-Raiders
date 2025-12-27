# GearGuard - Maintenance Management System

A modern, premium Maintenance Management System built with React, Bootstrap 5, and SCSS. Designed with a professional SaaS aesthetic to help technicians manage equipment maintenance efficiently.

## 🎯 Features

### Dashboard / Kanban Board
- **Drag-and-drop interface** for managing maintenance requests across statuses
- Four workflow columns: New, In Progress, Repaired, Scrap
- **Overdue indicators** with red visual alerts for overdue requests
- Real-time card updates with priority badges
- Technician assignment avatars
- Responsive grid layout

### Calendar View
- **Monthly calendar** for preventive maintenance scheduling
- Visual indicators for dates with scheduled requests
- Click to create new requests for specific dates
- Preventive maintenance tracking and visualization
- Request count badges on calendar dates

### Equipment Management
- **Detailed equipment information** display and editing
- General info section (Name, Serial Number)
- Ownership & assignment tracking (Department, Employee, Team, Category)
- **Warranty tracking** with expiration alerts
- Quick access to maintenance requests for each equipment
- Maintenance button with active request count badge

### Maintenance Request Creation
- **Smart form** with auto-fill capabilities
- Equipment selection dropdown
- Automatic inheritance of Team and Category from selected equipment
- Request type selection (Corrective/Preventive)
- Scheduled date picker
- Success feedback and validation
- Modal interface with premium styling

## 🎨 Design Features

### Premium Aesthetic
- **Gradient headers** with modern color schemes (primary: #1f3a5f, secondary: #4a7ba7)
- **Subtle shadows** for depth (sm, md, lg, hover variants)
- **Rounded corners** (10px standard, 12-15px for larger elements)
- **Smooth transitions** with cubic-bezier timing functions
- High-contrast color palette for readability

### Interactive Elements
- **Hover effects** with scale and elevation transforms
- **Active states** for navigation items
- **Loading states** with spinners for async operations
- **Success animations** with scale-in keyframes
- **Smooth transitions** between views

### Responsive Design
- Fully responsive from desktop (1600px) to mobile (320px)
- **Breakpoints**: 1400px, 1024px, 768px, 480px
- Optimized layouts for all screen sizes
- Touch-friendly button and form element sizing

## 📦 Tech Stack

- **Framework**: React 19.2
- **Build Tool**: Vite 7.2
- **Component Library**: React Bootstrap
- **Styling**: SCSS/CSS with Bootstrap 5
- **Icons**: Lucide React
- **State Management**: React Context API
- **Drag & Drop**: react-beautiful-dnd
- **Calendar**: react-calendar
- **HTTP Client**: Axios

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

### Development

The application starts on `http://localhost:5173` (or next available port).

**Available Scripts:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build locally

## 📁 Project Structure

```
src/
├── components/
│   ├── KanbanBoard.jsx          # Main dashboard with drag-drop
│   ├── CalendarView.jsx          # Preventive maintenance calendar
│   ├── EquipmentManagementForm.jsx # Equipment details & editing
│   └── CreationModal.jsx         # Request creation form
├── context/
│   └── MaintenanceContext.jsx    # Global state management
├── hooks/
│   └── useMaintenance.js         # Custom hook for context
├── styles/
│   ├── theme.scss               # Global theme & variables
│   ├── kanban.scss              # Kanban board styles
│   ├── calendar.scss            # Calendar view styles
│   ├── equipment.scss           # Equipment form styles
│   └── creationModal.scss       # Modal & form styles
├── App.jsx                       # Main app with routing
├── App.scss                      # App layout & navigation
├── main.jsx                      # Entry point
└── index.css                     # Global CSS
```

## 🎯 Component Details

### KanbanBoard
- Displays all maintenance requests grouped by status
- Drag-and-drop between columns updates request status
- Shows overdue warnings for past-due requests
- Color-coded priority badges
- Equipment name and technician assignment

**Props:**
- `onCardClick` - Callback when a card is clicked

### CalendarView
- Monthly calendar with request indicators
- Click dates to create new maintenance requests
- Displays all preventive maintenance for selected date
- Request count badges on calendar tiles

**Props:**
- `onCreateRequest` - Callback with selected date

### EquipmentManagementForm
- Full CRUD interface for equipment
- Edit mode toggle for inline editing
- Warranty expiration tracking and alerts
- Quick access to equipment's maintenance requests
- Modal for viewing all requests

**Props:**
- `equipmentId` - Equipment to display
- `onMaintenance` - Callback when maintenance button clicked

### CreationModal
- Form for creating new maintenance requests
- Equipment dropdown with auto-fill
- Type selection (Corrective/Preventive)
- Date picker for scheduling
- Success feedback with animation

**Props:**
- `show` - Modal visibility
- `onHide` - Close callback
- `selectedDate` - Pre-selected date
- `onSuccess` - Success callback

## 🎨 Color Scheme

```scss
Primary: #1f3a5f (Dark Blue)
Secondary: #4a7ba7 (Medium Blue)
Success: #27ae60 (Green)
Danger: #e74c3c (Red)
Warning: #f39c12 (Orange)
Info: #3498db (Sky Blue)
Light: #f8f9fa (Off-white)
Dark: #2c3e50 (Dark Gray)
Background: #f5f7fa (Very Light Gray)
```

## 🔄 State Management

The app uses React Context API for global state:

- **MaintenanceContext** stores:
  - List of maintenance requests
  - Equipment inventory
  - Functions to move requests, create requests, update equipment
  - Functions to filter requests by equipment

## 🎭 Mock Data

The application includes mock data for:
- 4 sample maintenance requests with various statuses and priorities
- 3 sample equipment with warranty and assignment info
- Sample technicians with avatars

## 📱 Responsive Breakpoints

- **1400px**: Desktop layout optimizations
- **1024px**: Tablet layout with adjusted grid
- **768px**: Mobile layout with stacked components
- **480px**: Mobile optimization for smaller screens

## ⌨️ Keyboard Navigation

- Tab through form fields
- Enter to submit forms
- Escape to close modals (when not loading)
- Arrow keys to navigate calendar

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Color contrast compliance
- Keyboard navigation support
- Form validation messages

## 🐛 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📈 Performance Optimizations

- Code splitting via Vite
- CSS modules for scoped styling
- Optimized re-renders with React.memo (ready)
- Lazy loading for modals
- Efficient state updates

## 🔐 Security Considerations

- Input validation on all forms
- XSS protection with React's JSX escaping
- CSRF protection ready for API integration
- No sensitive data in local state (demo purposes)

## 🚧 Future Enhancements

- [ ] Backend API integration with Axios
- [ ] User authentication & role-based access
- [ ] Real-time updates with WebSocket
- [ ] Advanced filtering & search
- [ ] Data export (PDF, Excel)
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app version
- [ ] Offline support with IndexedDB

## 📝 License

Built as part of the Adani Hackathon - Odoo Runtime Raiders Challenge

## 👥 Contributors

- Senior Frontend Engineer
- UI/UX Designer

---

**Built with ❤️ using React, Bootstrap, and SCSS**
