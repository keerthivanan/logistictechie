try:
    with open('final_audit.log', 'rb') as f:
        content = f.read().decode('utf-16')
    print(content)
except Exception as e:
    print(f"Error reading log: {e}")
