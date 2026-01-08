-- Function to notify on changes for tables WITH date column (todo, note)
CREATE OR REPLACE FUNCTION notify_data_change_with_date()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
  target_user_id text;
  target_date text;
  target_id text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.user_id;
    target_id := OLD.id;
    target_date := OLD.date;
  ELSE
    target_user_id := NEW.user_id;
    target_id := NEW.id;
    target_date := NEW.date;
  END IF;

  payload = json_build_object(
    'operation', TG_OP,
    'table', TG_TABLE_NAME,
    'id', target_id,
    'date', target_date
  );

  PERFORM pg_notify('data_change_' || target_user_id, payload::text);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to notify on changes for tables WITHOUT date column (comment, project, user_settings)
CREATE OR REPLACE FUNCTION notify_data_change_no_date()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
  target_user_id text;
  target_id text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.user_id;
    target_id := OLD.id;
  ELSE
    target_user_id := NEW.user_id;
    target_id := NEW.id;
  END IF;

  payload = json_build_object(
    'operation', TG_OP,
    'table', TG_TABLE_NAME,
    'id', target_id,
    'date', NULL
  );

  PERFORM pg_notify('data_change_' || target_user_id, payload::text);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function for project_assignment (needs to look up user from project)
CREATE OR REPLACE FUNCTION notify_project_assignment_change()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
  target_user_id text;
  target_project_id text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_project_id := OLD.project_id;
  ELSE
    target_project_id := NEW.project_id;
  END IF;

  SELECT user_id INTO target_user_id FROM project WHERE id = target_project_id;

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

-- Triggers for tables WITH date column
CREATE TRIGGER todo_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON todo
  FOR EACH ROW EXECUTE FUNCTION notify_data_change_with_date();

CREATE TRIGGER note_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON note
  FOR EACH ROW EXECUTE FUNCTION notify_data_change_with_date();

-- Triggers for tables WITHOUT date column
CREATE TRIGGER comment_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON comment
  FOR EACH ROW EXECUTE FUNCTION notify_data_change_no_date();

CREATE TRIGGER project_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON project
  FOR EACH ROW EXECUTE FUNCTION notify_data_change_no_date();

CREATE TRIGGER user_settings_notify_trigger
  AFTER INSERT OR UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION notify_data_change_no_date();

-- Trigger for project_assignment (uses its own function)
CREATE TRIGGER project_assignment_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON project_assignment
  FOR EACH ROW EXECUTE FUNCTION notify_project_assignment_change();
