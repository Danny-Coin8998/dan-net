-- Create transactions table for DAN Internet package purchases
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    email TEXT,
    phone_number TEXT NOT NULL,
    is_received BOOLEAN NOT NULL DEFAULT true,
    transaction_hash TEXT NOT NULL,
    dan_tokens_sent NUMERIC NOT NULL,
    thb_amount NUMERIC NOT NULL DEFAULT 200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_wallet_address ON transactions(wallet_address);
CREATE INDEX idx_transactions_phone_number ON transactions(phone_number);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_is_received ON transactions(is_received);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add some useful comments
COMMENT ON TABLE transactions IS 'Stores DAN Internet package purchase transactions';
COMMENT ON COLUMN transactions.wallet_address IS 'User wallet address that made the purchase';
COMMENT ON COLUMN transactions.email IS 'User email address (optional)';
COMMENT ON COLUMN transactions.phone_number IS 'User phone number (required)';
COMMENT ON COLUMN transactions.is_received IS 'Whether the payment was received successfully';
COMMENT ON COLUMN transactions.transaction_hash IS 'Blockchain transaction hash';
COMMENT ON COLUMN transactions.dan_tokens_sent IS 'Amount of DAN tokens sent for payment';
COMMENT ON COLUMN transactions.thb_amount IS 'THB amount for the package (default 200)';
COMMENT ON COLUMN transactions.created_at IS 'When the transaction was created';
COMMENT ON COLUMN transactions.updated_at IS 'When the transaction was last updated';
