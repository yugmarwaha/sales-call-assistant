# Sales Call Assistant - Frontend

The frontend application for the Sales Call Assistant, an AI-powered tool that transcribes sales calls and generates personalized follow-up emails.

## Overview

This React-based web application provides an intuitive interface for:

- Uploading video/audio files of sales calls
- Viewing AI-generated transcriptions
- Generating and customizing follow-up emails based on call content

## Technology Stack

- **React** 19.2.0 - UI framework
- **Vite** 7.2.4 - Build tool and dev server
- **Axios** - HTTP client for API communication
- **Lucide React** - Icon library
- **ESLint** - Code quality and linting

## Prerequisites

Before running the frontend, ensure you have:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Backend API** running on `http://localhost:8000` (see [backend README](../backend/README.md))

## Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

Start the development server with hot module replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Other Commands

- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint`

## Configuration

The frontend is configured to connect to the backend API at `http://localhost:8000`. If your backend runs on a different port, you'll need to update the API base URL in the application code.

### CORS Configuration

The backend is configured to accept requests from `http://localhost:5173`. If you change the frontend port, update the CORS settings in the backend accordingly.

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── App.jsx      # Main application component
│   ├── App.css      # Application styles
│   ├── main.jsx     # Application entry point
│   ├── index.css    # Global styles
│   └── assets/      # Images, icons, and other assets
├── index.html       # HTML template
├── package.json     # Dependencies and scripts
└── vite.config.js   # Vite configuration
```

## Features

- **File Upload**: Support for multiple video formats (MP4, MOV, AVI, WebM, MKV)
- **Real-time Processing**: Upload and process sales call recordings
- **Transcription View**: Display AI-generated transcriptions
- **Email Generation**: AI-powered follow-up email creation
- **Responsive Design**: Works across desktop and mobile devices

## Development

This project uses:

- **ESLint** for code quality enforcement
- **Vite** for fast development and optimized builds
- **React Fast Refresh** for instant feedback during development

## Troubleshooting

**Backend Connection Issues**:

- Ensure the backend is running on port 8000
- Check CORS configuration in the backend
- Verify network connectivity

**Port Already in Use**:

- Kill the process using port 5173 or configure Vite to use a different port in `vite.config.js`

## Related Documentation

- [Main Project README](../README.md) - Overall project documentation
- [Backend README](../backend/README.md) - Backend API documentation

## License

See the [LICENSE](../LICENSE) file in the root directory.
