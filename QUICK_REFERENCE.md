# GearGuard Frontend - Quick Reference Card

## 🚀 Essential Commands

```bash
# Installation
npm install --legacy-peer-deps

# Development
npm run dev              # Start dev server on http://localhost:5174

# Building
npm run build            # Create optimized production build
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint checks
```

## 📂 Quick File Locations

| What | Location |
|------|----------|
| Main App | `src/App.jsx` |
| Global State | `src/context/MaintenanceContext.jsx` |
| Kanban Board | `src/components/KanbanBoard.jsx` |
| Calendar View | `src/components/CalendarView.jsx` |
| Equipment Form | `src/components/EquipmentManagementForm.jsx` |
| Request Modal | `src/components/CreationModal.jsx` |
| Theme Colors | `src/styles/theme.scss` |
| Navigation Bar | `src/App.scss` (lines ~36-160) |

## 🎨 Color Quick Reference

```scss
$primary: #1f3a5f      // Dark Blue - Main color
$secondary: #4a7ba7    // Medium Blue - Hover states
$success: #27ae60      // Green - Success states
$danger: #e74c3c       // Red - Overdue/Error
$warning: #f39c12      // Orange - Caution
$info: #3498db         // Sky Blue - Info
$light: #f8f9fa        // Off-white
$dark: #2c3e50         // Dark Gray - Text
```

## 🧩 Using Context in Components

```javascript
import { useMaintenance } from '../hooks/useMaintenance';

function MyComponent() {
  const { requests, equipment, moveRequest, createRequest } = useMaintenance();
  
  // Use these in your component
}
```

## 📱 Responsive Breakpoints

```scss
@media (max-width: 1400px) { /* Desktop adjustments */ }
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 480px)  { /* Small mobile */ }
```

## 🎯 Component Props Quick Guide

### KanbanBoard
```javascript
<KanbanBoard onCardClick={(request) => console.log(request)} />
```

### CalendarView
```javascript
<CalendarView onCreateRequest={(date) => console.log(date)} />
```

### EquipmentManagementForm
```javascript
<EquipmentManagementForm 
  equipmentId="1"
  onMaintenance={(id) => console.log(id)}
/>
```

### CreationModal
```javascript
<CreationModal 
  show={showModal}
  onHide={() => setShowModal(false)}
  selectedDate={selectedDate}
  onSuccess={() => console.log('Created')}
/>
```

## 📝 Common Tasks

### Add a New Status to Kanban
Edit `src/context/MaintenanceContext.jsx`:
```javascript
const statusColumns = {
  new: { title: 'New', color: '#3498db', count: 0 },
  in_progress: { title: 'In Progress', color: '#f39c12', count: 0 },
  repaired: { title: 'Repaired', color: '#27ae60', count: 0 },
  scrap: { title: 'Scrap', color: '#95a5a6', count: 0 },
  // ADD NEW STATUS HERE
};
```

### Change Primary Color
Edit `src/styles/theme.scss`:
```scss
$primary: #1f3a5f;  // Change this value
```

### Add Equipment
Edit `src/context/MaintenanceContext.jsx`:
```javascript
const [equipment, setEquipment] = useState([
  // ... existing equipment ...
  {
    id: '4',
    name: 'New Equipment Name',
    serial: 'SERIAL-123456',
    department: 'Department',
    employee: 'Employee Name',
    warrantyExpiry: new Date(Date.now() + 31536000000),
    activeRequestCount: 0,
    team: 'Team Name',
    category: 'Category',
  },
]);
```

## 🔍 Debugging Tips

```javascript
// Log state changes
console.log('Requests:', requests);
console.log('Equipment:', equipment);

// React DevTools
// Install "React DevTools" browser extension
// Use Components tab to inspect component state

// Chrome DevTools
// Open DevTools (F12)
// Go to Console tab
// Type: localStorage.getItem('authToken')
```

## 📦 Installation Troubleshooting

If `npm install` fails:
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps

# If still failing, clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 🌐 Environment Variables

Create `.env` file in project root:
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🎯 Most Common Edits

1. **Change request data**: `src/context/MaintenanceContext.jsx` (useState section)
2. **Add/edit equipment**: `src/context/MaintenanceContext.jsx` (equipment array)
3. **Modify styling**: `src/styles/theme.scss` or component-specific .scss files
4. **Change colors**: `src/styles/theme.scss` (variables section)
5. **Update nav items**: `src/App.jsx` (navbar-menu section)

## 📊 Data Structure

### Request Object
```javascript
{
  id: '1',
  subject: 'Title',
  equipmentName: 'Equipment Name',
  priority: 'high|medium|low',
  status: 'new|in_progress|repaired|scrap',
  type: 'corrective|preventive',
  dueDate: Date object,
  assignedTechnician: { name: 'Name', avatar: '👨‍🔧' }
}
```

### Equipment Object
```javascript
{
  id: '1',
  name: 'Equipment Name',
  serial: 'SERIAL-123',
  department: 'Dept Name',
  employee: 'Employee Name',
  team: 'Team Name',
  category: 'Category',
  warrantyExpiry: Date object,
  activeRequestCount: 2
}
```

## 🔗 Useful Links

- React Docs: https://react.dev
- Bootstrap Docs: https://getbootstrap.com/docs
- Vite Docs: https://vitejs.dev
- Lucide Icons: https://lucide.dev
- React Beautiful DND: https://github.com/atlassian/react-beautiful-dnd

## 💡 Pro Tips

1. **Hot Reload**: Save any file to auto-refresh browser during development
2. **Component Reuse**: Move common code to custom hooks in `/hooks/`
3. **Styling Organization**: Keep component styles in same folder as component
4. **Performance**: Use React DevTools Profiler to find slow renders
5. **Testing**: Use Chrome DevTools > Elements tab to inspect styles in real-time

## 🆘 Getting Help

1. Check `GEARGUARD_README.md` for features
2. Check `DEVELOPMENT_GUIDE.js` for how-tos
3. Check `API_INTEGRATION_GUIDE.js` for backend connection
4. Console errors usually indicate missing imports or typos
5. Check browser console (F12) for detailed error messages

---

**Last Updated**: December 27, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✓
