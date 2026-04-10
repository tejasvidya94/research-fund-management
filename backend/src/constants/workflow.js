DESIGNATION_TO_STAGE = {
    hod: 'HOD',
    dean: 'DEAN',
    rnd_helper: 'R&D_HELPER',
    rnd_main: 'R&D_MAIN',
    aio: 'ACADEMIC_INTEGRITY_OFFICER',
    finance_officer_helper: 'FINANCE_OFFICER_HELPER',
    finance_officer_main: 'FINANCE_OFFICER_MAIN',
    registrar: 'REGISTRAR',
    vc_office: 'VC_OFFICE',
    vice_chancellor: 'VICE_CHANCELLOR'
};

STAGES = [
    'HOD',
    'DEAN',
    'R&D_HELPER',
    'R&D_MAIN',
    'ACADEMIC_INTEGRITY_OFFICER',
    'FINANCE_OFFICER_HELPER',
    'FINANCE_OFFICER_MAIN',
    'REGISTRAR',
    'VC_OFFICE',
    'VICE_CHANCELLOR',
    'COMPLETED'
];

module.exports = { stages: STAGES, designationToStage: DESIGNATION_TO_STAGE };