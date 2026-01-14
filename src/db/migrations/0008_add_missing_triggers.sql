-- Add missing real-time sync triggers for note_folder, tag, and tag_mention

-- Trigger for note_folder (has user_id column)
CREATE TRIGGER note_folder_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON note_folder
  FOR EACH ROW EXECUTE FUNCTION notify_data_change_no_date();

-- Trigger for tag (has user_id column)
CREATE TRIGGER tag_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tag
  FOR EACH ROW EXECUTE FUNCTION notify_data_change_no_date();

-- Function for tag_mention (needs to look up user from tag)
CREATE OR REPLACE FUNCTION notify_tag_mention_change()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
  target_user_id text;
  target_tag_id text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_tag_id := OLD.tag_id;
  ELSE
    target_tag_id := NEW.tag_id;
  END IF;

  SELECT user_id INTO target_user_id FROM tag WHERE id = target_tag_id;

  IF target_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  payload = json_build_object(
    'operation', TG_OP,
    'table', TG_TABLE_NAME,
    'id', COALESCE(NEW.id, OLD.id),
    'date', NULL
  );

  PERFORM pg_notify('data_change_' || target_user_id, payload::text);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tag_mention
CREATE TRIGGER tag_mention_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tag_mention
  FOR EACH ROW EXECUTE FUNCTION notify_tag_mention_change();
