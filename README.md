<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=CodeSach&fontSize=70&animation=fadeIn&fontAlignY=38&desc=An%20Advanced%20Platform%20for%20Coding%20Enthusiasts" />

  <p align="center">
    A scalable, full-stack application leveraging microservice architectures, containerization, and modern DevOps pipelines.
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" />
    <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes" />
  </p>
</div>

---

## 🚀 Overview

**CodeSach** is an advanced platform designed to evaluate and run code submissions seamlessly. Built with scalability and security in mind, the platform integrates robust code execution engines, modern authentication flows, and a battle-tested CI/CD pipeline to ensure seamless delivery to the cloud.

---

## 📂 Folder Structure Breakdown

This repository follows a monorepo structure designed for maintainability and separation of concerns.

```text
CodeSach/
├── .github/workflows/    # 🤖 CI/CD Pipelines. Contains `ci.yml` which automates testing and deployment to EC2 on every push.
├── apps/
│   ├── backend/          # ⚙️ Node.js/Express API. Handles authentication, database modeling, business logic, and communicates with Judge0.
│   │   ├── src/          # Source code including controllers, models, routes, and services.
│   │   ├── package.json  # Backend dependencies (e.g., Express, Mongoose, Passport).
│   │   └── Dockerfile    # Instructions to build the backend container image.
│   └── frontend/         # 💻 React.js Application. The user interface built with Vite, Tailwind CSS, and Zustand.
│       ├── src/          # React components, pages, state management, and API clients.
│       ├── package.json  # Frontend dependencies (e.g., React, Monaco Editor, Framer Motion).
│       └── Dockerfile    # Instructions to build the frontend container and serve it via Nginx.
├── docker/               # 🐳 Miscellaneous Docker configurations and helper scripts.
├── k8s/                  # ☸️ Kubernetes manifests (Deployments, Services, PVCs) for advanced scaling.
├── docker-compose.yml    # 📦 Local development environment using Docker Compose.
├── docker-compose.prod.yml # 🚀 Production environment configuration using pre-built images.
├── Caddyfile             # 🔒 Reverse proxy configuration for automatic HTTPS via Let's Encrypt.
└── mykey.pem             # 🔑 (Local only) SSH key for accessing the AWS EC2 instance.
```

---

## ⚙️ Core Integrations & Features

### 1. Judge0 (Remote Code Execution)

**What it is:** Judge0 is a robust, open-source online code execution system.
**How it works in CodeSach:**
When a user submits code through the frontend, the backend forwards the source code, language ID, and input/expected output data to a Judge0 instance. Judge0 securely compiles and executes the code in isolated, sandboxed environments (containers) preventing malicious code from affecting the host server. The execution results (success, failure, runtime errors, memory usage) are then streamed back to the user in real-time.

### 2. Google OAuth 2.0

**What it is:** The industry-standard protocol for authorization, allowing users to log in with their Google accounts securely.
**How it works in CodeSach:**
Instead of managing sensitive user passwords, CodeSach uses `passport-google-oauth20`. When a user clicks "Login with Google", they are redirected to Google's consent screen. Upon approval, Google sends an authorization code back to our backend. The backend exchanges this code for an access token, retrieves the user's profile, and issues a secure **JSON Web Token (JWT)** to the frontend. This JWT is then used to authenticate all subsequent API requests.

---

## 🛠 DevOps Tools & Architecture

CodeSach leverages a modern DevOps stack to automate testing, building, and deployment, ensuring high availability and developer productivity.

### Docker & Containerization

**Why Docker?**
Traditionally, software behaves differently depending on the operating system or environment it runs in. Docker solves the classic "it works on my machine" problem by packaging the application and all its dependencies into standardized units called **Containers**.

**What it does:**

- **Isolation:** The frontend, backend, and database run in their own isolated containers without interfering with the host OS.
- **Consistency:** The exact same image that is tested in the CI pipeline is deployed to production.
- **Portability:** You can deploy the app on any server (AWS, GCP, Azure) that has Docker installed, without worrying about installing Node.js or MongoDB on the server itself.

**How it works in CodeSach:**
Both the `frontend` and `backend` directories have their own `Dockerfile`. These files contain instructions on how to build the app environments. We use `docker-compose.yml` to orchestrate spinning up the entire stack locally with a single command (`docker compose up`). In production, `docker-compose.prod.yml` pulls the pre-built images from Docker Hub and wires them together with a Caddy reverse proxy for HTTPS.

### GitHub Actions (CI/CD)

- **Purpose**: Automates the pipeline from code commit to production deployment.
- **How it works**: Every push to the `main` branch triggers the workflow located in `.github/workflows/ci.yml`. It runs code linters, builds the applications, packages them into Docker images, pushes those images to Docker Hub, and finally SSHes into the EC2 instance to trigger a zero-downtime deployment.

### AWS EC2

- **Purpose**: The cloud server hosting the production application.
- **How it works**: We use an Ubuntu-based EC2 instance (`15.252.88.13`). It runs the Docker Daemon and uses `docker-compose.prod.yml` to pull our pre-built images from Docker Hub. Traffic is routed to this instance using a DuckDNS domain.

### Kubernetes (k8s)

**Why Kubernetes?**
While Docker is great for running containers, it doesn't automatically handle what happens if a container crashes, or if thousands of users suddenly flood the site and you need 10 backend containers instead of 1. Kubernetes is a container orchestration platform that solves this.

**What it does:**

- **Auto-Scaling:** Automatically spins up new backend containers when CPU usage spikes.
- **Self-Healing:** Restarts containers that fail or become unresponsive.
- **Load Balancing:** Distributes incoming traffic evenly across all available containers.

**How it works in CodeSach:**
While the app is currently deployed via a single EC2 instance using Docker Compose for simplicity, the `k8s/` directory contains production-ready Kubernetes manifests.

- **Deployments:** Define how many replicas of the frontend and backend should run.
- **Services:** Provide stable internal IP addresses to route traffic between the microservices.
- **PersistentVolumeClaims (PVCs):** Ensure MongoDB data is saved to a persistent disk, so data isn't lost if the database pod restarts.
  If CodeSach outgrows a single EC2 instance, these manifests allow for a seamless migration to a managed cluster like Amazon EKS.

---

## 🚢 Deployment Guide

If you are setting up this repository from scratch or migrating to a new server, follow these steps to enable the automated CI/CD pipeline.

### 1. GitHub Secrets Configuration

Navigate to your repository on GitHub -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**. Add the following:

- `DOCKER_USERNAME`: Your Docker Hub username.
- `DOCKER_PASSWORD`: Your Docker Hub Access Token.
- `EC2_HOST`: The public IP of your server (e.g., `15.252.88.13`).
- `EC2_USERNAME`: Usually `ubuntu` or `ec2-user`.
- `EC2_SSH_KEY`: The **entire contents** of your PEM key file (including `-----BEGIN RSA...`). _Never commit your `.pem` file!_

### 2. EC2 Instance Setup

Before the first automated deployment runs, SSH into your server:

```bash
chmod 400 mykey.pem
ssh -i mykey.pem ubuntu@15.252.88.13
```

Install Docker and Docker Compose:

```bash
sudo apt-get update -y
sudo apt-get install docker.io -y
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker ubuntu
sudo apt-get install docker-compose-plugin -y
```

Set up your environment variables:

```bash
mkdir -p ~/codesach
cd ~/codesach
nano .env
```

Add your production secrets (e.g., `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`).

### 3. DuckDNS Setup

1. Go to [DuckDNS](https://www.duckdns.org/) and create a subdomain.
2. Point it to your EC2 instance's IP address.
3. Ensure **Port 80** and **Port 443** (HTTPS) are open in your AWS Security Group.
4. Ensure **Port 22** (SSH) remains open so GitHub Actions can deploy the code.

Once this is done, pushing code to the `main` branch will automatically build and deploy your updates!
