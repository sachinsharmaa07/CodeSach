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
├── .github/workflows/    # 🤖 Contains the CI/CD pipeline (ci.yml) for GitHub Actions.
├── apps/
│   ├── backend/          # ⚙️ Node.js/Express API. Handles auth, database, and business logic.
│   └── frontend/         # 💻 React.js Application. The user interface.
├── docker/               # 🐳 Miscellaneous Docker configurations.
├── k8s/                  # ☸️ Kubernetes manifests (Deployments, Services, PVCs) for scaling.
├── docker-compose.yml    # 📦 Local development environment using Docker Compose.
├── docker-compose.prod.yml # 🚀 Production environment configuration using pre-built images.
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

- **Purpose**: Eliminates the "it works on my machine" problem.
- **How it works**: Both the `frontend` and `backend` have their own `Dockerfile`. We use `docker-compose.yml` to spin up the entire application stack (Frontend, Backend, and MongoDB) locally with a single command (`docker-compose up`).

### GitHub Actions (CI/CD)

- **Purpose**: Automates the pipeline from code commit to production deployment.
- **How it works**: Every push to the `main` branch triggers the workflow located in `.github/workflows/ci.yml`. It runs code linters, builds the applications, packages them into Docker images, pushes those images to Docker Hub, and finally SSHes into the EC2 instance to trigger a zero-downtime deployment.

### AWS EC2

- **Purpose**: The cloud server hosting the production application.
- **How it works**: We use an Ubuntu-based EC2 instance (`15.252.88.13`). It runs the Docker Daemon and uses `docker-compose.prod.yml` to pull our pre-built images from Docker Hub. Traffic is routed to this instance using a DuckDNS domain.

### Kubernetes (k8s)

- **Purpose**: Container orchestration for infinite scalability.
- **How it works**: While currently deployed via Docker Compose on EC2 for simplicity, the `k8s/` directory contains production-ready manifests (`Deployments`, `Services`, and `PersistentVolumeClaims`). These files describe the desired state of the application, allowing Kubernetes to automatically manage load balancing, auto-scaling, and self-healing across a cluster of nodes if you choose to migrate to a K8s cluster (like EKS).

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
3. Ensure **Port 80** is open in your AWS Security Group.

Once this is done, pushing code to the `main` branch will automatically build and deploy your updates!
