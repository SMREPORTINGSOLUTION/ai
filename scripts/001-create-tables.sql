-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    entry_date DATE DEFAULT CURRENT_DATE,
    entry_time TIMESTAMP DEFAULT NOW(),
    is_winner BOOLEAN DEFAULT FALSE,
    prize_position INTEGER NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create contests table
CREATE TABLE IF NOT EXISTS contests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contest_date DATE UNIQUE NOT NULL,
    total_participants INTEGER DEFAULT 0,
    winners_selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create winners table
CREATE TABLE IF NOT EXISTS winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES participants(id),
    contest_date DATE NOT NULL,
    prize_position INTEGER NOT NULL,
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_date ON participants(entry_date);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_winners_date ON winners(contest_date);
