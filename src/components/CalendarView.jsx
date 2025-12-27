import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Card, Badge, Button, Modal } from 'react-bootstrap';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useMaintenance } from '../hooks/useMaintenance';
import '../styles/calendar.scss';
import 'react-calendar/dist/Calendar.css';

const CalendarView = ({ onCreateRequest }) => {
  const { requests } = useMaintenance();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  // Get preventive requests for a specific date
  const getRequestsForDate = (date) => {
    return requests.filter((req) => {
      const reqDate = new Date(req.dueDate);
      return (
        req.type === 'preventive' &&
        reqDate.toDateString() === date.toDateString()
      );
    });
  };

  // Get tile class for calendar dates with requests
  const getTileClassName = ({ date }) => {
    const requestsForDate = getRequestsForDate(date);
    if (requestsForDate.length > 0) {
      return 'has-requests';
    }
    return '';
  };

  // Tile content - show badge count
  const getTileContent = ({ date }) => {
    const requestsForDate = getRequestsForDate(date);
    if (requestsForDate.length > 0) {
      return (
        <div className="tile-content">
          <Badge bg="info" className="request-count">{requestsForDate.length}</Badge>
        </div>
      );
    }
    return null;
  };

  const selectedDateRequests = getRequestsForDate(selectedDate);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleCreateRequest = () => {
    if (onCreateRequest) {
      onCreateRequest(selectedDate);
    }
    setShowModal(false);
  };

  return (
    <div className="calendar-view-container">
      <div className="calendar-view-header">
        <h2>
          <CalendarIcon size={28} />
          Preventive Maintenance Calendar
        </h2>
        <p className="subtitle">Schedule and track preventive maintenance tasks</p>
      </div>

      <div className="calendar-content">
        <div className="calendar-section">
          <Card className="calendar-card">
            <Card.Body>
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                tileClassName={getTileClassName}
                tileContent={getTileContent}
                className="custom-calendar"
              />
            </Card.Body>
          </Card>
        </div>

        <div className="requests-section">
          <Card className="requests-card">
            <Card.Header>
              <div className="header-top">
                <h3>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="create-btn"
                >
                  <Plus size={18} />
                  New Request
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              {selectedDateRequests.length > 0 ? (
                <div className="requests-list">
                  {selectedDateRequests.map((request) => (
                    <div key={request.id} className="request-item">
                      <div className="request-badge">
                        <Badge bg="info">{request.type}</Badge>
                      </div>
                      <div className="request-info">
                        <h5 className="request-title">{request.subject}</h5>
                        <p className="request-equipment">{request.equipmentName}</p>
                        <div className="request-meta">
                          <span className="assigned">
                            {request.assignedTechnician.avatar} {request.assignedTechnician.name}
                          </span>
                          <Badge
                            bg={
                              request.priority === 'high'
                                ? 'danger'
                                : request.priority === 'medium'
                                ? 'warning'
                                : 'secondary'
                            }
                          >
                            {request.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-requests">
                  <CalendarIcon size={48} className="empty-icon" />
                  <p>No preventive maintenance scheduled for this date</p>
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowModal(true)}
                    className="mt-3"
                  >
                    <Plus size={18} />
                    Schedule Now
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Create Request Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Maintenance Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Date:</strong>{' '}
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <div className="alert alert-info">
            Form integration in progress - click the button below to create the full request form
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateRequest}>
            Create Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CalendarView;
