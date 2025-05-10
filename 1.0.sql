-- ====================
-- MAIN TABLES
-- ====================

CREATE TABLE "Users" (
	id SERIAL PRIMARY KEY,
	username TEXT UNIQUE,
	email TEXT UNIQUE,
	password_hash TEXT,
	photo_url TEXT DEFAULT '',
	is_trainer BOOLEAN DEFAULT FALSE,
	gender TEXT DEFAULT NULL
);
COMMENT ON TABLE "Users" IS 'Main users table, including both trainers and clients.';

CREATE TABLE "UserSettings" (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
	units JSONB DEFAULT NULL,  -- User units preferences (metric or imperial), default to NULL
	app_preferences JSONB DEFAULT NULL,  -- User-specific preferences for the app, default to NULL
	fitness_goal TEXT DEFAULT NULL,  -- Fitness goal (e.g., strength, weight loss), default to NULL
	weekly_goal INT DEFAULT NULL,  -- Weekly goal (e.g., 3 workouts per week), default to NULL
	performance_data JSONB DEFAULT NULL  -- Additional settings or preferences for performance tracking, default to NULL
);
COMMENT ON TABLE "UserSettings" IS 'User-specific configuration settings (units, goals, app preferences, etc.), stored in JSONB format for flexibility.';

CREATE TABLE "Measurements" (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
	date DATE NOT NULL,
	key TEXT NOT NULL, -- Measurement key (e.g., weight, body fat percentage, etc.)
	value FLOAT NOT NULL -- Measurement value (e.g., 70.5 for weight in kg)
);
COMMENT ON TABLE "Measurements" IS 'User physical measurements (e.g., weight, body fat percentage, body part sizes).';

CREATE TABLE "Tags" (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE, -- Trainer who created the tag
	name TEXT NOT NULL, -- Name of the tag (e.g., "Beginner", "Advanced", etc.)
	color TEXT, -- Color associated with the tag (e.g., "#FF5733")
	description TEXT -- Description of the tag (e.g., "Clients who are beginners in strength training")
);
COMMENT ON TABLE "Tags" IS 'Tags created by trainers to categorize clients or routines.';

CREATE TABLE "ClientTags" (
	client_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE, -- Client who is assigned the tag
	tag_id INTEGER NOT NULL REFERENCES "Tags"(id) ON DELETE CASCADE, -- Tag assigned to the client
	PRIMARY KEY (client_id, tag_id) 
);
COMMENT ON TABLE "ClientTags" IS 'Many-to-many relationship between clients and tags, allowing clients to have multiple tags.';

CREATE TABLE "Gyms" (
	id SERIAL PRIMARY KEY, 
	name TEXT, -- Name of the gym
	location TEXT, -- Location of the gym (e.g., address or city)
	equipment JSONB DEFAULT NULL -- Equipment available in the gym, stored in JSONB format for flexibility 
);
COMMENT ON TABLE "Gyms" IS 'Gyms where users can train, including equipment and location details.';

CREATE TABLE "Routines" (
	id SERIAL PRIMARY KEY, 
	title TEXT, -- Title of the routine
	description TEXT, -- Description of the routine
	type TEXT, -- Type of routine (e.g., "structured", "punctual")
	created_by INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE -- User who created the routine 
);
COMMENT ON TABLE "Routines" IS 'Main routines table, including both punctual and structured routines.';

CREATE TABLE "PuntualRoutines" (
	id SERIAL PRIMARY KEY, 
	routine_id INTEGER NOT NULL REFERENCES "Routines"(id) ON DELETE CASCADE, -- Reference to the parent routine
	level TEXT, -- Level of the routine (e.g., "beginner", "intermediate", "advanced")
	start_time TIMESTAMP, -- Start time of the routine session
	end_time TIMESTAMP -- End time of the routine session
);
COMMENT ON TABLE "PuntualRoutines" IS 'One-off training sessions scheduled for specific dates and times.';

CREATE TABLE "StructuredRoutines" (
	id SERIAL PRIMARY KEY, 
	routine_id INTEGER NOT NULL REFERENCES "Routines"(id) ON DELETE CASCADE, -- Reference to the parent routine
	avg_days INT, -- Average number of days between sessions in the structured routine
	level TEXT, -- Level of the routine (e.g., "beginner", "intermediate", "advanced")
	session_count INT -- Number of sessions in the structured routine
);
COMMENT ON TABLE "StructuredRoutines" IS 'Structured training plans composed of multiple scheduled sessions.';

CREATE TABLE "RoutineSessions" (
	id SERIAL PRIMARY KEY, 
	structured_id INTEGER NOT NULL REFERENCES "StructuredRoutines"(id) ON DELETE CASCADE, -- Reference to the parent structured routine
	title TEXT, -- Title of the session
	primary_muscles TEXT, -- Primary muscles targeted in the session (e.g., "chest", "legs")
	optional_muscles TEXT -- Optional muscles targeted in the session (e.g., "arms", "back")
);
COMMENT ON TABLE "RoutineSessions" IS 'Individual training sessions within a structured routine.';

CREATE TABLE "Exercises" (
	id SERIAL PRIMARY KEY, 
	name TEXT, -- Name of the exercise (e.g., "Bench Press", "Squat")
	instructions TEXT, -- Instructions for performing the exercise
	primary_muscle TEXT, -- Primary muscle targeted by the exercise (e.g., "chest", "legs")
	secondary_muscles TEXT, -- Secondary muscles targeted by the exercise (e.g., "triceps", "glutes")
	equipment_required TEXT, -- Equipment required for the exercise (e.g., "dumbbells", "barbell")
	photos JSON, -- Photos related to the exercise, stored in JSON format for flexibility
	videos JSON, -- Videos related to the exercise, stored in JSON format for flexibility
	type TEXT, -- Type of exercise (e.g., "strength", "cardio", "flexibility")
	compound BOOLEAN DEFAULT FALSE, -- Indicates if the exercise is compound (involving multiple joints) or isolation (single joint)
	is_custom BOOLEAN DEFAULT FALSE -- Indicates if the exercise is a custom action (like a stretch or rest period)
);
COMMENT ON TABLE "Exercises" IS 'Catalog of available exercises with instructions, media files, and attributes.';

CREATE TABLE "RoutineSteps" (
	id SERIAL PRIMARY KEY,  -- Unique identifier for each step in a routine
	routine_id INTEGER NOT NULL REFERENCES "Routines"(id) ON DELETE CASCADE,  -- Reference to the parent routine
	session_id INTEGER REFERENCES "RoutineSessions"(id) ON DELETE CASCADE,  -- Optional reference to a session in a structured routine
	linked_exercise_id INTEGER REFERENCES "Exercises"(id) ON DELETE SET NULL,  -- Link to an exercise, if applicable
	title TEXT,  -- Title for the step (used if not linked to an exercise, for example, a yoga pose or a specific cardio activity)
	description TEXT,  -- Description of the step
	"order" INT,  -- Order of the step within the routine or session
	duration INT DEFAULT NULL,  -- Duration in seconds (for cardio, yoga, etc.), default to NULL
	rest_after INT DEFAULT NULL,  -- Optional rest time after the step, default to NULL
	repetitions INT DEFAULT NULL,  -- Repetitions if applicable (for exercises), default to NULL
	distance FLOAT DEFAULT NULL,  -- Distance, for example, running or cycling steps, default to NULL
	weight FLOAT DEFAULT NULL,  -- Weight, for weight-lifting steps, default to NULL
	is_custom BOOLEAN DEFAULT FALSE,  -- Indicates if the step is a custom action (like a stretch or rest period)
	is_active BOOLEAN DEFAULT TRUE,  -- Flag to indicate whether this step is currently active in the routine
	performance_data JSONB DEFAULT NULL,  -- Stores additional data like notes, feedback, performance metrics, etc.
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the routine step was created
);
COMMENT ON TABLE "RoutineSteps" IS 'Steps within a routine, including exercises, rest periods, or other custom actions. Performance data is stored in JSONB format.';

CREATE TABLE "TrainingSessions" (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
	routine_id INTEGER NOT NULL REFERENCES "Routines"(id) ON DELETE CASCADE,
	punctual_id INTEGER REFERENCES "PuntualRoutines"(id) ON DELETE SET NULL,
	session_id INTEGER REFERENCES "RoutineSessions"(id) ON DELETE SET NULL,
	start_time TIMESTAMP, -- Start time of the training session
	end_time TIMESTAMP, -- End time of the training session
	volume FLOAT DEFAULT NULL,  -- Total volume of the session (for example, total weight lifted), default to NULL
	intensity FLOAT DEFAULT NULL,  -- Intensity of the session (calculated or predefined scale), default to NULL
	calories_burned INT DEFAULT NULL,  -- Total calories burned during the session, default to NULL
	muscles_worked TEXT DEFAULT NULL,  -- Muscles targeted during the session, default to NULL
	performance_data JSONB DEFAULT NULL,  -- Stores additional data such as notes, feedback, or session-related metrics
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the training session was created
);
COMMENT ON TABLE "TrainingSessions" IS 'Training sessions performed by users, logging workout stats and notes. Additional session data is stored in JSONB format.';

CREATE TABLE "TrainingExercises" (
	id SERIAL PRIMARY KEY, -- Unique identifier for each training exercise
	training_id INTEGER NOT NULL REFERENCES "TrainingSessions"(id) ON DELETE CASCADE, -- Reference to the training session
	exercise_id INTEGER NOT NULL REFERENCES "Exercises"(id) ON DELETE CASCADE, -- Reference to the exercise performed
	volume FLOAT DEFAULT NULL,  -- Volume of the exercise (weight lifted * repetitions), default to NULL
	one_rep_max FLOAT DEFAULT NULL,  -- One-rep max for the exercise (if applicable), default to NULL
	performance_data JSONB DEFAULT NULL,  -- Stores additional details like comments, feedback, performance notes
	timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the training exercise was performed
);
COMMENT ON TABLE "TrainingExercises" IS 'Exercises performed during a training session, recording volume, one-rep max, and other details in JSONB format.';


CREATE TABLE "ExerciseSeries" (
	training_exercise_id INTEGER NOT NULL REFERENCES "TrainingExercises"(id) ON DELETE CASCADE, -- Reference to the training exercise
	"order" INT NOT NULL,  -- Order of the series within the exercise
	is_warmup BOOLEAN NOT NULL,  -- Flag to indicate if this is a warm-up set
	reps INT DEFAULT NULL,  -- Number of repetitions, default to NULL
	weight FLOAT DEFAULT NULL,  -- Weight lifted in this series, default to NULL
	time_seconds INT DEFAULT NULL,  -- Time in seconds for exercises like cardio, default to NULL
	distance FLOAT DEFAULT NULL,  -- Distance for cardio exercises, default to NULL
	record JSONB DEFAULT NULL,  -- Stores additional data or records related to the series (e.g., feedback, performance data), default to NULL
	timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the series was performed
	PRIMARY KEY (training_exercise_id, "order", is_warmup)
);
COMMENT ON TABLE "ExerciseSeries" IS 'Sets (warm-up or working) performed during an exercise in a training session, with additional performance data stored in JSONB format.';


CREATE TABLE "Imports" (
	id SERIAL PRIMARY KEY, 
	user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE, -- User who uploaded the file
	file_name TEXT, -- Name of the uploaded file
	uploaded_at TIMESTAMP, -- Timestamp when the file was uploaded
	processed_at TIMESTAMP, -- Timestamp when the file was processed
	result JSONB DEFAULT NULL, -- Result of the import process (success or error messages), stored in JSONB format for flexibility
	status TEXT DEFAULT 'pending' -- Status of the import process (e.g., "pending", "processing", "completed", "failed")
);
COMMENT ON TABLE "Imports" IS 'Records of file uploads for importing data into the system, including status and results.';


-- ====================
-- INDEXES
-- ====================

-- Users
CREATE INDEX idx_users_email ON "Users" (email);
CREATE INDEX idx_users_username ON "Users" (username);

-- UserSettings
CREATE INDEX idx_usersettings_user_id ON "UserSettings" (user_id);

-- Measurements
CREATE INDEX idx_measurements_user_id ON "Measurements" (user_id);
CREATE INDEX idx_measurements_date_key ON "Measurements" (date, key);

-- Tags
CREATE INDEX idx_tags_user_id ON "Tags" (user_id);
CREATE INDEX idx_tags_name ON "Tags" (name);

-- ClientTags
CREATE INDEX idx_clienttags_client_id ON "ClientTags" (client_id);
CREATE INDEX idx_clienttags_tag_id ON "ClientTags" (tag_id);

-- Gyms
CREATE INDEX idx_gyms_name ON "Gyms" (name);
CREATE INDEX idx_gyms_location ON "Gyms" (location);

-- Routines
CREATE INDEX idx_routines_created_by ON "Routines" (created_by);
CREATE INDEX idx_routines_type ON "Routines" (type);

-- PuntualRoutines
CREATE INDEX idx_puntualroutines_routine_id ON "PuntualRoutines" (routine_id);
CREATE INDEX idx_puntualroutines_start_time ON "PuntualRoutines" (start_time);

-- StructuredRoutines
CREATE INDEX idx_structuredroutines_routine_id ON "StructuredRoutines" (routine_id);
CREATE INDEX idx_structuredroutines_level ON "StructuredRoutines" (level);

-- RoutineSessions
CREATE INDEX idx_routinesessions_structured_id ON "RoutineSessions" (structured_id);
CREATE INDEX idx_routinesessions_primary_muscles ON "RoutineSessions" (primary_muscles);

-- Exercises
CREATE INDEX idx_exercises_primary_muscle ON "Exercises" (primary_muscle);
CREATE INDEX idx_exercises_type ON "Exercises" (type);

-- RoutineSteps
CREATE INDEX idx_routinesteps_routine_id ON "RoutineSteps" (routine_id);
CREATE INDEX idx_routinesteps_session_id ON "RoutineSteps" (session_id);

-- TrainingSessions
CREATE INDEX idx_trainingsessions_user_id ON "TrainingSessions" (user_id);
CREATE INDEX idx_trainingsessions_routine_id ON "TrainingSessions" (routine_id);
CREATE INDEX idx_trainingsessions_start_time ON "TrainingSessions" (start_time);

-- TrainingExercises
CREATE INDEX idx_trainingexercises_training_id ON "TrainingExercises" (training_id);
CREATE INDEX idx_trainingexercises_exercise_id ON "TrainingExercises" (exercise_id);

-- ExerciseSeries
CREATE INDEX idx_exerciseseries_training_exercise_id ON "ExerciseSeries" (training_exercise_id);
CREATE INDEX idx_exerciseseries_order ON "ExerciseSeries" ("order");

-- Imports
CREATE INDEX idx_imports_user_id ON "Imports" (user_id);
CREATE INDEX idx_imports_status ON "Imports" (status);
CREATE INDEX idx_imports_uploaded_at ON "Imports" (uploaded_at);
CREATE INDEX idx_imports_processed_at ON "Imports" (processed_at);
