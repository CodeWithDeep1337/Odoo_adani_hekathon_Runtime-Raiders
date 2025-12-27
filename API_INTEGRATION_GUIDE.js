/**
 * GearGuard API Integration Guide
 * 
 * This document provides guidance for integrating GearGuard frontend
 * with a backend API (Node.js/Express, Django, etc.)
 */

// ============================================================================
// 1. API ENDPOINTS MAPPING
// ============================================================================

/*
SUGGESTED API STRUCTURE:

Base URL: http://api.gearguard.local/api/v1

MAINTENANCE REQUESTS:
POST   /requests                 - Create new request
GET    /requests                 - List all requests
GET    /requests/:id             - Get single request
PUT    /requests/:id             - Update request
DELETE /requests/:id             - Delete request
PATCH  /requests/:id/status      - Update request status
GET    /requests/equipment/:equipmentId - Get requests for equipment
GET    /requests?status=new&priority=high - Filter requests

EQUIPMENT:
POST   /equipment                - Create new equipment
GET    /equipment                - List all equipment
GET    /equipment/:id            - Get equipment details
PUT    /equipment/:id            - Update equipment
DELETE /equipment/:id            - Delete equipment
GET    /equipment/:id/requests   - Get equipment's requests

TECHNICIANS:
GET    /technicians              - List all technicians
GET    /technicians/:id          - Get technician details

TEAMS:
GET    /teams                    - List all teams
GET    /teams/:id                - Get team details

CATEGORIES:
GET    /categories               - List all equipment categories
*/

// ============================================================================
// 2. API SERVICE SETUP
// ============================================================================

/*
CREATE: src/services/api.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if user is authenticated
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    throw error;
  }
);

export default api;
*/

// ============================================================================
// 3. UPDATING CONTEXT FOR API CALLS
// ============================================================================

/*
MODIFY: src/context/MaintenanceContext.jsx

Replace useState with useQuery and useMutation from React Query:

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const MaintenanceProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // Fetch requests
  const { data: requests = [] } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const response = await api.get('/requests');
      return response;
    },
  });

  // Fetch equipment
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await api.get('/equipment');
      return response;
    },
  });

  // Move request (update status)
  const moveRequestMutation = useMutation({
    mutationFn: ({ requestId, newStatus }) =>
      api.patch(`/requests/${requestId}/status`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  const moveRequest = (requestId, newStatus) => {
    moveRequestMutation.mutate({ requestId, newStatus });
  };

  // Create request
  const createRequestMutation = useMutation({
    mutationFn: (newRequest) =>
      api.post('/requests', newRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  const createRequest = (newRequest) => {
    createRequestMutation.mutate(newRequest);
  };

  // ... similar pattern for updateEquipment
};
*/

// ============================================================================
// 4. REQUEST/RESPONSE FORMATS
// ============================================================================

/*
MAINTENANCE REQUEST

POST /requests - Create
Request Body:
{
  "subject": "Hydraulic Pump Repair",
  "equipmentId": "1",
  "type": "corrective",
  "priority": "high",
  "dueDate": "2024-01-15",
  "description": "Pump leaking oil",
  "assignedToId": "5"
}

Response (201 Created):
{
  "id": "req-001",
  "subject": "Hydraulic Pump Repair",
  "equipmentId": "1",
  "equipmentName": "Excavator XL-2000",
  "type": "corrective",
  "priority": "high",
  "status": "new",
  "dueDate": "2024-01-15",
  "createdAt": "2024-01-10T10:30:00Z",
  "updatedAt": "2024-01-10T10:30:00Z",
  "assignedTo": {
    "id": "5",
    "name": "John Doe",
    "avatar": "https://..."
  }
}

GET /requests - List
Response:
{
  "success": true,
  "data": [
    { /* request objects */ }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}

PATCH /requests/:id/status - Update Status
Request Body:
{
  "status": "in_progress"
}

Response:
{
  "success": true,
  "data": { /* updated request */ }
}
*/

// ============================================================================
// 5. ERROR HANDLING
// ============================================================================

/*
IMPLEMENT ERROR BOUNDARIES:

Create: src/components/ErrorBoundary.jsx

import React from 'react';
import { Alert, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="danger">
          <h4>Something went wrong</h4>
          <p>{this.state.error?.message}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

Use in App.jsx:
<ErrorBoundary>
  <MaintenanceProvider>
    {/* App content */}
  </MaintenanceProvider>
</ErrorBoundary>
*/

// ============================================================================
// 6. LOADING & ERROR STATES
// ============================================================================

/*
HANDLE LOADING STATES:

In CreationModal.jsx:
const { createRequestMutation } = useMaintenance();

return (
  <Modal show={show} onHide={onHide} backdrop={createRequestMutation.isPending ? 'static' : true}>
    {createRequestMutation.isPending && <Spinner />}
    {createRequestMutation.isError && (
      <Alert variant="danger">{createRequestMutation.error.message}</Alert>
    )}
    {createRequestMutation.isSuccess && (
      <Alert variant="success">Request created successfully!</Alert>
    )}
  </Modal>
);

IN KANBAN BOARD:
const { requests, moveRequestMutation } = useMaintenance();

if (moveRequestMutation.isPending) {
  return <Spinner />;
}

if (moveRequestMutation.isError) {
  return <Alert variant="danger">Error updating request</Alert>;
}
*/

// ============================================================================
// 7. AUTHENTICATION SETUP
// ============================================================================

/*
CREATE: src/context/AuthContext.jsx

import React, { createContext, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await api.get('/auth/verify');
        setUser(response.user);
        setIsAuthenticated(true);
      } catch {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
*/

// ============================================================================
// 8. REAL-TIME UPDATES WITH WEBSOCKET
// ============================================================================

/*
FOR REAL-TIME NOTIFICATIONS:

CREATE: src/services/websocket.js

export const initializeWebSocket = (userId) => {
  const ws = new WebSocket(import.meta.env.VITE_WS_URL);

  ws.onopen = () => {
    console.log('WebSocket connected');
    ws.send(JSON.stringify({ type: 'subscribe', userId }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'request_updated') {
      // Emit event to update UI
      window.dispatchEvent(new CustomEvent('requestUpdated', { detail: data }));
    }
  };

  return ws;
};

USE IN CONTEXT:
useEffect(() => {
  if (user) {
    const ws = initializeWebSocket(user.id);
    
    const handleUpdate = (event) => {
      // Update state with new data
      setRequests(prev => 
        prev.map(r => r.id === event.detail.id ? event.detail : r)
      );
    };

    window.addEventListener('requestUpdated', handleUpdate);
    return () => window.removeEventListener('requestUpdated', handleUpdate);
  }
}, [user]);
*/

// ============================================================================
// 9. CACHING & OPTIMIZATION
// ============================================================================

/*
REACT QUERY CONFIGURATION:

CREATE: src/config/queryClient.js

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,    // 10 minutes (formerly cacheTime)
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

USE IN MAIN.JSX:

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  document.getElementById('root')
);
*/

// ============================================================================
// 10. PAGINATION & FILTERING
// ============================================================================

/*
IMPLEMENT PAGINATION:

const [page, setPage] = useState(1);
const [filters, setFilters] = useState({ status: 'new', priority: 'high' });

const { data: response } = useQuery({
  queryKey: ['requests', page, filters],
  queryFn: async () => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', 20);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/requests?${params}`);
    return response;
  },
});

// Use response.pagination for pagination controls
*/

// ============================================================================
// 11. FORM SUBMISSION WITH VALIDATION
// ============================================================================

/*
SERVER-SIDE VALIDATION HANDLING:

const createRequestMutation = useMutation({
  mutationFn: (data) => api.post('/requests', data),
  onError: (error) => {
    if (error.response?.status === 422) {
      // Validation error - display field errors
      const errors = error.response.data.errors;
      Object.keys(errors).forEach(field => {
        // Update form state with field errors
        setFieldError(field, errors[field][0]);
      });
    }
  },
});
*/

// ============================================================================
// 12. ENVIRONMENT CONFIGURATION
// ============================================================================

/*
CREATE: .env.local (for development)

# API Configuration
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000

# Features
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false

ACCESS IN CODE:
const apiUrl = import.meta.env.VITE_API_URL;

.env.production (for production)
VITE_API_URL=https://api.gearguard.com/api/v1
VITE_WS_URL=wss://api.gearguard.com

Never commit .env files to Git!
*/

// ============================================================================
// 13. DEVELOPMENT VS PRODUCTION
// ============================================================================

/*
ENVIRONMENT-SPECIFIC CODE:

if (import.meta.env.DEV) {
  // Only in development
  console.log('Development mode');
} else {
  // Only in production
  // Send analytics
}

BUILD COMMANDS:
npm run build          // Production build
npm run build -- --mode development  // Dev build
npm run preview        // Preview production build locally
*/

// ============================================================================
// 14. TESTING WITH MOCK DATA
// ============================================================================

/*
MOCK DATA APPROACH:

Create: src/config/mockServer.js (using MSW - Mock Service Worker)

npm install msw

Then setup mock handlers for all API routes during testing.
This allows development without backend being ready.
*/

export default {};
