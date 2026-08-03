# CodeSach

CodeSach is a modern, high-performance Data Structures & Algorithms (DSA) learning and practice platform. It combines a seamless IDE experience with native code execution, a curated DSA tracking sheet, and a global leaderboard to help developers master algorithms.

## Features

- **Multi-Language Support**: Write solutions in C++, Java, Python, and JavaScript natively.
- **Fast Execution Engine**: Integrated Judge0 wrapper local execution pipeline ensuring real test cases and instant feedback without complex Docker compilation overhead in development.
- **Progress Tracking**: Personal DSA sheet to check off problems and a contribution graph on your profile.
- **Modern Tech Stack**:
  - **Frontend**: React, Vite, Tailwind CSS, Monaco Editor, Zustand
  - **Backend**: Node.js, Express, MongoDB (Mongoose), JWT & Passport (Google OAuth)
- **Containerized**: Production-ready with fully optimized Docker images and multi-container orchestration.

## Getting Started

### Prerequisites

- Docker & Docker Compose
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials (for login)

### Local Development via Docker

CodeSach is completely containerized. To spin up the frontend, backend, and a local MongoDB instance, simply run:

```bash
docker-compose up -d --build
```

- The **Frontend** will be available at `http://localhost:80`
- The **Backend API** will be available at `http://localhost:5000`

### Environment Variables

If you are running the backend directly via `npm`, ensure the following environment variables are set in a `.env` file in `apps/backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codesach
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

### Running Natively (Without Docker)

1. Open a terminal in the root directory and install dependencies:
   ```bash
   npm install --prefix apps/backend
   npm install --prefix apps/frontend
   ```
2. Start the Backend:
   ```bash
   cd apps/backend && npm run dev
   ```
3. Start the Frontend:
   ```bash
   cd apps/frontend && npm run dev
   ```

## Kubernetes Deployment

The project includes full Kubernetes (K8s) configuration files located in the `k8s/` directory.

### Deploy to K8s

1. Start your Kubernetes cluster (e.g., using `minikube start`).
2. Build your local Docker images (or push them to a registry):
   ```bash
   docker build -t codesach-backend:latest -f apps/backend/Dockerfile .
   docker build -t codesach-frontend:latest -f apps/frontend/Dockerfile .
   ```
3. Apply all configurations to your cluster:
   ```bash
   kubectl apply -f k8s/
   ```
4. Access the application:
   - For Minikube users: Run `minikube service frontend` to open the app.
   - For others: The frontend service is exposed on NodePort `30080`.

## Deployment

The repository includes a GitHub Actions CI pipeline (`.github/workflows/ci.yml`) that lints and verifies builds on every push to the `main` branch.

To deploy to production, you can clone the repository to your VPS and run `docker-compose up -d --build`, or use the Kubernetes configurations provided in `k8s/` for orchestrated deployment.
