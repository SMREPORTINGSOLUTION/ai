-- Safe migration that checks if columns exist before adding them
-- This prevents errors if the script is run multiple times

-- Function to check if column exists
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
END;
$$ LANGUAGE plpgsql;

-- Add contest_session to participants if it doesn't exist
DO $$ 
BEGIN
    IF NOT column_exists('participants', 'contest_session') THEN
        ALTER TABLE participants ADD COLUMN contest_session INTEGER DEFAULT 1;
        CREATE INDEX IF NOT EXISTS idx_participants_date_session ON participants(entry_date, contest_session);
        RAISE NOTICE 'Added contest_session column to participants table';
    ELSE
        RAISE NOTICE 'contest_session column already exists in participants table';
    END IF;
END $$;

-- Add contest_session to winners if it doesn't exist
DO $$ 
BEGIN
    IF NOT column_exists('winners', 'contest_session') THEN
        ALTER TABLE winners ADD COLUMN contest_session INTEGER DEFAULT 1;
        CREATE INDEX IF NOT EXISTS idx_winners_date_session ON winners(contest_date, contest_session);
        RAISE NOTICE 'Added contest_session column to winners table';
    ELSE
        RAISE NOTICE 'contest_session column already exists in winners table';
    END IF;
END $$;

-- Add session columns to contests if they don't exist
DO $$ 
BEGIN
    IF NOT column_exists('contests', 'contest_session') THEN
        -- Drop the old unique constraint on contest_date only
        ALTER TABLE contests DROP CONSTRAINT IF EXISTS contests_contest_date_key;
        
        -- Add new columns
        ALTER TABLE contests ADD COLUMN contest_session INTEGER DEFAULT 1;
        ALTER TABLE contests ADD COLUMN session_time VARCHAR(20) DEFAULT '08:00';
        ALTER TABLE contests ADD COLUMN prizes_available INTEGER DEFAULT 1;
        ALTER TABLE contests ADD COLUMN min_participants INTEGER DEFAULT 10000;
        
        -- Create new unique constraint on both date and session
        CREATE UNIQUE INDEX IF NOT EXISTS idx_contests_date_session ON contests(contest_date, contest_session);
        
        RAISE NOTICE 'Added session columns to contests table';
    ELSE
        RAISE NOTICE 'Session columns already exist in contests table';
    END IF;
END $$;

-- Clean up the helper function
DROP FUNCTION IF EXISTS column_exists(text, text);

-- Update existing data to have default session values
UPDATE participants SET contest_session = 1 WHERE contest_session IS NULL;
UPDATE winners SET contest_session = 1 WHERE contest_session IS NULL;
UPDATE contests SET contest_session = 1 WHERE contest_session IS NULL;

RAISE NOTICE 'Session migration completed successfully';
