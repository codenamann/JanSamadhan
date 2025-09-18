import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';

// Initial state
const initialState = {
  complaints: [],
  currentComplaint: null,
  userRole: 'citizen', // 'citizen' or 'authority'
  userInfo: {
    name: '',
    mobile: '',
    id: ''
  },
  socket: null,
  isConnected: false,
  complaintFlow: {
    step: 0,
    photo: null,
    location: null,
    type: '',
    userDetails: {
      name: '',
      mobile: ''
    }
  }
};

// Action types
const ActionTypes = {
  SET_USER_ROLE: 'SET_USER_ROLE',
  SET_USER_INFO: 'SET_USER_INFO',
  SET_SOCKET: 'SET_SOCKET',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  ADD_COMPLAINT: 'ADD_COMPLAINT',
  UPDATE_COMPLAINT: 'UPDATE_COMPLAINT',
  SET_COMPLAINTS: 'SET_COMPLAINTS',
  SET_CURRENT_COMPLAINT: 'SET_CURRENT_COMPLAINT',
  UPDATE_COMPLAINT_FLOW: 'UPDATE_COMPLAINT_FLOW',
  RESET_COMPLAINT_FLOW: 'RESET_COMPLAINT_FLOW',
  SET_COMPLAINT_STEP: 'SET_COMPLAINT_STEP'
};

// Reducer
const complaintReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER_ROLE:
      return { ...state, userRole: action.payload };
    
    case ActionTypes.SET_USER_INFO:
      return { ...state, userInfo: { ...state.userInfo, ...action.payload } };
    
    case ActionTypes.SET_SOCKET:
      return { ...state, socket: action.payload };
    
    case ActionTypes.SET_CONNECTION_STATUS:
      return { ...state, isConnected: action.payload };
    
    case ActionTypes.ADD_COMPLAINT:
      return { ...state, complaints: [...state.complaints, action.payload] };
    
    case ActionTypes.UPDATE_COMPLAINT:
      return {
        ...state,
        complaints: state.complaints.map(complaint =>
          complaint.id === action.payload.id ? { ...complaint, ...action.payload } : complaint
        )
      };
    
    case ActionTypes.SET_COMPLAINTS:
      return { ...state, complaints: action.payload };
    
    case ActionTypes.SET_CURRENT_COMPLAINT:
      return { ...state, currentComplaint: action.payload };
    
    case ActionTypes.UPDATE_COMPLAINT_FLOW:
      return {
        ...state,
        complaintFlow: { ...state.complaintFlow, ...action.payload }
      };
    
    case ActionTypes.RESET_COMPLAINT_FLOW:
      return {
        ...state,
        complaintFlow: initialState.complaintFlow
      };
    
    case ActionTypes.SET_COMPLAINT_STEP:
      return {
        ...state,
        complaintFlow: { ...state.complaintFlow, step: action.payload }
      };
    
    default:
      return state;
  }
};

// Create context
const ComplaintContext = createContext();

// Provider component
export const ComplaintProvider = ({ children }) => {
  const [state, dispatch] = useReducer(complaintReducer, initialState);

  // Initialize socket connection
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: true });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: false });
    });

    // Listen for new complaints
    socket.on('newComplaint', (complaint) => {
      dispatch({ type: ActionTypes.ADD_COMPLAINT, payload: complaint });
    });

    // Listen for complaint updates
    socket.on('complaintUpdated', (complaint) => {
      dispatch({ type: ActionTypes.UPDATE_COMPLAINT, payload: complaint });
    });

    dispatch({ type: ActionTypes.SET_SOCKET, payload: socket });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Context value
  const value = {
    ...state,
    dispatch,
    // Helper functions
    setUserRole: (role) => dispatch({ type: ActionTypes.SET_USER_ROLE, payload: role }),
    setUserInfo: (info) => dispatch({ type: ActionTypes.SET_USER_INFO, payload: info }),
    addComplaint: (complaint) => dispatch({ type: ActionTypes.ADD_COMPLAINT, payload: complaint }),
    updateComplaint: (complaint) => dispatch({ type: ActionTypes.UPDATE_COMPLAINT, payload: complaint }),
    setComplaints: (complaints) => dispatch({ type: ActionTypes.SET_COMPLAINTS, payload: complaints }),
    setCurrentComplaint: (complaint) => dispatch({ type: ActionTypes.SET_CURRENT_COMPLAINT, payload: complaint }),
    updateComplaintFlow: (data) => dispatch({ type: ActionTypes.UPDATE_COMPLAINT_FLOW, payload: data }),
    resetComplaintFlow: () => dispatch({ type: ActionTypes.RESET_COMPLAINT_FLOW }),
    setComplaintStep: (step) => dispatch({ type: ActionTypes.SET_COMPLAINT_STEP, payload: step }),
    
    // Socket helpers
    emitComplaint: (complaint) => {
      if (state.socket) {
        state.socket.emit('submitComplaint', complaint);
      }
    },
    emitComplaintUpdate: (complaint) => {
      if (state.socket) {
        state.socket.emit('updateComplaint', complaint);
      }
    }
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};

// Custom hook
export const useComplaint = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaint must be used within a ComplaintProvider');
  }
  return context;
};

export default ComplaintContext;
