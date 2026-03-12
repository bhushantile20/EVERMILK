# EVER MILK — Full Deployment Guide 🥛
Django + React deployed on Azure VM with Nginx, Gunicorn, PM2, DuckDNS & GitHub Actions

## Table of Contents
1. Project Overview
2. Create Azure VM
3. SSH into the VM
4. Clone the Project
5. Set Up Python Virtual Environment
6. Install Node.js and PM2
7. Run Database Migrations
8. Set Up Gunicorn with PM2
9. Build React Frontend
10. Configure Nginx
11. Set Up Free Domains with DuckDNS
12. Set Up SSL Certificates
13. Update Nginx for HTTPS + Separate Domains
14. Set Up Frontend Environment Variables
15. Set Up GitHub Actions CI/CD
16. Common Issues & Fixes
17. Useful Commands

---

## 1. Project Overview

| Component | Tool |
| :--- | :--- |
| Cloud Provider | Microsoft Azure (Student Plan) |
| VM Size | Standard B2ats v2 — 2 vCPUs, 1 GiB RAM |
| OS | Ubuntu 24.04 LTS |
| Backend | Django + Gunicorn |
| Frontend | React + Vite |
| Web Server | Nginx |
| Process Manager | PM2 |
| Frontend Domain | `https://evermilk.duckdns.org` (or your domain) |
| Backend Domain | `https://api.conbot.duckdns.org` (or your api domain)|
| CI/CD | GitHub Actions |

### Architecture

```
User Browser
     │
     ▼
Port 443 (HTTPS) → Nginx
     │
     ├── https://evermilk.duckdns.org/         → React (frontend dist/)
     │
     └── https://api.conbot.duckdns.org/api/   → Django via Unix socket
     └── https://api.conbot.duckdns.org/media/ → Django media files
```

---

## 2. Create Azure VM
1. Go to `portal.azure.com`
2. Create a new Virtual Machine
3. Recommended settings:

| Setting | Value |
| :--- | :--- |
| Size | Standard B2ats v2 (2 vCPUs, 1 GiB RAM) |
| OS | Ubuntu 24.04 LTS |
| Authentication | SSH public key |
| Inbound ports | SSH (22), HTTP (80), HTTPS (443) |

> Download the `.pem` key file — keep it safe! Note your VM's Public IP address.

---

## 3. SSH into the VM

**Fix SSH Key Permissions on Windows**
Run in PowerShell as Administrator:
```powershell
icacls "C:\path\to\your.pem" /inheritance:r
icacls "C:\path\to\your.pem" /remove "NT AUTHORITY\Authenticated Users"
icacls "C:\path\to\your.pem" /remove "BUILTIN\Users"
icacls "C:\path\to\your.pem" /grant:r "YourWindowsUsername:(R)"
```
*(Find your Windows username with `whoami` in CMD.)*

**Connect to VM**
```bash
ssh -i "C:\path\to\your.pem" azureuser@YOUR_VM_PUBLIC_IP
```

---

## 4. Clone the Project
```bash
cd ~
git clone https://github.com/your-username/milkman_final.git
cd milkman_final
ls
# Should show: README.md  backend  frontend
```

### Project Structure
```text
~/milkman_final/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions workflow
├── backend/
│   ├── milkman/             # Django config (wsgi.py lives here)
│   ├── venv/                # Python virtual environment
│   ├── manage.py
│   ├── requirements.txt
│   ├── evermilk.sock        # Gunicorn Unix socket (auto-created)
│   └── runbackend.sh        # Script to start Gunicorn via PM2
└── frontend/
    ├── src/
    ├── dist/                # Built React app (served by Nginx)
    ├── .env                 # API URLs (NOT committed to GitHub)
    └── package.json
```

---

## 5. Set Up Python Virtual Environment
```bash
cd ~/milkman_final/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
deactivate
```

---

## 6. Install Node.js and PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

**Verify:**
```bash
node --version   # v20.x.x
pm2 --version    # 6.x.x
```

---

## 7. Run Database Migrations & Collect Static
```bash
cd ~/milkman_final/backend
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser  # optional: create admin user
deactivate
```

---

## 8. Set Up Gunicorn with PM2

**Create the startup script:**
```bash
nano ~/milkman_final/backend/runbackend.sh
```

**Paste:**
```bash
#!/bin/bash
cd /home/azureuser/milkman_final/backend
source venv/bin/activate
gunicorn --workers 3 --bind unix:/home/azureuser/milkman_final/backend/evermilk.sock milkman.wsgi:application
```

**Make it executable:**
```bash
chmod +x ~/milkman_final/backend/runbackend.sh
```

**Start with PM2:**
```bash
pm2 start ~/milkman_final/backend/runbackend.sh --name evermilk_backend
pm2 list
```

**Expected output:**
```text
┌────┬──────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name             │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼──────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ evermilk_backend │ fork     │ 0    │ online    │ 0%       │ 3.5mb    │
```

**Enable auto-start on VM reboot:**
```bash
pm2 save
pm2 startup
# Copy and run the command it outputs, e.g.:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u azureuser --hp /home/azureuser
```

---

## 9. Build React Frontend
```bash
cd ~/milkman_final/frontend
npm install
npm run build
```
*(This creates the `dist/` folder that Nginx will serve.)*

---

## 10. Configure Nginx

**Install Nginx:**
```bash
sudo apt update
sudo apt install nginx -y
```

**Create Frontend Config:**
```bash
sudo nano /etc/nginx/sites-available/evermilk
```

Paste (Replace with your actual domains):
```nginx
server {
    listen 80;
    server_name evermilk.duckdns.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name evermilk.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/evermilk.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/evermilk.duckdns.org/privkey.pem;

    # Serve React frontend
    location / {
        root /home/azureuser/milkman_final/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

**Create Backend Config:**
```bash
sudo nano /etc/nginx/sites-available/evermilkapi
```

Paste:
```nginx
server {
    listen 80;
    server_name api.conbot.duckdns.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.conbot.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/api.conbot.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.conbot.duckdns.org/privkey.pem;

    # Proxy all requests to Django
    location / {
        proxy_pass http://unix:/home/azureuser/milkman_final/backend/evermilk.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve Django media files
    location /media/ {
        alias /home/azureuser/milkman_final/backend/media/;
    }
    
    # Serve Django static files (Admin UI)
    location /static/ {
        alias /home/azureuser/milkman_final/backend/staticfiles/;
    }
}
```

**Enable configs and restart Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/evermilk /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/evermilkapi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 11. Set Up Free Domains with DuckDNS
1. Go to `duckdns.org` and log in.
2. Create two subdomains (or use actual purchased domains):
   * `evermilk` → your VM's public IP (frontend)
   * `api-conbot` → same VM public IP (backend)
3. Click Update IP for both.

---

## 12. Set Up SSL Certificates

**Install Certbot:**
```bash
sudo apt install certbot -y
```

**Generate certificates** (stop Nginx first):
```bash
sudo systemctl stop nginx

# Frontend SSL
sudo certbot certonly --standalone -d evermilk.duckdns.org

# Backend SSL
sudo certbot certonly --standalone -d api.conbot.duckdns.org

sudo systemctl start nginx
```

---

## 13. Update Nginx for HTTPS + Separate Domains
After SSL is set up, test and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 14. Set Up Frontend Environment Variables
To link the React frontend to your new Azure Backend API:

```bash
nano ~/milkman_final/frontend/.env
```

Add:
```env
VITE_API_BASE_URL=https://api.conbot.duckdns.org
```

Rebuild frontend:
```bash
cd ~/milkman_final/frontend
npm run build
sudo systemctl restart nginx
```

---

## 15. Set Up GitHub Actions CI/CD
Every push to `main` automatically deploys to the VM.

**Step 1: Generate SSH deploy key on VM**
```bash
cd ~
ssh-keygen -t ed25519 -C "your_email@example.com" -f ./id_rsa_deploy -N ""
cat ./id_rsa_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Step 2: Add GitHub Secrets**
Go to: GitHub Repo → Settings → Secrets and variables → Actions → New repository secret

| Secret Name | Value |
| :--- | :--- |
| `SERVER_IP` | api.conbot.duckdns.org |
| `SERVER_USER` | azureuser |
| `SSH_PRIVATE_KEY` | Contents of `~/id_rsa_deploy` (entire file) |
| `SERVER_PATH` | `/home/azureuser/milkman_final` |

**Step 3: Add GitHub SSH key to VM**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com" -N "" -f ~/.ssh/github
cat ~/.ssh/github.pub
```
Add the public key to: GitHub → Settings → SSH and GPG keys

Configure SSH:
```bash
echo -e "Host github.com\n  IdentityFile ~/.ssh/github" >> ~/.ssh/config
git remote set-url origin git@github.com:your-username/milkman_final.git
```

**Step 5: Create the workflow file**
```bash
mkdir -p ~/milkman_final/.github/workflows
nano ~/milkman_final/.github/workflows/deploy.yml
```

Paste:
```yaml
name: Deploy to Server
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Copy files via SSH
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: 22
          source: "."
          target: ${{ secrets.SERVER_PATH }}
          rm: false

      - name: Execute remote commands
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: 22
          script: |
            cd /home/azureuser/milkman_final/frontend
            echo "VITE_API_BASE_URL=https://api.conbot.duckdns.org" > .env
            npm install
            npm run build
            cd /home/azureuser/milkman_final/backend
            source venv/bin/activate
            pip install -r requirements.txt
            python manage.py collectstatic --noinput
            python manage.py migrate
            pm2 restart evermilk_backend
            sudo systemctl restart nginx
            echo "Deployment finished!"
```

**Step 6: Push to trigger first deployment**
```bash
cd ~/milkman_final
git add .
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

---

## 16. Common Issues & Fixes

**502 Bad Gateway**
```bash
pm2 list
# If evermilk_backend is not running:
cd ~/milkman_final/backend
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
pm2 restart evermilk_backend
```

**API calls going to localhost**
```bash
cd ~/milkman_final/frontend
echo "VITE_API_BASE_URL=https://api.conbot.duckdns.org" > .env
npm run build
sudo systemctl restart nginx
```

---

## 17. Useful Commands
```bash
# Restart Django
pm2 restart evermilk_backend

# View Django logs
pm2 logs evermilk_backend

# Restart Nginx
sudo systemctl restart nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```
