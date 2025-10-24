# Contact & Job Requirement Tracking System

A modern web application designed for staffing organizations to efficiently manage communications with former employees and track job requirements from their current companies.

## ✨ Features

### Core Functionality
- **📇 Contact Management**: Add and store details of former employees with comprehensive information
- **📊 Contact Status Tracking**: Track whether employees have been contacted and their responses
- **💼 Job Requirement Management**: Record detailed job requirements including role, experience, skills, and openings
- **📥 Excel Import**: Bulk import contacts from Excel files via drag-and-drop interface
- **📤 Excel Export**: Automatically export all job requirements to Excel for easy sharing
- **🔔 Follow-up Reminders**: Set follow-up dates to ensure timely re-engagement
- **🔍 Smart Search & Filtering**: Search and filter contacts by multiple criteria
- **📈 Real-time Dashboard**: View statistics and metrics at a glance

### Modern UI/UX
- **🎨 Beautiful Gradient Design**: Eye-catching gradients and modern color schemes
- **✨ Smooth Animations**: Framer Motion powered animations throughout
- **📱 Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **🎯 Intuitive Interface**: Easy-to-use with clear visual feedback
- **🚀 Fast Performance**: Optimized for speed with efficient state management

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for lightweight data storage
- **ExcelJS** for Excel file generation and parsing
- **Multer** for file upload handling

### Frontend
- **React 18** for UI components
- **TailwindCSS** for modern styling
- **Framer Motion** for smooth animations
- **Lucide React** for beautiful icons
- **Axios** for API communication
- **XLSX** for Excel file processing

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## 🚀 Installation

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## ▶️ Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm start
```

The backend will run on `http://localhost:4000`

### 2. Start the Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## 📖 Usage Guide

### Adding Contacts Manually

1. Fill in the contact form with:
   - Full Name (required)
   - Email
   - Phone Number
   - Current Company
   - Designation
2. Click "Add Contact"

### Importing Contacts from Excel

1. Click the floating "+" button in the bottom-right corner
2. Drag and drop your Excel file or click to browse
3. Excel format should have these columns:
   - Column 1: Name
   - Column 2: Email
   - Column 3: Phone
   - Column 4: Company
   - Column 5: Designation
4. View import results showing added/skipped contacts

### Contacting & Logging

1. Click on any contact card
2. Fill in the contact log:
   - Contacted By (recruiter name)
   - Response Status (Pending/Has Requirement/No Requirement)
   - Follow-up Date (optional)
   - Notes
3. If status is "Has Job Requirement", proceed to step 2 to add job details
4. Fill in job requirement information:
   - Job Role
   - Experience Required
   - Number of Openings
   - Skills Required
   - Job Description
5. Click "Save Requirement"

### Searching & Filtering

- Use the search bar to find contacts by name, email, or company
- Use filter buttons to view:
  - All contacts
  - Contacted only
  - Not contacted
  - Has requirements
  - No requirements

### Exporting Data

Click the "Export Excel" button on the Dashboard or in the Job Requirements modal to download all requirements as an Excel file.

## 📂 Project Structure

```
JR Tracker/
├── backend/
│   ├── routes/
│   │   ├── contacts.js      # Contact management APIs
│   │   └── requirements.js  # Job requirement APIs
│   ├── uploads/             # Temporary upload directory
│   ├── db.js                # Database configuration
│   ├── server.js            # Express server setup
│   ├── tracker.db           # SQLite database
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ContactForm.js       # Add contact form
    │   │   ├── ContactList.js       # Contact list with search/filter
    │   │   ├── Dashboard.js         # Statistics dashboard
    │   │   ├── RequirementForm.js   # Contact log & job requirement modal
    │   │   └── ExcelImport.js       # Excel import with drag-and-drop
    │   ├── utils/
    │   │   └── api.js               # Axios API configuration
    │   ├── App.js                   # Main application component
    │   ├── index.css                # Global styles with Tailwind
    │   └── index.js                 # React entry point
    ├── public/
    ├── tailwind.config.js           # Tailwind configuration
    ├── postcss.config.js            # PostCSS configuration
    └── package.json
```

## 🔐 Database Schema

### Contacts Table
```sql
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- email (TEXT)
- phone (TEXT)
- company (TEXT)
- designation (TEXT)
- added_at (TEXT)
```

### Contact Logs Table
```sql
- id (TEXT, PRIMARY KEY)
- contact_id (TEXT, FOREIGN KEY)
- contacted_at (TEXT)
- contacted_by (TEXT)
- response (TEXT) - 'yes', 'no', or 'pending'
- follow_up_date (TEXT)
- notes (TEXT)
```

### Requirements Table
```sql
- id (TEXT, PRIMARY KEY)
- contact_id (TEXT, FOREIGN KEY)
- role (TEXT)
- experience (TEXT)
- skills (TEXT)
- openings (INTEGER)
- description (TEXT)
- created_at (TEXT)
```

## 🎯 Key Features Explained

### Duplicate Prevention
The system automatically checks for existing contacts by email or phone to prevent duplicates.

### Smart Status Tracking
- **Not Contacted**: Contact has no logs
- **Pending**: Contact logged but awaiting response
- **Has Requirement**: Contact confirmed job openings
- **No Requirement**: Contact confirmed no openings

### Follow-up System
Set optional follow-up dates when logging contacts. The dashboard shows pending follow-ups count.

### Excel Integration
- **Import**: Bulk add contacts from Excel (skips duplicates automatically)
- **Export**: Download all job requirements with contact details in Excel format

## 🎨 UI Highlights

- **Gradient Headers**: Beautiful blue-to-purple gradients
- **Animated Cards**: Smooth hover effects and scale animations
- **Status Badges**: Color-coded badges for quick status identification
- **Loading States**: Elegant loading spinners for better UX
- **Modal Dialogs**: Full-screen modals with backdrop blur
- **Floating Action Button**: Easy-access "+" button for Excel import
- **Responsive Grid**: Adaptive layout for all screen sizes

## 🐛 Troubleshooting

### Backend won't start
- Ensure port 4000 is not in use
- Check that all backend dependencies are installed
- Verify SQLite is properly installed

### Frontend won't start
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that port 3000 is available
- Ensure Tailwind CSS is properly configured

### Excel import not working
- Verify file format is .xlsx or .xls
- Check that columns are in correct order
- Ensure 'uploads' directory exists in backend folder

## 🚀 Future Enhancements

- Email notifications for follow-ups
- Advanced analytics and reporting
- Multi-user support with authentication
- Real-time collaboration features
- Integration with job boards
- Calendar view for follow-ups
- Mobile app version

## 📄 License

This project is private and proprietary.

## 👥 Support

For support, please contact your system administrator.

---

**Built with ❤️ for efficient staffing operations**
