// import React, { lazy, Suspense } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import ApproverLayout from '../../layouts/approvers/ApproverLayout';
// const ApproverProjects = lazy(() => import('./ApproverProjects'));
// const ApproverEquipment = lazy(() => import('./ApproverEquipment'));

// const HodDashboard = ({ user, onLogout, notification, showNotification }) => {
//     return (
//         <ApproverLayout
//             user={user}
//             onLogout={onLogout}
//             notification={notification}
//             showNotification={showNotification}
//         >
//             <Suspense fallback={<div>Loading...</div>}>
//                 <Routes>
//                     <Route index element={<Navigate to="projects" replace />} />
//                     <Route path="projects" element={<ApproverProjects user={user} showNotification={showNotification} />} />
//                     <Route path="equipment" element={<ApproverEquipment user={user} showNotification={showNotification} />} />
//                     <Route path="*" element={<Navigate to="projects" replace />} />
//                 </Routes>
//             </Suspense>
//         </ApproverLayout>
//     );
// };

// export default HodDashboard;