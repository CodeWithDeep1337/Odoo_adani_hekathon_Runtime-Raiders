import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { Plus, CheckCircle } from 'lucide-react';
import { useMaintenance } from '../hooks/useMaintenance';
import '../styles/creationModal.scss';

const CreationModal = ({ show, onHide, selectedDate = null, onSuccess }) => {
  const { equipment, createRequest } = useMaintenance();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    type: 'corrective',
    scheduledDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
  });

  // Auto-fill team and category when equipment is selected
  const selectedEquipmentData = equipment.find((eq) => eq.id === selectedEquipmentId);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEquipmentChange = (e) => {
    setSelectedEquipmentId(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newRequest = {
        subject: formData.subject,
        equipmentName: selectedEquipmentData?.name || '',
        type: formData.type,
        priority: 'medium',
        dueDate: formData.scheduledDate,
        assignedTechnician: { name: 'Unassigned', avatar: '👤' },
      };

      createRequest(newRequest);
      setLoading(false);
      setSuccess(true);

      // Reset form
      setTimeout(() => {
        setFormData({ subject: '', type: 'corrective', scheduledDate: '' });
        setSelectedEquipmentId('');
        setSuccess(false);
        onHide();
        if (onSuccess) onSuccess();
      }, 2000);
    }, 800);
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ subject: '', type: 'corrective', scheduledDate: '' });
      setSelectedEquipmentId('');
      setSuccess(false);
      onHide();
    }
  };

  const isFormValid = formData.subject && selectedEquipmentId && formData.scheduledDate;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" backdrop={loading ? 'static' : true} keyboard={!loading}>
      <Modal.Header closeButton={!loading} className="modal-header-premium">
        <Modal.Title className="d-flex align-items-center gap-2">
          <Plus size={24} />
          Create Maintenance Request
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="modal-body-content">
        {success ? (
          <div className="success-message">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h3>Request Created Successfully!</h3>
            <p>Your maintenance request has been created and added to the queue.</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} noValidate>
            {/* Subject Field */}
            <Form.Group className="form-group-premium mb-4">
              <Form.Label className="form-label-premium">
                Request Subject <span className="required">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="subject"
                placeholder="e.g., Engine Oil Change, Hydraulic Repair"
                value={formData.subject}
                onChange={handleInputChange}
                isInvalid={!formData.subject && formData.subject !== ''}
                className="input-premium"
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a request subject.
              </Form.Control.Feedback>
            </Form.Group>

            {/* Equipment Selection */}
            <Form.Group className="form-group-premium mb-4">
              <Form.Label className="form-label-premium">
                Equipment <span className="required">*</span>
              </Form.Label>
              <Form.Select
                name="equipment"
                value={selectedEquipmentId}
                onChange={handleEquipmentChange}
                isInvalid={!selectedEquipmentId && selectedEquipmentId !== ''}
                className="input-premium"
                disabled={loading}
              >
                <option value="">-- Select Equipment --</option>
                {equipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.serial})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select an equipment.
              </Form.Control.Feedback>
            </Form.Group>

            {/* Auto-filled Team and Category */}
            {selectedEquipmentData && (
              <div className="auto-fill-section">
                <Alert variant="info" className="auto-fill-alert">
                  <h6>Inherited from Equipment</h6>
                  <div className="auto-fill-grid">
                    <div className="auto-fill-item">
                      <span className="label">Team:</span>
                      <span className="value">{selectedEquipmentData.team}</span>
                    </div>
                    <div className="auto-fill-item">
                      <span className="label">Category:</span>
                      <span className="value">{selectedEquipmentData.category}</span>
                    </div>
                  </div>
                </Alert>
              </div>
            )}

            {/* Request Type */}
            <Form.Group className="form-group-premium mb-4">
              <Form.Label className="form-label-premium">
                Request Type <span className="required">*</span>
              </Form.Label>
              <div className="type-options">
                <Form.Check
                  type="radio"
                  label="Corrective (Urgent Repair)"
                  name="type"
                  value="corrective"
                  checked={formData.type === 'corrective'}
                  onChange={handleInputChange}
                  id="type-corrective"
                  disabled={loading}
                  className="type-check"
                />
                <Form.Check
                  type="radio"
                  label="Preventive (Scheduled Maintenance)"
                  name="type"
                  value="preventive"
                  checked={formData.type === 'preventive'}
                  onChange={handleInputChange}
                  id="type-preventive"
                  disabled={loading}
                  className="type-check"
                />
              </div>
            </Form.Group>

            {/* Scheduled Date */}
            <Form.Group className="form-group-premium mb-4">
              <Form.Label className="form-label-premium">
                Scheduled Date <span className="required">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                isInvalid={!formData.scheduledDate && formData.scheduledDate !== ''}
                className="input-premium"
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                Please select a scheduled date.
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      {!success && (
        <Modal.Footer className="modal-footer-premium">
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            disabled={loading}
            className="btn-footer"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className="btn-footer btn-submit"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} />
                Create Request
              </>
            )}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default CreationModal;
