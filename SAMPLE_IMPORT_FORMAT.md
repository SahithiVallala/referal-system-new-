# Sample Excel Import Format

## Excel File Format for Importing Contacts

When importing contacts using the Excel import feature, your Excel file should have the following format:

### Column Structure

| Column | Header Name | Description | Required | Example |
|--------|-------------|-------------|----------|---------|
| A (1) | Name | Full name of the contact | **Yes** | John Smith |
| B (2) | Email | Email address | **Yes** | john.smith@company.com |
| C (3) | Phone | Phone number | **Yes** | +1 234 567 8900 |
| D (4) | Company | Current company name | Optional | Tech Corp Inc |
| E (5) | Designation | Job title/position | Optional | Senior Manager |

### Sample Data

```
Name                Email                       Phone              Company           Designation
John Smith          john.smith@techcorp.com     +1 234 567 8900   Tech Corp Inc     Senior Manager
Sarah Johnson       sarah.j@innovate.com        +1 234 567 8901   Innovate Ltd      HR Director
Michael Brown       m.brown@startup.io          +1 234 567 8902   Startup IO        CTO
Emily Davis         emily.davis@enterprise.com  +1 234 567 8903   Enterprise Co     Recruiter
```

### Important Notes

1. **First Row**: Can be headers (they will be skipped)
2. **Required Fields**: Name, Email, and Phone are mandatory
3. **Optional Fields**: Company and Designation can be left empty
4. **Duplicates**: The system automatically skips contacts with matching email or phone
5. **Empty Rows**: Empty rows will be skipped automatically
6. **File Format**: Supports .xlsx and .xls formats

### Tips for Best Results

- ✅ Ensure data is clean and formatted consistently
- ✅ Remove any extra sheets (only first sheet is processed)
- ✅ Verify phone numbers are in a consistent format
- ✅ Check email addresses are valid
- ✅ Remove any formulas (use values only)

### What Happens During Import

1. **File Upload**: You drag-and-drop or select your Excel file
2. **Validation**: System checks file format and structure
3. **Processing**: Each row is processed sequentially
4. **Duplicate Check**: Existing contacts are identified and skipped
5. **Results**: You'll see a summary showing:
   - Number of contacts added
   - Number of contacts skipped (duplicates)
   - Any errors encountered

### Example Import Workflow

1. Prepare your Excel file with the correct column structure
2. Click the "+" button (bottom-right corner of the screen)
3. Drag and drop your Excel file into the modal
4. Wait for processing (usually takes a few seconds)
5. Review the import summary
6. Check the contacts list to see newly added contacts

### Error Handling

If you encounter errors:
- **"Only Excel files are allowed"**: Ensure file extension is .xlsx or .xls
- **Row errors**: Specific rows with issues will be listed in the error summary
- **Skipped contacts**: These are duplicates already in your database

### Need Help?

If you need a template Excel file:
1. Create a new Excel file
2. Add the headers in row 1: Name, Email, Phone, Company, Designation
3. Fill in your data starting from row 2
4. Save as .xlsx format
5. Import using the application

---

**Happy Importing! 📊**
