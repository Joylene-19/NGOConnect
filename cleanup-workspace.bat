@echo off
echo Cleaning up workspace - removing unnecessary test and documentation files...

REM Remove old documentation files (keeping only the recent ones)
del "ALL_ISSUES_RESOLVED.md" 2>nul
del "APPLICATION_APPROVAL_FIX.md" 2>nul
del "AUTH_ENHANCEMENTS_COMPLETE.md" 2>nul
del "COMPILATION_FIX.md" 2>nul
del "EMAIL_COMPLETE_SETUP.md" 2>nul
del "EMAIL_SETUP_GUIDE.md" 2>nul
del "EMAIL_WORKING_CONFIRMATION.md" 2>nul
del "FINAL_STATUS.md" 2>nul
del "FORGOT_PASSWORD_FIX_COMPLETE.md" 2>nul
del "GMAIL_EMAIL_SUCCESS.md" 2>nul
del "IMPLEMENTATION_COMPLETE.md" 2>nul
del "IMPLEMENTATION_PLAN.md" 2>nul
del "ISSUES_FIXED.md" 2>nul
del "ISSUES_TRACKING.md" 2>nul
del "PASSWORD_RESET_FIXED.md" 2>nul
del "REALISTIC_STATUS.md" 2>nul
del "SIGNUP_FIX.md" 2>nul
del "SYSTEM_DEMO.md" 2>nul
del "TASK_TRACKING_FIX.md" 2>nul

REM Remove test files
del "test-*.js" 2>nul
del "check-*.js" 2>nul
del "check-*.cjs" 2>nul
del "create-*.js" 2>nul
del "create-*.cjs" 2>nul
del "gmail-setup-guide.js" 2>nul
del "test-ngo-dashboard.md" 2>nul

REM Remove backup and old files
del "package-clean.json" 2>nul
del "replit.md" 2>nul
del "sample-certificate-template.html" 2>nul
del "generated-icon.png" 2>nul

REM Remove client backup files
del "client\src\App-backup.tsx" 2>nul
del "client\src\App-new.tsx" 2>nul

echo Cleanup completed! Keeping essential files:
echo - README.md (main documentation)
echo - NEXT_ITERATION_ROADMAP.md (future planning)
echo - VOLUNTEER_DASHBOARD_ENHANCED.md (recent enhancement docs)
echo - Core application files (client/, server/, shared/)
echo - Configuration files (package.json, vite.config.ts, etc.)
pause
