-- Update contests table for multiple daily contests
ALTER TABLE contests DROP CONSTRAINT IF EXISTS contests_contest_date_key;

-- Add contest session and time slot
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contests' AND column_name='contest_session') THEN
        ALTER TABLE contests ADD COLUMN contest_session INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contests' AND column_name='session_time') THEN
        ALTER TABLE contests ADD COLUMN session_time VARCHAR(20) DEFAULT '08:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contests' AND column_name='prizes_available') THEN
        ALTER TABLE contests ADD COLUMN prizes_available INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contests' AND column_name='min_participants') THEN
        ALTER TABLE contests ADD COLUMN min_participants INTEGER DEFAULT 10000;
    END IF;
END $$;

-- Add session info to participants
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='participants' AND column_name='contest_session') THEN
        ALTER TABLE participants ADD COLUMN contest_session INTEGER DEFAULT 1;
    END IF;
END $$;

-- Update winners table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='winners' AND column_name='contest_session') THEN
        ALTER TABLE winners ADD COLUMN contest_session INTEGER DEFAULT 1;
    END IF;
END $$;

-- Create unique constraint for contest date and session
CREATE UNIQUE INDEX IF NOT EXISTS idx_contests_date_session ON contests(contest_date, contest_session);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_participants_date_session ON participants(entry_date, contest_session);
CREATE INDEX IF NOT EXISTS idx_winners_date_session ON winners(contest_date, contest_session);
