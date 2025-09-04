# XAMPP Setup Instructions

## Required for Dashboard to Work

1. **Download and Install XAMPP**
   - Go to https://www.apachefriends.org/download.html
   - Download XAMPP for Windows
   - Install it (default location: C:\xampp)

2. **Start XAMPP Services**
   - Open XAMPP Control Panel (as Administrator)
   - Start **Apache** service
   - Start **MySQL** service
   - Both should show green "Running" status

3. **Verify MySQL is Working**
   - Open http://localhost/phpmyadmin in browser
   - You should see phpMyAdmin interface
   - The dashboard_db database will be created automatically

## If You Don't Want to Use XAMPP

I can modify the backend to use a simpler file-based storage instead of MySQL. Let me know if you prefer this option.

## Current Status Check

If XAMPP is running properly:
- Backend API: http://localhost:3000/api/health
- Frontend: http://localhost:3067
- phpMyAdmin: http://localhost/phpmyadmin

## Troubleshooting

- Make sure no other applications are using port 3306 (MySQL)
- Run XAMPP Control Panel as Administrator
- Check Windows Firewall settings if needed
