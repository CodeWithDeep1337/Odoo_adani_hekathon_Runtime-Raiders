import React, { useState } from 'react';
import {
  Card,
  Form,
  Button,
  Badge,
  Row,
  Col,
  Table,
  Modal,
  ListGroup,
} from 'react-bootstrap';
import {
  Wrench,
  Edit2,
  Save,
  X,
  Calendar,
  Zap,
  DollarSign,
} from 'lucide-react';
import { useMaintenance } from '../hooks/useMaintenance';
import '../styles/equipment.scss';

const EquipmentManagementForm = ({ equipmentId, onMaintenance }) => {
  const { equipment, requests, getRequestsByEquipment } = useMaintenance();
  const [editMode, setEditMode] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const currentEquipment = equipment.find((eq) => eq.id === equipmentId);
  const [formData, setFormData] = useState(currentEquipment || {});
  const equipmentRequests = getRequestsByEquipment(equipmentId);

  if (!currentEquipment) {
    return <div className="alert alert-warning">Equipment not found</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setEditMode(false);
    // In a real app, this would call the update function
  };

  const isWarrantyExpiring = () => {
    const daysLeft = Math.floor(
      (new Date(currentEquipment.warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 90;
  };

  const daysLeftInWarranty = () => {
    const daysLeft = Math.floor(
      (new Date(currentEquipment.warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft;
  };

  return (
    <div className="equipment-container">
      <div className="equipment-header">
        <div className="header-content">
          <h1>{currentEquipment.name}</h1>
          <p className="serial">Serial: {currentEquipment.serial}</p>
        </div>

        <div className="header-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              if (onMaintenance) onMaintenance(equipmentId);
              setShowRequestsModal(true);
            }}
            className="maintenance-btn"
          >
            <Wrench size={20} />
            Maintenance
            <Badge bg="danger" className="request-badge">
              {currentEquipment.activeRequestCount}
            </Badge>
          </Button>

          <Button
            variant="outline-secondary"
            onClick={() => setEditMode(!editMode)}
            className="edit-btn"
          >
            {editMode ? <X size={20} /> : <Edit2 size={20} />}
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="equipment-content">
        <Card className="info-card">
          <Card.Header>
            <h3>General Information</h3>
          </Card.Header>
          <Card.Body>
            {editMode ? (
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Equipment Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Serial Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="serial"
                        value={formData.serial || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  variant="success"
                  onClick={handleSave}
                  className="save-btn"
                >
                  <Save size={18} />
                  Save Changes
                </Button>
              </Form>
            ) : (
              <div className="info-display">
                <Row>
                  <Col md={6}>
                    <div className="info-item">
                      <span className="label">Equipment Name:</span>
                      <span className="value">{currentEquipment.name}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item">
                      <span className="label">Serial Number:</span>
                      <span className="value">{currentEquipment.serial}</span>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card className="info-card">
          <Card.Header>
            <h3>Ownership & Assignment</h3>
          </Card.Header>
          <Card.Body>
            {editMode ? (
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Control
                        type="text"
                        name="department"
                        value={formData.department || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Assigned Employee</Form.Label>
                      <Form.Control
                        type="text"
                        name="employee"
                        value={formData.employee || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Team</Form.Label>
                      <Form.Control
                        type="text"
                        name="team"
                        value={formData.team || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Control
                        type="text"
                        name="category"
                        value={formData.category || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  variant="success"
                  onClick={handleSave}
                  className="save-btn"
                >
                  <Save size={18} />
                  Save Changes
                </Button>
              </Form>
            ) : (
              <div className="info-display">
                <Row>
                  <Col md={6}>
                    <div className="info-item">
                      <span className="label">Department:</span>
                      <span className="value">{currentEquipment.department}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item">
                      <span className="label">Employee:</span>
                      <span className="value">{currentEquipment.employee}</span>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <div className="info-item">
                      <span className="label">Team:</span>
                      <span className="value">{currentEquipment.team}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item">
                      <span className="label">Category:</span>
                      <span className="value">{currentEquipment.category}</span>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card className="info-card warranty-card">
          <Card.Header>
            <h3>
              <Calendar size={20} />
              Warranty Information
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="warranty-info">
              <div className="warranty-item">
                <span className="label">Warranty Expiry:</span>
                <span className="value">
                  {new Date(currentEquipment.warrantyExpiry).toLocaleDateString()}
                </span>
              </div>
              <div className="warranty-item">
                <span className="label">Days Remaining:</span>
                <span className={`value ${isWarrantyExpiring() ? 'expiring' : ''}`}>
                  {daysLeftInWarranty()} days
                </span>
              </div>
              {isWarrantyExpiring() && (
                <div className="alert alert-warning mt-3">
                  ⚠️ Warranty expiring soon!
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        <Card className="info-card">
          <Card.Header>
            <h3>
              <Wrench size={20} />
              Active Maintenance Requests ({equipmentRequests.length})
            </h3>
          </Card.Header>
          <Card.Body>
            {equipmentRequests.length > 0 ? (
              <ListGroup variant="flush">
                {equipmentRequests.map((req) => (
                  <ListGroup.Item key={req.id} className="request-list-item">
                    <div className="request-info-display">
                      <div className="request-header">
                        <h5>{req.subject}</h5>
                        <Badge
                          bg={
                            req.priority === 'high'
                              ? 'danger'
                              : req.priority === 'medium'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {req.priority}
                        </Badge>
                      </div>
                      <p className="request-meta">
                        <span>{req.type}</span> •{' '}
                        <span>{req.assignedTechnician.name}</span>
                      </p>
                      <Badge bg="info">{req.status}</Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="no-requests-text">No active maintenance requests</p>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Requests Modal */}
      <Modal
        show={showRequestsModal}
        onHide={() => setShowRequestsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Maintenance Requests - {currentEquipment.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {equipmentRequests.length > 0 ? (
            <Table striped hover>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {equipmentRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.subject}</td>
                    <td>
                      <Badge bg="info">{req.type}</Badge>
                    </td>
                    <td>{req.status}</td>
                    <td>
                      <Badge
                        bg={
                          req.priority === 'high'
                            ? 'danger'
                            : req.priority === 'medium'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {req.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="no-requests-text">No maintenance requests found</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRequestsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EquipmentManagementForm;
