# Org Chart Builder

A dynamic organizational chart builder that automatically generates org charts from Excel files.

## Features

- 📊 **Excel File Upload**: Upload `.xlsx` or `.xls` files
- 🔧 **Column Configuration**: Select which columns represent positions and managers
- 🎨 **Dynamic Display**: Choose which columns to display on the chart
- 🌳 **Interactive Visualization**: Beautiful, hierarchical org chart display
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Upload Excel File**: Click or drag an Excel file (.xlsx or .xls) into the upload area
2. **Configure Columns**:
   - Select the **Position Column**: This should contain unique position identifiers
   - Select the **Manager Column**: This should contain the manager for each position
   - Select **Display Columns**: Choose which additional columns to show on each node
3. **View Chart**: The org chart will automatically update as you configure the columns

## Excel File Format

Your Excel file should have:
- A header row with column names
- A column for unique position identifiers
- A column for manager references (should reference positions from the position column)
- Optional additional columns for display (name, department, email, etc.)

### Example Excel Structure

| Position | Manager | Name | Department | Email |
|----------|---------|------|------------|-------|
| CEO | | John Doe | Executive | john@company.com |
| CTO | CEO | Jane Smith | Technology | jane@company.com |
| VP Engineering | CTO | Bob Johnson | Engineering | bob@company.com |

## Technologies Used

- React 18
- Vite
- xlsx (Excel parsing)
- react-organizational-chart (Chart visualization)

## License

MIT

