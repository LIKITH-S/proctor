import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('candidate_token');
    
    if (!token) {
        // Redirect to login if no token is found
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
