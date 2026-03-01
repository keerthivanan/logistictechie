import psycopg2
import sys

try:
    conn = psycopg2.connect("dbname=logistics_db user=postgres password=2003 host=localhost")
    cur = conn.cursor()
    
    print("🔍 OMEGO DIRECT SCHEMA AUDIT")
    tables = ["requests", "quotations", "forwarder_bid_status"]
    
    for table in tables:
        print(f"\n--- TABLE: {table} ---")
        cur.execute(f"""
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = '{table}' AND character_maximum_length IS NOT NULL;
        """)
        for row in cur.fetchall():
            print(f" - {row[0]}: {row[1]} ({row[2]})")
            
    cur.close()
    conn.close()
except Exception as e:
    print(f"Audit Failed: {e}")
