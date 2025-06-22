-- Verify existing tables structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('participants', 'contests', 'winners')
ORDER BY table_name, ordinal_position;

-- Check if we have any existing data
SELECT 'participants' as table_name, COUNT(*) as record_count FROM participants
UNION ALL
SELECT 'contests' as table_name, COUNT(*) as record_count FROM contests
UNION ALL
SELECT 'winners' as table_name, COUNT(*) as record_count FROM winners;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_participants_date ON participants(entry_date);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_entry_time ON participants(entry_time);
CREATE INDEX IF NOT EXISTS idx_winners_date ON winners(contest_date);
CREATE INDEX IF NOT EXISTS idx_contests_date ON contests(contest_date);

-- Add any missing columns if needed
DO $$ 
BEGIN
    -- Add columns that might be missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='participants' AND column_name='is_winner') THEN
        ALTER TABLE participants ADD COLUMN is_winner BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='participants' AND column_name='prize_position') THEN
        ALTER TABLE participants ADD COLUMN prize_position INTEGER NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='winners' AND column_name='notified') THEN
        ALTER TABLE winners ADD COLUMN notified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
