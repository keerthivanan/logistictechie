"""
CARGOLINK — QUICK REDEPLOY SCRIPT
Run this whenever you change backend code:
  python redeploy.py
"""
import paramiko, os, time, warnings
warnings.filterwarnings('ignore')

VPS_IP = '147.93.107.99'
USERNAME = 'root'
PASSWORD = 'Keerthimaster1@'
LOCAL_BACKEND = r"c:\Users\91709\OneDrive\Documents\logistics\backend"

SKIP = {'venv', '__pycache__', '.git', '.pytest_cache', 'alembic'}
SKIP_EXT = {'.pyc', '.pyo'}

def sftp_upload_dir(sftp, local, remote):
    try: sftp.mkdir(remote)
    except: pass
    for item in os.listdir(local):
        if item in SKIP or item == '.env': continue
        lp, rp = os.path.join(local, item), remote + '/' + item
        if os.path.isdir(lp):
            sftp_upload_dir(sftp, lp, rp)
        elif os.path.splitext(item)[1] not in SKIP_EXT:
            try: sftp.put(lp, rp)
            except: pass

print("🚀 Deploying backend changes to VPS...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_IP, username=USERNAME, password=PASSWORD, timeout=10)

def run(cmd, t=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=t)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    return out

print("📤 Uploading changed files...")
sftp = ssh.open_sftp()
sftp_upload_dir(sftp, LOCAL_BACKEND, '/opt/cargolink/backend')
sftp.close()
print("✅ Files uploaded")

print("🔨 Rebuilding Docker container (this takes ~1-2 mins)...")
run("cd /opt/cargolink && docker compose up -d --build", t=300)

time.sleep(8)
logs = run("docker logs --tail 5 cargolink-backend 2>&1")
print(f"📋 Backend logs:\n{logs}")

health = run("docker exec cargolink-backend python -c \"import urllib.request; print(urllib.request.urlopen('http://localhost:8000/health').read().decode())\"")
print(f"\n🩺 Health: {health}")

ssh.close()
print("\n✅ Redeploy complete! https://api.cargolink.sa is updated.")
