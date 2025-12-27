import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AlertCircle, Clock } from 'lucide-react';
import { Badge, Card } from 'react-bootstrap';
import { useMaintenance } from '../hooks/useMaintenance';
import '../styles/kanban.scss';

const KanbanBoard = ({ onCardClick }) => {
  const { requests, moveRequest } = useMaintenance();

  const statusColumns = {
    new: { title: 'New', color: '#3498db', count: 0 },
    in_progress: { title: 'In Progress', color: '#f39c12', count: 0 },
    repaired: { title: 'Repaired', color: '#27ae60', count: 0 },
    scrap: { title: 'Scrap', color: '#95a5a6', count: 0 },
  };

  // Group requests by status
  const groupedRequests = Object.keys(statusColumns).reduce((acc, status) => {
    acc[status] = requests.filter((req) => req.status === status);
    statusColumns[status].count = acc[status].length;
    return acc;
  }, {});

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#e74c3c',
      medium: '#f39c12',
      low: '#95a5a6',
    };
    return colors[priority] || '#95a5a6';
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    moveRequest(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-container">
        <div className="kanban-header">
          <h1>Maintenance Requests - Kanban Board</h1>
          <p className="text-muted">Drag and drop cards to update status</p>
        </div>

        <div className="kanban-columns">
          {Object.entries(statusColumns).map(([statusKey, status]) => (
            <Droppable key={statusKey} droppableId={statusKey}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`kanban-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  style={{
                    borderTopColor: status.color,
                  }}
                >
                  <div className="column-header">
                    <h3 className="column-title">{status.title}</h3>
                    <Badge bg="light" text="dark">
                      {status.count}
                    </Badge>
                  </div>

                  <div className="cards-container">
                    {groupedRequests[statusKey].map((request, index) => (
                      <Draggable key={request.id} draggableId={request.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''} ${
                              isOverdue(request.dueDate) ? 'overdue' : ''
                            }`}
                            onClick={() => onCardClick && onCardClick(request)}
                          >
                            {isOverdue(request.dueDate) && (
                              <div className="overdue-indicator">
                                <AlertCircle size={16} />
                                Overdue
                              </div>
                            )}

                            <div className="card-header-section">
                              <div className="priority-indicator" style={{ borderColor: getPriorityColor(request.priority) }} />
                              <h4 className="card-title">{request.subject}</h4>
                            </div>

                            <p className="card-equipment">{request.equipmentName}</p>

                            <div className="card-footer">
                              <div className="badge-group">
                                <Badge bg="info">{request.type}</Badge>
                                <Badge
                                  bg={request.priority === 'high' ? 'danger' : request.priority === 'medium' ? 'warning' : 'secondary'}
                                >
                                  {request.priority}
                                </Badge>
                              </div>

                              <div className="technician-avatar" title={request.assignedTechnician.name}>
                                {request.assignedTechnician.avatar}
                              </div>
                            </div>

                            {request.dueDate && (
                              <div className="card-date">
                                <Clock size={12} />
                                <small>{new Date(request.dueDate).toLocaleDateString()}</small>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
