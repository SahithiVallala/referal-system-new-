# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd "c:\Users\Sahithi\Desktop\JR Tracker\backend"
npm install
```

**Terminal 2 - Frontend:**
```bash
cd "c:\Users\Sahithi\Desktop\JR Tracker\frontend"
npm install
```

### Step 2: Start the Backend Server

In Terminal 1:
```bash
npm start
```

You should see: `Server listening on 4000`

### Step 3: Start the Frontend

In Terminal 2:
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

## ✨ First Time Usage

### Add Your First Contact

1. Fill in the form on the left side:
   - **Name**: Enter employee's full name
   - **Email**: Enter email address
   - **Phone**: Enter phone number
   - **Company**: Current company name
   - **Designation**: Job title

2. Click **"Add Contact"** button

3. Your contact will appear in the list on the right!

### Import Multiple Contacts from Excel

1. Click the **blue "+" button** in the bottom-right corner

2. Either:
   - Drag and drop your Excel file into the modal, OR
   - Click to browse and select your Excel file

3. Your Excel should have these columns:
   ```
   Name | Email | Phone | Company | Designation
   ```

4. Review the import results:
   - ✅ Contacts added
   - ⚠️ Duplicates skipped

### Log a Contact

1. Click on any contact card in the list

2. A modal will open with a contact log form

3. Fill in:
   - **Contacted By**: Your name or recruiter name
   - **Response Status**: 
     - Choose "Pending" if waiting for response
     - Choose "Has Job Requirement" if they have openings
     - Choose "No Job Requirement" if they don't have openings
   - **Follow-up Date**: (Optional) Set a reminder date
   - **Notes**: Add any relevant notes

4. Click **"Save Contact Log"**

### Add a Job Requirement

1. When logging a contact, if you select **"Has Job Requirement"**

2. After saving the log, you'll automatically move to Step 2

3. Fill in the job details:
   - **Job Role**: e.g., "Senior Software Engineer"
   - **Experience Required**: e.g., "3-5 years"
   - **Number of Openings**: e.g., 2
   - **Skills Required**: e.g., "React, Node.js, Python"
   - **Job Description**: Detailed description

4. Click **"Save Requirement"**

### Export to Excel

Click the **"Export Excel"** button on the Dashboard to download all job requirements as an Excel file.

## 🔍 Search and Filter

### Search Contacts
Use the search bar to find contacts by:
- Name
- Email
- Company name

### Filter by Status
Click filter buttons to view:
- **All**: Show all contacts
- **Contacted**: Show only contacted people
- **Not Contacted**: Show people you haven't reached out to yet
- **Has Requirement**: Show contacts with job openings
- **No Requirement**: Show contacts without openings

## 📊 Understanding the Dashboard

The dashboard shows real-time statistics:

1. **Total Contacts**: All contacts in your database
2. **Contacted**: Number of people you've reached out to
3. **Has Requirements**: Contacts with confirmed job openings
4. **Pending Follow-ups**: Contacts with scheduled follow-up dates

The dashboard also shows recent job requirements with quick details.

## 🎨 UI Features You'll Love

### Animated Elements
- Smooth transitions when hovering over cards
- Fade-in animations when loading data
- Scale effects on buttons
- Beautiful gradient backgrounds

### Color-Coded Status Badges
- 🟡 **Yellow**: Not Contacted
- 🟢 **Green**: Has Requirement
- 🔴 **Red**: No Requirement
- 🔵 **Blue**: Pending Response

### Responsive Design
The application works beautifully on:
- Desktop computers
- Tablets
- Mobile phones

## 💡 Pro Tips

1. **Bulk Import First**: If you have many contacts, use Excel import to save time

2. **Set Follow-ups**: Always set follow-up dates for better tracking

3. **Add Detailed Notes**: Use the notes field to capture conversation details

4. **Regular Exports**: Export requirements regularly for reporting

5. **Search Often**: Use search to quickly find specific contacts

6. **Filter Smartly**: Use filters to focus on specific groups (e.g., "Not Contacted")

## 🐛 Troubleshooting

### Backend won't start
- Make sure port 4000 is not in use
- Try closing and reopening the terminal
- Check that npm install completed successfully

### Frontend won't start  
- Make sure port 3000 is not in use
- Clear cache: Close browser, restart frontend
- Check that npm install completed successfully

### Excel import not working
- Verify your file is .xlsx or .xls format
- Check that columns are in the correct order
- Make sure the 'uploads' folder exists in the backend directory

### Can't see contacts
- Refresh the page
- Check that the backend is running
- Open browser console (F12) to check for errors

## 📞 Common Workflows

### Daily Workflow
1. Check dashboard for follow-ups
2. Contact people on follow-up list
3. Log contact results
4. Add any new requirements
5. Export data at end of day

### Weekly Workflow
1. Import new batch of contacts from Excel
2. Review "Not Contacted" filter
3. Plan outreach strategy
4. Export comprehensive report

### Monthly Workflow
1. Review all statistics
2. Export all requirements
3. Analyze trends
4. Plan next month's contacts

## 🎯 Best Practices

1. **Consistent Naming**: Use full names for better searchability
2. **Complete Information**: Fill in as many fields as possible
3. **Regular Updates**: Log contacts immediately after calls
4. **Timely Follow-ups**: Set realistic follow-up dates
5. **Detailed Requirements**: Capture all job requirement details

## 🌟 Advanced Features

### Quick Actions
- Click contact cards to log immediately
- Hover over elements for additional info
- Use keyboard shortcuts (Tab, Enter) in forms

### Status Tracking
- Contacts automatically update status based on logs
- Latest log always shows on contact card
- Historical logs are preserved

### Data Integrity
- Automatic duplicate prevention
- Validation for required fields
- Error messages for invalid data

---

## 🎉 You're Ready!

Start by adding your first contact or importing an Excel file. The modern UI will guide you through the rest!

**Need more help?** Check out the full README.md for detailed documentation.

---

**Happy Recruiting! 🚀**
