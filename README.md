
# TimeSync Pro

**TimeSync Pro** is a modern, privacy-focused personal time tracking and productivity analytics application. It runs entirely in the browser using LocalStorage, ensuring your data stays on your device.

![TimeSync Pro](https://via.placeholder.com/1200x600?text=TimeSync+Pro+Dashboard)

## 🚀 Key Features

### 📊 Analytics Dashboard
- **Visual Insights:** Interactive charts showing time distribution, daily averages, and category breakdowns.
- **Trend Analysis:** Compare current performance against previous periods (Week/Month/Year).
- **Recent Activity:** Quick view of your latest time logs.

### ⏱️ Smart Timesheet
- **Multiple Views:** Switch seamlessly between Daily, Weekly, and Monthly grid views.
- **Quick Logging:** Input time in minutes or quantities (for tracked items).
- **Day Settings:** Mark days as WFH (Work From Home), WFO (Office), Site, or Holidays.
- **Notes:** Add detailed notes to any specific time entry.

### 🤖 Automation & Productivity
- **Recurring Tasks:** Set up daily, weekly, or monthly routines that auto-fill your timesheet.
- **Bulk Actions:** Quickly configure settings for multiple days (e.g., set weekends to "Off").
- **Import/Export:** Full support for Excel (.xlsx) import/export and CSV export for data portability.

### 🏷️ Category Management
- **Customizable Tags:** Create categories and sub-categories with custom colors.
- **Defaults:** Set default minutes for specific tasks to speed up data entry.

### 🎨 User Experience
- **Dark Mode:** Fully supported dark theme for late-night productivity.
- **Responsive Design:** Works beautifully on desktop and mobile devices.
- **No Login Required:** Data persists locally in your browser.

## 🛠️ Technology Stack

- **Frontend Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Data Handling:** [SheetJS (XLSX)](https://sheetjs.com/)

## 📂 Project Structure

```text
src/
├── components/         # Reusable UI components
│   ├── admin/          # Category management components
│   ├── layout/         # Sidebar, Header, Modals
│   └── timesheet/      # Timesheet grid and logic
├── contexts/           # Global state (App, Theme, Toast)
├── pages/              # Main route views
│   ├── Dashboard.tsx
│   ├── Timesheet.tsx
│   ├── Categories.tsx
│   └── Help.tsx
├── utils/              # Helper functions
│   ├── storage.ts      # LocalStorage wrapper
│   └── timesheetHelpers.ts # Date/Excel logic
└── types.ts            # TypeScript definitions
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/jesadasinglor/timesync-pro.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📝 Usage Guide

1. **Setup Categories:** Navigate to the **Categories** page to define your work streams (e.g., "Deep Work", "Meetings", "Learning").
2. **Configure Routines:** Use the **Recurring Tasks** feature in the Timesheet page to set up your standard schedule.
3. **Log Time:** Use the **Timesheet** grid to enter your daily activities.
4. **Analyze:** Check the **Dashboard** to see where your time goes and improve your efficiency.

## 📄 License

This project is open-source and available under the MIT License.
