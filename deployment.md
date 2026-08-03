# Deployment Guide

This guide explains how to set up the environment required for the automated CI/CD pipeline to successfully build, test, and deploy your application to your AWS EC2 instance.

## 1. GitHub Secrets Configuration

For the GitHub Actions workflow to log into Docker Hub and SSH into your EC2 instance, you need to add the following secrets to your GitHub repository.

Go to your repository on GitHub -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Add the following secrets:

- `DOCKER_USERNAME`: Your Docker Hub username.
- `DOCKER_PASSWORD`: Your Docker Hub Access Token or Password. (Creating an access token in Docker Hub is recommended over using your password).
- `EC2_HOST`: The public IP address of your EC2 instance. (e.g., `15.252.88.13`)
- `EC2_USERNAME`: The username for your EC2 instance. For Ubuntu, it is typically `ubuntu`. For Amazon Linux, it is `ec2-user`.
- `EC2_SSH_KEY`: The entire contents of your PEM key file (e.g., the contents of `CodeSach.pem`). Open the PEM file in a text editor, copy all of the text (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`), and paste it here.

**Important:** Do NOT commit your `CodeSach.pem` file to the repository. It is a security risk. Keep it local, and provide its contents only via GitHub Secrets.

## 2. EC2 Instance Setup

Before the very first deployment runs, you need to install Docker and Docker Compose on your EC2 instance, and set up your `.env` file.

1. **SSH into your instance manually (from your local machine):**

   ```bash
   chmod 400 CodeSach.pem
   ssh -i CodeSach.pem ubuntu@15.252.88.13
   ```

   _(Replace `ubuntu` with your EC2 username if different)._

2. **Install Docker and Docker Compose:**
   Run the following commands on the EC2 instance:

   ```bash
   # Update packages
   sudo apt-get update -y

   # Install Docker
   sudo apt-get install docker.io -y

   # Start Docker and enable it to run on boot
   sudo systemctl start docker
   sudo systemctl enable docker

   # Add your user to the docker group so you don't need to use sudo for docker commands
   sudo usermod -aG docker $USER
   ```

   _Note: After running the `usermod` command, you might need to log out and log back into your EC2 instance for the changes to take effect._

   ```bash
   # Install Docker Compose (V2 plugin)
   sudo apt-get install docker-compose-plugin -y
   # Or depending on your OS, you might need docker-compose (V1):
   # sudo apt-get install docker-compose -y
   ```

3. **Set up the `.env` file:**
   The GitHub Action will create a `codesach` directory on your EC2 instance and run `docker-compose up` there. The `docker-compose.yml` expects an `.env` file for your backend secrets.
   ```bash
   mkdir -p ~/codesach
   cd ~/codesach
   nano .env
   ```
   Add your required environment variables into this file. For example:
   ```env
   MONGODB_URI=mongodb://mongodb:27017/codesach
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key
   # Add your Google OAuth credentials here too
   ```
   Press `Ctrl+X`, then `Y`, then `Enter` to save and exit.

## 3. DuckDNS Configuration

To map a friendly domain name to your public IP (`15.252.88.13`):

1. Go to [DuckDNS](https://www.duckdns.org/).
2. Log in (e.g., using Google or GitHub).
3. Under **domains**, type a subdomain you want (e.g., `codesach`) and click **add domain**.
4. In the DuckDNS dashboard, for the domain you just created, enter your EC2's Public IP (`15.252.88.13`) into the **current ip** field and click **update ip**.
5. Wait a few minutes for DNS propagation.

Now you can access your frontend by going to `http://<your-subdomain>.duckdns.org` in your browser. Note: Port 80 needs to be open in your EC2 Security Group inbound rules.

---

### Final Steps

Once you have added the GitHub Secrets and installed Docker on the EC2 instance, any push or merge to the `main` branch will automatically trigger the GitHub Action. It will build your app, push the Docker images to Docker Hub, and deploy them to your EC2 instance!
