import os

src = 'c:/Users/91709/OneDrive/Documents/logistics/frontend/src'

for root, dirs, filenames in os.walk(src):
    dirs[:] = [d for d in dirs if d != 'node_modules']
    for fname in filenames:
        if not (fname.endswith('.tsx') or fname.endswith('.ts')):
            continue
        fpath = os.path.join(root, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'API_URL' not in content:
            continue
        new = content
        new = new.replace('fetch(`${API_URL}', 'apiFetch(`')
        new = new.replace("import { API_URL } from '@/lib/config'", "import { apiFetch } from '@/lib/config'")
        new = new.replace('import { API_URL } from "@/lib/config"', 'import { apiFetch } from "@/lib/config"')
        new = new.replace('{ API_URL, ', '{ apiFetch, ')
        new = new.replace(', API_URL }', ', apiFetch }')
        if new != content:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new)
            print('Fixed:', fname)

print('Done.')
