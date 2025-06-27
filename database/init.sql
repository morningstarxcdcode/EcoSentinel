-- EcoSentinel Database Initialization Script

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create environmental_data table
CREATE TABLE IF NOT EXISTS environmental_data (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    air_quality INTEGER,
    temperature DECIMAL(5, 2),
    humidity INTEGER,
    wind_speed DECIMAL(5, 2),
    pressure DECIMAL(7, 2),
    co2_level INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(100)
);

-- Create ai_predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    prediction_type VARCHAR(100) NOT NULL,
    prediction_value JSONB NOT NULL,
    confidence DECIMAL(5, 4),
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_actions table
CREATE TABLE IF NOT EXISTS user_actions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    action_data JSONB,
    impact_score DECIMAL(8, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create community_groups table
CREATE TABLE IF NOT EXISTS community_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    member_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_environmental_data_location ON environmental_data(location);
CREATE INDEX IF NOT EXISTS idx_environmental_data_timestamp ON environmental_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_location ON ai_predictions(location);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);

-- Insert sample data
INSERT INTO environmental_data (location, latitude, longitude, air_quality, temperature, humidity, wind_speed, pressure, co2_level, source) VALUES
('San Francisco, CA', 37.7749, -122.4194, 75, 22.5, 65, 12.3, 1013.25, 415, 'openweather'),
('New York, NY', 40.7128, -74.0060, 85, 18.2, 70, 8.5, 1015.30, 420, 'openweather'),
('London, UK', 51.5074, -0.1278, 65, 15.8, 80, 15.2, 1012.50, 405, 'openweather'),
('Tokyo, Japan', 35.6762, 139.6503, 95, 25.1, 75, 6.8, 1016.80, 425, 'openweather'),
('Sydney, Australia', -33.8688, 151.2093, 55, 24.3, 60, 18.7, 1018.20, 400, 'openweather');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
