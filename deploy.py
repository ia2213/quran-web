#!/usr/bin/env python3
"""Déploiement du Quran web app sur GitHub via API."""
import requests, base64, os, re, sys

# Get token
creds_path = os.path.expanduser("~/.git-credentials")
token = None
with open(creds_path) as f:
    for line in f:
        if "ia2213" in line and "github.com" in line:
            m = re.search(r'https://([^:@]+):([^:@]+)@github\.com', line)
            if m: token = m.group(2)

if not token:
    print("❌ Pas de token GitHub")
    sys.exit(1)

headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
base = "https://api.github.com/repos/ia2213/quran-web/git"

# Files to deploy
files = {
    "index.html": "C:/Users/Marc Hopf/quran-web/index.html",
    "style.css": "C:/Users/Marc Hopf/quran-web/style.css",
    "app.js": "C:/Users/Marc Hopf/quran-web/app.js",
    "vercel.json": "C:/Users/Marc Hopf/quran-web/vercel.json",
}

# Read and create blobs
print("1. Création des blobs...")
blobs = {}
for name, path in files.items():
    with open(path, "rb") as f:
        content = f.read()
    r = requests.post(f"{base}/blobs", headers=headers,
                      json={"content": base64.b64encode(content).decode(), "encoding": "base64"})
    if r.status_code == 201:
        sha = r.json()["sha"]
        blobs[name] = sha
        print(f"  ✓ {name}: {sha[:8]}")
    else:
        print(f"  ✗ {name}: {r.status_code}")
        sys.exit(1)

# Create tree
print("\n2. Création du tree...")
tree_items = [{"path": name, "mode": "100644", "type": "blob", "sha": sha} 
              for name, sha in blobs.items()]
r = requests.post(f"{base}/trees", headers=headers, json={"tree": tree_items})
if r.status_code == 201:
    tree_sha = r.json()["sha"]
    print(f"  ✓ Tree: {tree_sha[:8]}")
else:
    print(f"  ✗ Tree: {r.status_code} {r.text[:100]}")
    sys.exit(1)

# Check if main exists
print("\n3. Vérification main...")
ref_r = requests.get(f"https://api.github.com/repos/ia2213/quran-web/git/refs/heads/main", headers=headers)
if ref_r.status_code == 404:
    print("   Premier commit...")
    r = requests.post(f"https://api.github.com/repos/ia2213/quran-web/git/commits",
                      headers=headers,
                      json={"message": "Initial commit — Quran web app",
                            "tree": tree_sha, "parents": []})
    if r.status_code == 201:
        commit_sha = r.json()["sha"]
        print(f"  ✓ Commit: {commit_sha[:8]}")
    else:
        print(f"  ✗ Commit: {r.status_code}")
        sys.exit(1)
    
    r = requests.post(f"https://api.github.com/repos/ia2213/quran-web/git/refs",
                      headers=headers,
                      json={"ref": "refs/heads/main", "sha": commit_sha})
    if r.status_code in (200, 201):
        print(f"\n✅ https://github.com/ia2213/quran-web — déployé!")
    else:
        print(f"  ✗ Ref: {r.status_code}")
else:
    parent_sha = ref_r.json()["object"]["sha"]
    print(f"   Mise à jour (main: {parent_sha[:8]})...")
    
    # Get existing tree
    tree_r = requests.get(f"{base}/trees/{parent_sha}?recursive=1", headers=headers)
    existing = {item["path"]: item["sha"] for item in tree_r.json().get("tree", [])}
    
    # New tree
    all_items = []
    for name, sha in blobs.items():
        all_items.append({"path": name, "mode": "100644", "type": "blob", "sha": sha})
    for path, sha in existing.items():
        if path not in blobs:
            all_items.append({"path": path, "mode": "100644", "type": "blob", "sha": sha})
    
    r = requests.post(f"{base}/trees", headers=headers, json={"tree": all_items, "base_tree": parent_sha})
    if r.status_code == 200:
        tree_sha = r.json()["sha"]
        print(f"  ✓ Tree: {tree_sha[:8]}")
    else:
        print(f"  ✗ Tree: {r.status_code}")
        sys.exit(1)
    
    r = requests.post(f"https://api.github.com/repos/ia2213/quran-web/git/commits",
                      headers=headers,
                      json={"message": "Deploy: Quran web app",
                            "tree": tree_sha, "parents": [parent_sha]})
    if r.status_code == 201:
        commit_sha = r.json()["sha"]
        print(f"  ✓ Commit: {commit_sha[:8]}")
    else:
        print(f"  ✗ Commit: {r.status_code}")
        sys.exit(1)
    
    r = requests.patch(f"https://api.github.com/repos/ia2213/quran-web/git/refs/heads/main",
                      headers=headers, json={"sha": commit_sha})
    if r.status_code == 200:
        print(f"\n✅ https://github.com/ia2213/quran-web — mis à jour!")
    else:
        print(f"  ✗ Ref: {r.status_code}")
