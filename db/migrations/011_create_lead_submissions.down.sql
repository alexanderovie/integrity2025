BEGIN;

DROP TRIGGER IF EXISTS lead_submissions_set_updated_at ON lead_submissions;
DROP FUNCTION IF EXISTS set_lead_submissions_updated_at();
DROP TABLE IF EXISTS lead_submissions;

COMMIT;
