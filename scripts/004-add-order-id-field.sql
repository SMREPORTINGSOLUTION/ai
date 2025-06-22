-- Add order_id column to participants table
DO $$ 
BEGIN
    -- Add order ID column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='participants' AND column_name='order_id') THEN
        ALTER TABLE participants ADD COLUMN order_id VARCHAR(100) NULL;
    END IF;
END $$;

-- Create index for order queries
CREATE INDEX IF NOT EXISTS idx_participants_order_id ON participants(order_id);
