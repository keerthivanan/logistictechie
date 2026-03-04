-- ============================================
-- OMEGO MVP DATABASE - ESSENTIAL COLUMNS ONLY
-- This is ALL you need for core functionality!
-- ============================================

-- Connect to your database
-- \c logistics_db

-- ============================================
-- STEP 1: Check what you already have
-- ============================================

-- Check requests table current columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'requests'
ORDER BY ordinal_position;

-- Check quotations table current columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotations'
ORDER BY ordinal_position;

-- ============================================
-- STEP 2: Add ONLY missing ESSENTIAL columns
-- ============================================

-- ESSENTIAL columns for requests table
-- (Add ONLY if they don't exist - check output from STEP 1)

-- These are probably ALREADY in your table:
-- request_id, user_sovereign_id, user_email, user_name,
-- origin, destination, cargo_type, weight_kg, incoterms,
-- status, quotation_count, submitted_at

-- Add these if missing:
ALTER TABLE requests 
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS closed_reason VARCHAR(100);

-- ESSENTIAL columns for quotations table
-- (Add ONLY if they don't exist)

-- These are probably ALREADY in your table:
-- quotation_id, request_id, forwarder_id, forwarder_company,
-- total_price, currency, transit_days, carrier, service_type,
-- ai_summary, status, received_at

-- Add forwarder_email if missing (needed for contact):
ALTER TABLE quotations 
  ADD COLUMN IF NOT EXISTS forwarder_email VARCHAR(255);

-- ============================================
-- STEP 3: Create forwarder_bid_status table
-- This is the ONLY NEW TABLE required!
-- ============================================

CREATE TABLE IF NOT EXISTS forwarder_bid_status (
    id SERIAL PRIMARY KEY,
    forwarder_id VARCHAR(50) NOT NULL,
    request_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    -- Status values:
    -- "ANSWERED" = Successfully submitted quote
    -- "DECLINED_LATE" = Tried to quote after 3 received
    -- "DUPLICATE" = Tried to quote twice
    -- "COMPLETED" = Request closed, quote was one of the 3
    -- "EXPIRED" = Request closed, didn't quote
    quoted_at TIMESTAMP,
    attempted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forwarder_id) REFERENCES forwarders(forwarder_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE,
    UNIQUE (forwarder_id, request_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fbs_forwarder ON forwarder_bid_status(forwarder_id);
CREATE INDEX IF NOT EXISTS idx_fbs_request ON forwarder_bid_status(request_id);
CREATE INDEX IF NOT EXISTS idx_fbs_status ON forwarder_bid_status(status);

-- ============================================
-- STEP 4: Verify essential columns exist
-- ============================================

-- Verify requests table has essentials:
SELECT 
    CASE 
        WHEN COUNT(*) >= 14 THEN '✅ requests table has essential columns'
        ELSE '❌ requests table missing columns'
    END as status
FROM information_schema.columns 
WHERE table_name = 'requests'
AND column_name IN (
    'request_id', 'user_sovereign_id', 'user_email', 'user_name',
    'origin', 'destination', 'cargo_type', 'weight_kg', 'incoterms',
    'status', 'quotation_count', 'submitted_at', 'closed_at', 'closed_reason'
);

-- Verify quotations table has essentials:
SELECT 
    CASE 
        WHEN COUNT(*) >= 13 THEN '✅ quotations table has essential columns'
        ELSE '❌ quotations table missing columns'
    END as status
FROM information_schema.columns 
WHERE table_name = 'quotations'
AND column_name IN (
    'quotation_id', 'request_id', 'forwarder_id', 'forwarder_company', 'forwarder_email',
    'total_price', 'currency', 'transit_days', 'carrier', 'service_type',
    'ai_summary', 'status', 'received_at'
);

-- Verify forwarder_bid_status table created:
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forwarder_bid_status')
        THEN '✅ forwarder_bid_status table created'
        ELSE '❌ forwarder_bid_status table not found'
    END as status;

-- ============================================
-- STEP 5: Insert test data (Optional)
-- ============================================

/*
-- Test request with ESSENTIAL fields only:
INSERT INTO requests (
    request_id, user_sovereign_id, user_email, user_name,
    origin, destination, cargo_type, weight_kg, incoterms,
    status, quotation_count, submitted_at
) VALUES (
    'OMEGO-9999-REQ-99', 'OMEGO-9999', 'test@test.com', 'Test User',
    'Shanghai', 'Los Angeles', 'FCL', 15000, 'FOB',
    'OPEN', 0, NOW()
);

-- Test quotation with ESSENTIAL fields only:
INSERT INTO quotations (
    quotation_id, request_id, forwarder_id, forwarder_company, forwarder_email,
    total_price, currency, transit_days, carrier, service_type,
    ai_summary, status, received_at
) VALUES (
    'OMEGO-9999-REQ-99-Q1', 'OMEGO-9999-REQ-99', 'REG-OMEGO-0001',
    'Test Forwarder', 'test@forwarder.com',
    2500, 'USD', 15, 'Maersk', 'FCL Direct',
    'Test Forwarder offers USD 2500 for 15 days transit', 'ACTIVE', NOW()
);

-- Test forwarder_bid_status:
INSERT INTO forwarder_bid_status (
    forwarder_id, request_id, status, quoted_at
) VALUES (
    'REG-OMEGO-0001', 'OMEGO-9999-REQ-99', 'ANSWERED', NOW()
);

-- Clean up test data:
DELETE FROM forwarder_bid_status WHERE request_id = 'OMEGO-9999-REQ-99';
DELETE FROM quotations WHERE request_id = 'OMEGO-9999-REQ-99';
DELETE FROM requests WHERE request_id = 'OMEGO-9999-REQ-99';
*/

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================

-- Summary:
-- ✅ Added 2 essential columns to requests (closed_at, closed_reason)
-- ✅ Added 1 essential column to quotations (forwarder_email)
-- ✅ Created forwarder_bid_status table (7 columns)
-- ✅ Added 3 indexes for performance
-- 
-- Total changes: 3 new columns + 1 new table + 3 indexes
-- 
-- Your platform is now ready for MVP launch! 🚀
