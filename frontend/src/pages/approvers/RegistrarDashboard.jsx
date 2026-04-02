import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ApproverLayout from '../../layouts/approvers/ApproverLayout';
import ApproverProjects from './ApproverProjects';
import ApproverEquipment from './ApproverEquipment';

const RegistrarDashboard = ({ user, onLogout, notification, showNotification }) => {
    return (
        <ApproverLayout
            user={user}
            onLogout={onLogout}
            notification={notification}
            showNotification={showNotification}
        >
            <Routes>
                <Route path="projects" element={<ApproverProjects user={user} showNotification={showNotification} />} />
                <Route path="equipment" element={<ApproverEquipment user={user} showNotification={showNotification} />} />
                <Route path="/" element={<Navigate to="projects" replace />} />
            </Routes>
        </ApproverLayout>
    );
};

export default RegistrarDashboard;
