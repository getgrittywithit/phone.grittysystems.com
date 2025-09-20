-- Create SMS conversations table
CREATE TABLE IF NOT EXISTS sms_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  brand_id TEXT NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phone_number, brand_id)
);

-- Create SMS messages table
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES sms_conversations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  brand_id TEXT NOT NULL,
  twilio_sid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_conversations_phone_number ON sms_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_brand_id ON sms_conversations(brand_id);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_last_message_at ON sms_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_messages_conversation_id ON sms_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created_at ON sms_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_messages_phone_number ON sms_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_messages_brand_id ON sms_messages(brand_id);

-- Create function to update SMS conversation on new message
CREATE OR REPLACE FUNCTION update_sms_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the conversation's last_message_at timestamp
  UPDATE sms_conversations 
  SET 
    last_message_at = NEW.created_at,
    updated_at = NOW(),
    unread_count = CASE 
      WHEN NEW.direction = 'inbound' THEN unread_count + 1
      ELSE unread_count
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update SMS conversation when message is inserted
CREATE TRIGGER update_sms_conversation_after_message_insert
  AFTER INSERT ON sms_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_conversation_on_message();

-- Update the generic updated_at trigger for SMS conversations
CREATE TRIGGER update_sms_conversations_updated_at 
  BEFORE UPDATE ON sms_conversations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Update the generic updated_at trigger for SMS messages
CREATE TRIGGER update_sms_messages_updated_at 
  BEFORE UPDATE ON sms_messages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable all operations for authenticated users on sms_conversations" ON sms_conversations
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Enable all operations for authenticated users on sms_messages" ON sms_messages
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');