CREATE TABLE matches (
id uuid PRIMARY KEY,
league text,
home_team text,
away_team text,
kickoff_utc timestamptz,
status text -- PRE/LIVE/FT
);

CREATE TABLE analysis_snapshots (
id bigserial PRIMARY KEY,
match_id uuid REFERENCES matches(id),
snapshot_ts timestamptz DEFAULT now(),
payload jsonb NOT NULL
);

