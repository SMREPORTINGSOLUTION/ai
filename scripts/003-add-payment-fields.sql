-- Add payment-related columns to participants table
DO $$ 
BEGIN
    -- Add payment method column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='participants' AND column_name='payment_method') THEN
        ALTER TABLE participants ADD COLUMN payment_method VARCHAR(50) DEFAULT 'free';
    END IF;
    
    -- Add entry fee column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='participants' AND column_name='entry_fee') THEN
        ALTER TABLE participants ADD COLUMN entry_fee DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add payment ID column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='participants' AND column_name='payment_id') THEN
        ALTER TABLE participants ADD COLUMN payment_id VARCHAR(100) NULL;
    END IF;
    
    -- Add payment status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='participants' AND column_name='payment_status') THEN
        ALTER TABLE participants ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    -- Add total revenue column to contests table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contests' AND column_name='total_revenue') THEN
        ALTER TABLE contests ADD COLUMN total_revenue DECIMAL(12,2) DEFAULT 0.00;
    END IF;
END $$;

-- Create index for payment queries
CREATE INDEX IF NOT EXISTS idx_participants_payment_status ON participants(payment_status);
CREATE INDEX IF NOT EXISTS idx_participants_payment_method ON participants(payment_method);

-- Update existing free entries
UPDATE participants SET 
    payment_method = 'free',
    entry_fee = 0.00,
    payment_status = 'completed'
WHERE payment_method IS NULL;
