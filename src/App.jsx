import { useState } from 'react';
import { MaintenanceProvider } from './context/MaintenanceContext';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import EquipmentManagementForm from './components/EquipmentManagementForm';
import CreationModal from './components/CreationModal';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('1');

  const handleCardClick = (request) => {
    console.log('Card clicked:', request);
  };

  const handleCreateRequest = (date) => {
    setSelectedDate(date);
    setShowCreationModal(true);
  };

  const handleMaintenanceClick = (equipmentId) => {
    setCurrentView('equipment');
    setSelectedEquipmentId(equipmentId);
  };

  return (
    <MaintenanceProvider>
      <div className="app-wrapper">
        {/* Navigation */}
        <nav className="app-navbar">
          <div className="navbar-container">
            <div className="navbar-brand">
              <h1>⚙️ GearGuard</h1>
              <span className="brand-subtitle">Maintenance Management System</span>
            </div>

            <div className="navbar-menu">
              <button
                className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
              >
                📊 Dashboard
              </button>
              <button
                className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
                onClick={() => setCurrentView('calendar')}
              >
                📅 Calendar
              </button>
              <button
                className={`nav-item ${currentView === 'equipment' ? 'active' : ''}`}
                onClick={() => setCurrentView('equipment')}
              >
                🔧 Equipment
              </button>
              <button
                className="nav-item create-btn"
                onClick={() => setShowCreationModal(true)}
              >
                ➕ New Request
              </button>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <main className="app-content">
          {currentView === 'dashboard' && (
            <KanbanBoard onCardClick={handleCardClick} />
          )}

          {currentView === 'calendar' && (
            <CalendarView onCreateRequest={handleCreateRequest} />
          )}

          {currentView === 'equipment' && (
            <EquipmentManagementForm
              equipmentId={selectedEquipmentId}
              onMaintenance={handleMaintenanceClick}
            />
          )}
        </main>

        {/* Creation Modal */}
        <CreationModal
          show={showCreationModal}
          onHide={() => setShowCreationModal(false)}
          selectedDate={selectedDate}
          onSuccess={() => {
            setSelectedDate(null);
          }}
        />
      </div>
    </MaintenanceProvider>
  );
}

export default App;
