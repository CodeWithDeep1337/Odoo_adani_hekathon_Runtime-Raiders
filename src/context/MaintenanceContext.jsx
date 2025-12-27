import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const MaintenanceContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base URL and headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const MaintenanceProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all equipment from backend
  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/equipment');
      if (response.data && response.data.data) {
        // Map API response to UI format
        const mappedEquipment = response.data.data.map(eq => ({
          id: eq.id,
          name: eq.equipmentName,
          serial: eq.serialNumber,
          department: eq.department,
          employee: eq.assignedEmployee,
          warrantyExpiry: new Date(eq.warrantyExpiry),
          activeRequestCount: 0, // Will be calculated from requests
          team: eq.maintenanceTeamId || 'Unknown',
          category: eq.category,
          location: eq.location,
          isScrapped: eq.isScrapped,
        }));
        setEquipment(mappedEquipment);
      }
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError(err.message || 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all maintenance requests from backend
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/requests');
      if (response.data && response.data.data) {
        // Map API response to UI format
        const mappedRequests = response.data.data.map(req => ({
          id: req.id,
          subject: req.subject,
          equipmentName: getEquipmentName(req.equipmentId),
          priority: req.requestType === 'Corrective' ? 'high' : 'medium',
          status: req.stage.toLowerCase().replace(/\s+/g, '_'),
          assignedTechnician: { name: req.assignedTechnicianId || 'Unassigned', avatar: '👨‍🔧' },
          dueDate: new Date(req.scheduledDate),
          type: req.requestType.toLowerCase(),
          equipmentId: req.equipmentId,
          durationHours: req.durationHours,
        }));
        setRequests(mappedRequests);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all teams from backend
  const fetchTeams = useCallback(async () => {
    try {
      const response = await apiClient.get('/teams');
      if (response.data && response.data.data) {
        setTeams(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  }, []);

  // Helper to get equipment name by ID
  const getEquipmentName = (equipmentId) => {
    const eq = equipment.find(e => e.id === equipmentId);
    return eq ? eq.name : 'Unknown Equipment';
  };

  // Load data on component mount
  useEffect(() => {
    fetchEquipment();
    fetchRequests();
    fetchTeams();
  }, [fetchEquipment, fetchRequests, fetchTeams]);

  // Move request between statuses
  const moveRequest = useCallback(async (requestId, newStatus) => {
    try {
      // Convert UI status to API stage format
      const stageMap = {
        'new': 'New',
        'in_progress': 'In Progress',
        'repaired': 'Repaired',
        'scrap': 'Scrap'
      };
      const apiStage = stageMap[newStatus] || newStatus;

      // Update on backend
      await apiClient.put(`/requests/${requestId}`, { stage: apiStage });

      // Update local state
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request');
    }
  }, []);

  // Create new maintenance request
  const createRequest = useCallback(async (newRequest) => {
    try {
      const payload = {
        subject: newRequest.subject,
        requestType: newRequest.type === 'corrective' ? 'Corrective' : 'Preventive',
        equipmentId: newRequest.equipmentId,
        assignedTechnicianId: newRequest.assignedTechnicianId || null,
        scheduledDate: newRequest.dueDate ? newRequest.dueDate.toISOString().split('T')[0] : null,
        durationHours: newRequest.durationHours || 0,
      };

      const response = await apiClient.post('/requests', payload);
      
      if (response.data && response.data.data) {
        const request = {
          id: response.data.data.id,
          ...newRequest,
          status: 'new',
        };
        setRequests((prev) => [request, ...prev]);
        return request;
      }
    } catch (err) {
      console.error('Error creating request:', err);
      setError('Failed to create maintenance request');
      throw err;
    }
  }, []);

  // Update equipment
  const updateEquipment = useCallback(async (equipmentId, updates) => {
    try {
      // Prepare API payload
      const payload = {
        equipmentName: updates.name,
        serialNumber: updates.serial,
        department: updates.department,
        assignedEmployee: updates.employee,
        warrantyExpiry: updates.warrantyExpiry ? updates.warrantyExpiry.toISOString().split('T')[0] : null,
        category: updates.category,
        location: updates.location,
      };

      // Update on backend
      await apiClient.put(`/equipment/${equipmentId}`, payload);

      // Update local state
      setEquipment((prev) =>
        prev.map((item) => (item.id === equipmentId ? { ...item, ...updates } : item))
      );
    } catch (err) {
      console.error('Error updating equipment:', err);
      setError('Failed to update equipment');
    }
  }, []);

  // Get requests by equipment
  const getRequestsByEquipment = useCallback((equipmentId) => {
    return requests.filter((req) => req.equipmentId === equipmentId);
  }, [requests]);

  // Create equipment
  const createEquipment = useCallback(async (newEquipmentData) => {
    try {
      const payload = {
        equipmentName: newEquipmentData.name,
        serialNumber: newEquipmentData.serial,
        category: newEquipmentData.category,
        purchaseDate: newEquipmentData.purchaseDate ? newEquipmentData.purchaseDate.toISOString().split('T')[0] : null,
        warrantyExpiry: newEquipmentData.warrantyExpiry ? newEquipmentData.warrantyExpiry.toISOString().split('T')[0] : null,
        department: newEquipmentData.department,
        assignedEmployee: newEquipmentData.employee,
        maintenanceTeamId: newEquipmentData.team || null,
        location: newEquipmentData.location,
      };

      const response = await apiClient.post('/equipment', payload);
      
      if (response.data && response.data.data) {
        const eq = {
          id: response.data.data.id,
          ...newEquipmentData,
        };
        setEquipment((prev) => [eq, ...prev]);
        return eq;
      }
    } catch (err) {
      console.error('Error creating equipment:', err);
      setError('Failed to create equipment');
      throw err;
    }
  }, []);

  const value = {
    requests,
    equipment,
    teams,
    loading,
    error,
    moveRequest,
    createRequest,
    updateEquipment,
    getRequestsByEquipment,
    createEquipment,
    fetchEquipment,
    fetchRequests,
    fetchTeams,
  };

  return (
    <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>
  );
};
