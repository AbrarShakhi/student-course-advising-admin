# Student Course Advising Admin Panel

This is the React-based admin panel for the [Student Course Advising System backend](https://github.com/AbrarShakhi/student-course-advising-system). It enables administrators to manage students, courses, faculty, sections, and more through a modern web interface.

## Related Projects

- **Backend API:** [Student Course Advising System (Flask)](https://github.com/AbrarShakhi/student-course-advising-system)
- **Mobile App:** [Student Course Advising Native (React Native)](https://github.com/Brick-C/student-course-advising-native)

## Features

- Manage students, courses, faculty, departments, sections, and schedules
- CRUD operations for all major entities
- Secure admin authentication
- Responsive UI for desktop and mobile
- Real-time feedback and notifications

## Showcase Videos

### Admin Panel Demo

[![Admin Panel](https://img.youtube.com/vi/5QeuAQ-lrA8/maxresdefault.jpg)](https://youtu.be/5QeuAQ-lrA8)

_Click the image above to watch the Admin Panel demo_

### Class Schedule Generation

[![Class Schedule Generation](https://img.youtube.com/vi/Srvguocoa8I/maxresdefault.jpg)](https://youtu.be/Srvguocoa8I)

### React Native Mobile App

[![React Native Mobile App](https://img.youtube.com/vi/B77Ff4M3OSE/maxresdefault.jpg)](https://youtu.be/B77Ff4M3OSE)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repo-url>
cd student-course-advising-admin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Endpoint

Edit misc/api.js if your backend is not running at http://localhost:5000.

### 4. Run the Development Server

```bash
npm run dev
```
The admin panel will be available at http://localhost:5173/ by default.

## Project Structure

- `src/` - React source code
- `pages/` - Page components (Admin, Login, Dashboard)
- `router/` - Routing and guards
- `styles/` - CSS styles
- `misc/api.js` - API base URL configuration
- `scheduler/` - Class schedule generation logic

## Troubleshooting

Ensure the backend API is running and accessible Check browser console for errors Update API URL in misc/api.js if needed

## License
Apache License 2.0
http://www.apache.org/licenses/ 
