-- Function to create a poll with options in a single transaction
CREATE OR REPLACE FUNCTION create_poll (
  poll_title TEXT,
  poll_streamer_id UUID,
  poll_options TEXT[]
)
RETURNS UUID AS $$
DECLARE
  new_poll_id UUID;
  option_text TEXT;
BEGIN
  -- Create the poll
  INSERT INTO polls (
    title, 
    streamer_id, 
    is_active
  ) VALUES (
    poll_title, 
    poll_streamer_id, 
    true
  ) RETURNING id INTO new_poll_id;
  
  -- Create the options
  FOREACH option_text IN ARRAY poll_options
  LOOP
    INSERT INTO poll_options (
      poll_id, 
      option_text
    ) VALUES (
      new_poll_id, 
      option_text
    );
  END LOOP;
  
  RETURN new_poll_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 