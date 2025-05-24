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
  units JSONB DEFAULT NULL,                -- User units preferences (metric or imperial), default to NULL
  app_preferences JSONB DEFAULT NULL,      -- User-specific preferences for the app, default to NULL
  fitness_goal TEXT DEFAULT NULL,          -- Fitness goal (e.g., strength, weight loss), default to NULL
  weekly_goal INT DEFAULT 6,            -- Weekly goal (e.g., 3 workouts per week), default to NULL
  selected_routine INT DEFAULT 1,       -- The user’s currently selected training routine (references TrainingSplits)
  performance_data JSONB DEFAULT NULL,     -- Additional settings or preferences for performance tracking, default to NULL
  CONSTRAINT fk_selected_routine FOREIGN KEY (selected_routine) REFERENCES "TrainingSplits"(id) ON DELETE SET NULL
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
  equipment JSONB DEFAULT NULL, -- Equipment available in the gym, stored in JSONB format for flexibility 
  type TEXT CHECK (type IN ('Large gym', 'Small gym', 'Garage gym')) DEFAULT 'Large gym', -- Specifies the type of gym
  private BOOLEAN DEFAULT TRUE, -- Indicates if the gym is private (TRUE) or public (FALSE)
  created_by INTEGER REFERENCES "Users"(id) ON DELETE SET NULL, -- User who created this gym (nullified if user is deleted)
);
COMMENT ON TABLE "Gyms" IS 'Gyms where users can train, including equipment and location details.';

CREATE TABLE "TrainingSplits" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,              -- Split title, e.g., "PUSH, PULL, LEGS"
    duration TEXT NOT NULL,           -- Typical session duration, e.g., "45' - 60'"
    days_per_week TEXT NOT NULL,      -- Days per week, e.g., "3/6"
    sessions INT NOT NULL,            -- Number of sessions in the split, e.g., 3
    level JSONB NOT NULL,             -- Levels for which the split is suitable, e.g., ["Beginner", "Intermediate", "Advanced"]
    workouts JSONB NOT NULL,          -- Workouts structure for the split
    description TEXT NOT NULL,        -- Description of the split
    is_custom BOOLEAN NOT NULL DEFAULT FALSE, -- Indicates if the split is custom
    created_by INTEGER REFERENCES "Users"(id) -- User ID of the creator (nullable, only set if is_custom is true)
);
COMMENT ON TABLE "TrainingSplits" IS 'Stores available and custom training splits, including metadata, workouts, and creator info if custom.';

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
	secondary_muscles JSON, -- Secondary muscles targeted by the exercise (e.g., "triceps", "glutes")
	equipment_required JSON, -- Equipment required for the exercise (e.g., "dumbbells", "barbell")
	photos JSON, -- Photos related to the exercise, stored in JSON format for flexibility
	videos JSON, -- Videos related to the exercise, stored in JSON format for flexibility
	type JSON, -- Type of exercise (e.g., "strength", "cardio", "flexibility")
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


-- ====================
-- EXERCISES DATA
-- ====================

-- CHEST
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Crunch', '[
  "Lie flat on your back on a mat with your knees bent and feet flat on the floor, hip-width apart.",
  "Place your hands behind your head without interlocking your fingers.",
  "Engage your core and lift your shoulders off the floor about 2-3 inches, keeping your lower back pressed to the mat.",
  "Pause and squeeze your abs at the top of the movement.",
  "Slowly lower your shoulders back to the starting position."
]', 'Abs', '[]', '[]', '[]', '[]', '["strength", "calisthenics"]', false),

('Hanging Leg Raise', '[
  "Hang from a pull-up bar with an overhand grip, arms fully extended and legs straight.",
  "Brace your core and keep your legs together.",
  "Slowly raise your legs in front of you, keeping them straight, until they are parallel to the ground or higher.",
  "Pause at the top and contract your abs.",
  "Lower your legs with control back to the starting position."
]', 'Abs', '["Hip flexors"]', '["Pull-up bar"]', '[]', '[]', '["strength", "calisthenics"]', false),

('Plank', '[
  "Lie face down on the mat and prop yourself up on your forearms and toes.",
  "Keep your elbows directly under your shoulders and your body in a straight line from head to heels.",
  "Engage your core, glutes, and legs.",
  "Hold this position, keeping your hips level and avoiding any sagging or piking.",
  "Breathe steadily and hold for the desired duration."
]', 'Abs', '["Lower back", "Shoulders"]', '[]', '[]', '[]', '["strength", "calisthenics"]', false),

('Cable Crunch', '[
  "Attach a rope handle to a high pulley on a cable machine.",
  "Kneel down facing the machine and grasp the rope handles with both hands, placing your wrists near your head.",
  "Engage your core and crunch your torso downward, bringing your elbows toward your knees.",
  "Pause and squeeze your abs at the bottom.",
  "Slowly return to the starting position, resisting the weight."
]', 'Abs', '["Obliques"]', '["Cable machine"]', '[]', '[]', '["strength"]', false),

('Mountain Climbers', '[
  "Start in a high plank position with your hands under your shoulders and your body in a straight line.",
  "Engage your core and bring your right knee toward your chest.",
  "Quickly switch legs, bringing your left knee toward your chest while moving your right leg back.",
  "Continue alternating legs at a fast pace, as if running in place.",
  "Keep your hips low and maintain a steady rhythm."
]', 'Abs', '["Shoulders", "Cardio"]', '[]', '[]', '[]', '["cardio", "calisthenics"]', false);

-- BACK
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Pull-Up', '[
  "Grasp a pull-up bar with an overhand grip, hands slightly wider than shoulder-width apart.",
  "Hang at arm''s length with your arms fully extended and your feet off the ground.",
  "Engage your back and core, then pull your chest up toward the bar by driving your elbows down and back.",
  "Pause when your chin is above the bar.",
  "Lower yourself slowly back to the starting position with control."
]', 'Back', '["Biceps", "Forearms"]', '["Pull-up bar"]', '[]', '[]', '["strength", "calisthenics"]', true),

('Lat Pulldown', '[
  "Sit at a lat pulldown machine and grasp the bar with a wide overhand grip.",
  "Secure your thighs under the pads and keep your chest up.",
  "Pull the bar down toward your upper chest by squeezing your shoulder blades together and driving your elbows down.",
  "Pause at the bottom and contract your lats.",
  "Slowly release the bar back to the starting position."
]', 'Back', '["Biceps"]', '["Lat pulldown machine"]', '[]', '[]', '["strength"]', true),

('Seated Cable Row', '[
  "Sit at a cable row machine and place your feet on the footrests.",
  "Grasp the handle with both hands, arms extended.",
  "Pull the handle toward your torso by driving your elbows back and squeezing your shoulder blades together.",
  "Pause when the handle reaches your abdomen.",
  "Slowly extend your arms back to the starting position."
]', 'Back', '["Biceps", "Rear delts"]', '["Cable row machine"]', '[]', '[]', '["strength"]', true),

('Bent Over Barbell Row', '[
  "Stand with your feet shoulder-width apart, holding a barbell with an overhand grip.",
  "Bend your knees slightly and hinge at the hips so your torso is nearly parallel to the floor.",
  "Let the bar hang at arm''s length, then pull it toward your lower ribcage by driving your elbows up and back.",
  "Pause and squeeze your back muscles at the top.",
  "Lower the bar back to the starting position with control."
]', 'Back', '["Biceps", "Lower back"]', '["Barbell"]', '[]', '[]', '["strength"]', true),

('Superman', '[
  "Lie face down on a mat with your arms extended in front of you and legs straight.",
  "Simultaneously lift your arms, chest, and legs off the ground as high as possible.",
  "Hold the top position, squeezing your glutes and lower back.",
  "Lower your arms and legs back to the starting position with control.",
  "Repeat for the desired number of reps."
]', 'Back', '["Glutes", "Shoulders"]', '[]', '[]', '[]', '["calisthenics", "flexibility"]', false);

-- BICEPS
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Barbell Curl', '[
  "Stand upright holding a barbell with an underhand grip, hands shoulder-width apart.",
  "Keep your elbows close to your torso and your back straight.",
  "Curl the barbell up toward your shoulders by contracting your biceps.",
  "Pause at the top, then slowly lower the bar back to the starting position."
]', 'Biceps', '["Forearms"]', '["Barbell"]', '[]', '[]', '["strength"]', false),

('Hammer Curl', '[
  "Stand with a dumbbell in each hand, arms at your sides and palms facing your torso.",
  "Keep your elbows close to your body and curl the weights up toward your shoulders.",
  "Pause at the top, then lower the dumbbells back down with control.",
  "Maintain a neutral grip throughout the movement."
]', 'Biceps', '["Forearms"]', '["Dumbbells"]', '[]', '[]', '["strength"]', false),

('Concentration Curl', '[
  "Sit on a bench with your legs apart and hold a dumbbell in one hand.",
  "Rest your elbow on the inside of your thigh and let the dumbbell hang at arm''s length.",
  "Curl the dumbbell up toward your shoulder, keeping your upper arm stationary.",
  "Pause and squeeze your biceps at the top.",
  "Lower the dumbbell back to the starting position."
]', 'Biceps', '[]', '["Dumbbell"]', '[]', '[]', '["strength"]', false),

('Cable Curl', '[
  "Stand facing a low cable machine with a straight bar attachment.",
  "Grasp the bar with an underhand grip, arms extended.",
  "Curl the bar toward your shoulders by flexing your elbows.",
  "Pause at the top, then slowly lower the bar back to the starting position."
]', 'Biceps', '[]', '["Cable machine"]', '[]', '[]', '["strength"]', false),

('Chin-Up', '[
  "Grasp a pull-up bar with an underhand grip, hands shoulder-width apart.",
  "Hang at arm''s length with your arms fully extended and feet off the ground.",
  "Pull your chest up toward the bar by driving your elbows down and back.",
  "Pause when your chin is above the bar.",
  "Lower yourself slowly back to the starting position."
]', 'Biceps', '["Back", "Forearms"]', '["Pull-up bar"]', '[]', '[]', '["strength", "calisthenics"]', true);

-- CALVES
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Standing Calf Raise', '[
  "Stand upright with feet shoulder-width apart.",
  "Raise your heels off the ground by extending your ankles as high as possible.",
  "Pause at the top, squeezing your calf muscles.",
  "Slowly lower your heels back to the starting position."
]', 'Calves', '[]', '[]', '[]', '[]', '["strength", "calisthenics"]', false),

('Seated Calf Raise', '[
  "Sit on a seated calf raise machine and place the balls of your feet on the platform.",
  "Push through the balls of your feet to raise your heels as high as possible.",
  "Pause at the top and squeeze your calves.",
  "Slowly lower your heels back down."
]', 'Calves', '[]', '["Seated calf raise machine"]', '[]', '[]', '["strength"]', false),

('Donkey Calf Raise', '[
  "Lean forward with your hands supported on a bench or platform.",
  "Place the balls of your feet on an elevated surface.",
  "Raise your heels as high as possible by extending your ankles.",
  "Pause and squeeze your calves at the top.",
  "Lower your heels back down slowly."
]', 'Calves', '[]', '[]', '[]', '[]', '["strength"]', false),

('Single-Leg Calf Raise', '[
  "Stand on one foot on an elevated surface with your heel hanging off the edge.",
  "Raise your heel as high as possible by extending your ankle.",
  "Pause and squeeze your calf muscle at the top.",
  "Lower your heel back down slowly.",
  "Repeat with the other leg."
]', 'Calves', '[]', '[]', '[]', '[]', '["strength", "calisthenics"]', false),

('Leg Press Calf Raise', '[
  "Sit on a leg press machine with your feet on the platform shoulder-width apart.",
  "Push through the balls of your feet to raise your heels as high as possible.",
  "Pause and squeeze your calves at the top.",
  "Lower your heels back down slowly."
]', 'Calves', '[]', '["Leg press machine"]', '[]', '[]', '["strength"]', false);

-- CARDIO
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Running', '[
  "Start with a warm-up walk or light jog.",
  "Run at a moderate pace maintaining steady breathing.",
  "Keep your posture upright and shoulders relaxed.",
  "Continue for the desired duration or distance.",
  "Cool down with a slow jog or walk."
]', 'Cardio', '["Legs"]', '["Treadmill"]', '[]', '[]', '["cardio"]', false),

('Jump Rope', '[
  "Hold the rope handles firmly with your hands at hip height.",
  "Swing the rope over your head and jump as it passes under your feet.",
  "Keep your jumps low and land softly on the balls of your feet.",
  "Maintain a steady rhythm and breathing.",
  "Continue for the desired duration."
]', 'Cardio', '["Calves", "Forearms"]', '["Jump rope"]', '[]', '[]', '["cardio"]', false),

('Burpees', '[
  "Start standing with feet shoulder-width apart.",
  "Drop into a squat position and place your hands on the floor.",
  "Kick your feet back into a plank position.",
  "Perform a push-up.",
  "Jump your feet back to the squat position.",
  "Explosively jump up with arms overhead.",
  "Land softly and repeat."
]', 'Cardio', '["Chest", "Legs"]', '[]', '[]', '[]', '["cardio", "calisthenics"]', true),

('Rowing Machine', '[
  "Sit on the rowing machine and strap your feet in securely.",
  "Grab the handle with both hands and extend your legs.",
  "Pull the handle toward your chest while leaning back slightly.",
  "Extend your arms and bend your knees to return to the start.",
  "Maintain a steady rhythm and breathing."
]', 'Cardio', '["Back", "Arms"]', '["Rowing machine"]', '[]', '[]', '["cardio"]', true),

('Cycling', '[
  "Adjust the bike seat to your height.",
  "Start pedaling at a comfortable pace.",
  "Maintain good posture with a straight back.",
  "Increase resistance or speed as desired.",
  "Continue for the desired duration."
]', 'Cardio', '["Legs"]', '["Stationary bike"]', '[]', '[]', '["cardio"]', false);

-- CHEST
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Bench Press', '[
  "Lie flat on a bench with your feet planted firmly on the floor.",
  "Grip the barbell with hands slightly wider than shoulder-width.",
  "Unrack the bar and hold it above your chest with arms extended.",
  "Lower the bar slowly to your mid-chest, keeping elbows at about 75 degrees.",
  "Press the bar back up to the starting position, fully extending your arms."
]', 'Chest', '["Triceps", "Shoulders"]', '["Barbell", "Bench"]', '[]', '[]', '["strength"]', true),

('Push-Up', '[
  "Start in a high plank position with your hands slightly wider than shoulder-width apart.",
  "Keep your body in a straight line from head to heels.",
  "Lower your chest to the floor by bending your elbows.",
  "Pause when your chest is just above the ground.",
  "Push through your palms to return to the starting position."
]', 'Chest', '["Triceps", "Shoulders"]', '[]', '[]', '[]', '["strength", "calisthenics"]', true),

('Incline Dumbbell Press', '[
  "Set an incline bench to a 30-45 degree angle and sit with a dumbbell in each hand.",
  "Rest the dumbbells on your thighs, then kick them up as you lie back.",
  "Press the dumbbells above your chest with arms fully extended.",
  "Lower the dumbbells slowly to chest level, elbows at about 75 degrees.",
  "Press the dumbbells back up to the starting position."
]', 'Chest', '["Triceps", "Shoulders"]', '["Dumbbells", "Incline bench"]', '[]', '[]', '["strength"]', true),

('Chest Fly', '[
  "Lie flat on a bench holding a dumbbell in each hand above your chest, palms facing each other.",
  "With a slight bend in your elbows, lower the weights out to your sides in a wide arc.",
  "Stop when your elbows are at chest level or just below.",
  "Bring the dumbbells back up over your chest by squeezing your pecs.",
  "Repeat for the desired reps."
]', 'Chest', '["Shoulders"]', '["Dumbbells", "Bench"]', '[]', '[]', '["strength"]', false),

('Cable Crossover', '[
  "Stand between two cable stacks with the pulleys set at the highest position.",
  "Grab a handle in each hand and step forward, arms extended slightly bent.",
  "Pull the handles down and together in front of your hips in a wide arc.",
  "Squeeze your chest at the bottom, then slowly return to the starting position."
]', 'Chest', '["Shoulders"]', '["Cable machine"]', '[]', '[]', '["strength"]', false);

-- FOREARMS
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Wrist Curl', '[
  "Sit on a bench holding a barbell with an underhand grip.",
  "Rest your forearms on your thighs with wrists hanging over the edge.",
  "Curl the barbell upward by flexing your wrists.",
  "Pause and squeeze your forearms at the top.",
  "Lower the barbell back to the starting position."
]', 'Forearms', '[]', '["Barbell"]', '[]', '[]', '["strength"]', false),

('Reverse Wrist Curl', '[
  "Sit on a bench holding a barbell with an overhand grip.",
  "Rest your forearms on your thighs with wrists hanging over the edge.",
  "Extend your wrists upward, lifting the barbell.",
  "Pause and squeeze your forearms at the top.",
  "Lower the barbell back to the starting position."
]', 'Forearms', '[]', '["Barbell"]', '[]', '[]', '["strength"]', false),

('Farmer''s Walk', '[
  "Stand upright holding a heavy dumbbell in each hand at your sides.",
  "Keep your shoulders back and core engaged.",
  "Walk forward for a set distance or time, maintaining good posture.",
  "Set the weights down safely at the end of the walk."
]', 'Forearms', '["Grip", "Traps"]', '["Dumbbells"]', '[]', '[]', '["strength", "conditioning"]', true),

('Plate Pinch', '[
  "Stand upright and hold two weight plates together with your fingers and thumb.",
  "Keep your arms at your sides and maintain a firm pinch grip.",
  "Hold for as long as possible, focusing on grip strength.",
  "Release the plates safely when fatigued."
]', 'Forearms', '["Grip"]', '["Weight plates"]', '[]', '[]', '["strength"]', false),

('Towel Pull-Up', '[
  "Drape two towels over a pull-up bar and grasp one in each hand.",
  "Hang at arm''s length with your arms fully extended.",
  "Pull your chest up toward the bar by driving your elbows down and back.",
  "Pause when your chin is above the bar.",
  "Lower yourself slowly back to the starting position."
]', 'Forearms', '["Back", "Biceps"]', '["Towel", "Pull-up bar"]', '[]', '[]', '["strength", "calisthenics"]', true);

-- HAMSTRINGS
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Romanian Deadlift', '[
  "Stand with feet hip-width apart, holding a barbell in front of your thighs.",
  "Keep your knees slightly bent and your back straight.",
  "Hinge at the hips and lower the barbell down the front of your legs.",
  "Stop when you feel a stretch in your hamstrings.",
  "Drive your hips forward to return to the starting position."
]', 'Hamstrings', '["Glutes", "Lower back"]', '["Barbell"]', '[]', '[]', '["strength"]', true),

('Leg Curl', '[
  "Lie face down on a leg curl machine and position your ankles under the pad.",
  "Grip the handles and keep your hips pressed into the bench.",
  "Curl your legs up toward your glutes by flexing your knees.",
  "Pause at the top, then lower the pad back to the starting position."
]', 'Hamstrings', '[]', '["Leg curl machine"]', '[]', '[]', '["strength"]', false),

('Glute Ham Raise', '[
  "Secure your feet under the pads of a glute ham developer machine.",
  "Start with your body straight and arms crossed over your chest.",
  "Lower your torso toward the ground by bending at the knees.",
  "Pause at the bottom, then contract your hamstrings and glutes to raise your body back up."
]', 'Hamstrings', '["Glutes"]', '["GHD machine"]', '[]', '[]', '["strength"]', true),

('Kettlebell Swing', '[
  "Stand with feet shoulder-width apart, holding a kettlebell with both hands.",
  "Hinge at your hips and swing the kettlebell back between your legs.",
  "Thrust your hips forward to swing the kettlebell up to shoulder height.",
  "Let the kettlebell swing back down and repeat in a fluid motion."
]', 'Hamstrings', '["Glutes", "Back"]', '["Kettlebell"]', '[]', '[]', '["strength", "conditioning"]', true),

('Single-Leg Deadlift', '[
  "Stand on one leg holding a dumbbell in the opposite hand.",
  "Keep your back straight and hinge at the hips, lowering the dumbbell toward the floor.",
  "Extend your free leg straight behind you for balance.",
  "Return to the starting position by driving your hips forward.",
  "Repeat on the other leg."
]', 'Hamstrings', '["Glutes", "Core"]', '["Dumbbell"]', '[]', '[]', '["strength", "balance"]', false);

-- HIPS
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Hip Thrust', '[
  "Sit on the floor with your upper back against a bench and a barbell over your hips.",
  "Plant your feet flat on the floor, shoulder-width apart.",
  "Drive through your heels to lift your hips up until your thighs are parallel to the floor.",
  "Squeeze your glutes at the top, then lower your hips back down."
]', 'Hips', '["Glutes", "Hamstrings"]', '["Bench", "Barbell"]', '[]', '[]', '["strength"]', true),

('Clamshell', '[
  "Lie on your side with your knees bent at 90 degrees and your feet together.",
  "Rest your head on your arm and keep your hips stacked.",
  "Keeping your feet touching, lift your top knee as high as possible without rotating your hips.",
  "Pause, then lower your knee back to the starting position."
]', 'Hips', '["Glutes"]', '[]', '[]', '[]', '["strength", "rehab"]', false),

('Cable Hip Abduction', '[
  "Attach an ankle strap to a low cable pulley and secure it around your ankle.",
  "Stand sideways to the machine and hold onto the frame for balance.",
  "Lift your leg away from your body, keeping it straight.",
  "Pause at the top, then slowly return to the starting position."
]', 'Hips', '["Glutes"]', '["Cable machine"]', '[]', '[]', '["strength"]', false),

('Fire Hydrant', '[
  "Start on all fours with your hands under your shoulders and knees under your hips.",
  "Keeping your knee bent, lift one leg out to the side as high as possible.",
  "Pause at the top, then lower your leg back to the starting position.",
  "Repeat on the other side."
]', 'Hips', '["Glutes"]', '[]', '[]', '[]', '["strength", "calisthenics"]', false),

('Lateral Walk with Band', '[
  "Place a resistance band just above your knees and stand with feet hip-width apart.",
  "Bend your knees slightly and lower into a half squat.",
  "Step to the side with one foot, then bring the other foot to follow.",
  "Continue stepping side to side, keeping tension on the band."
]', 'Hips', '["Glutes"]', '["Resistance band"]', '[]', '[]', '["strength"]', false);


-- NECK
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Neck Flexion', '[
  "Lie on your back on a mat with your knees bent and feet flat on the floor.",
  "Place your hands on your chest or at your sides.",
  "Slowly nod your chin toward your chest, lifting your head slightly off the mat.",
  "Pause at the top, feeling the contraction in your neck muscles.",
  "Lower your head back to the starting position with control."
]', 'Neck', '[]', '[]', '[]', '[]', '["strength", "rehab"]', false),

('Neck Extension', '[
  "Lie face down on a bench or mat with your head hanging off the edge.",
  "Place your hands at your sides or hold onto the bench for support.",
  "Slowly lift your head up by extending your neck, looking upward.",
  "Pause at the top, then lower your head back down with control."
]', 'Neck', '[]', '[]', '[]', '[]', '["strength", "rehab"]', false),

('Neck Lateral Flexion', '[
  "Lie on your side on a mat with your head supported by your lower arm.",
  "Slowly lift your head toward your shoulder, bringing your ear closer to your shoulder.",
  "Pause and feel the contraction on the side of your neck.",
  "Lower your head back to the starting position.",
  "Repeat on the other side."
]', 'Neck', '[]', '[]', '[]', '[]', '["strength", "rehab"]', false),

('Neck Isometric Hold', '[
  "Sit or stand upright with good posture.",
  "Place your hand against your forehead and gently push your head forward against your hand.",
  "Resist the movement with your hand, holding the contraction for several seconds.",
  "Relax and repeat, then perform the same hold in other directions (backward, left, right)."
]', 'Neck', '[]', '[]', '[]', '[]', '["strength", "rehab"]', false),

('Neck Bridge', '[
  "Lie on your back with your knees bent and feet flat on the floor.",
  "Place your hands at your sides for support.",
  "Lift your hips and arch your back, supporting your weight on your feet and the back of your head.",
  "Hold the bridge position for the desired time, then lower your hips back down."
]', 'Neck', '["Traps"]', '[]', '[]', '[]', '["strength"]', true);

-- QUADRICEPS
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Squat', '[
  "Stand with your feet shoulder-width apart and toes slightly turned out.",
  "Brace your core and keep your chest up.",
  "Bend your knees and hips to lower your body as if sitting back into a chair.",
  "Lower down until your thighs are at least parallel to the floor.",
  "Push through your heels to return to the starting position."
]', 'Quadriceps', '["Glutes", "Hamstrings"]', '[]', '[]', '[]', '["strength"]', true),

('Leg Extension', '[
  "Sit on a leg extension machine with your ankles behind the pad.",
  "Grip the handles for support.",
  "Extend your legs by straightening your knees, lifting the pad upward.",
  "Pause at the top, then slowly lower the weight back down."
]', 'Quadriceps', '[]', '["Leg extension machine"]', '[]', '[]', '["strength"]', false),

('Front Squat', '[
  "Stand with your feet shoulder-width apart and a barbell resting on the front of your shoulders.",
  "Cross your arms or use a clean grip to stabilize the bar.",
  "Brace your core and squat down, keeping your chest up and elbows high.",
  "Lower until your thighs are parallel to the floor, then push through your heels to stand.",
  "Return to the starting position."
]', 'Quadriceps', '["Glutes", "Core"]', '["Barbell"]', '[]', '[]', '["strength"]', true),

('Bulgarian Split Squat', '[
  "Stand a few feet in front of a bench with a dumbbell in each hand.",
  "Place one foot behind you on the bench.",
  "Lower your back knee toward the floor, keeping your front knee over your ankle.",
  "Push through your front heel to return to standing.",
  "Repeat all reps on one leg, then switch."
]', 'Quadriceps', '["Glutes"]', '["Bench", "Dumbbells"]', '[]', '[]', '["strength", "balance"]', false),

('Step Up', '[
  "Stand facing a bench or sturdy platform with a dumbbell in each hand.",
  "Step onto the bench with one foot, pressing through your heel to lift your body up.",
  "Bring your trailing leg up to stand fully on the bench.",
  "Step back down with the same leg and repeat.",
  "Alternate legs or complete all reps on one side before switching."
]', 'Quadriceps', '["Glutes", "Hamstrings"]', '["Bench", "Dumbbells"]', '[]', '[]', '["strength", "balance"]', false);

-- SHOULDERS
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Overhead Press', '[
  "Stand with your feet shoulder-width apart, holding a barbell at shoulder level with an overhand grip.",
  "Brace your core and press the barbell overhead until your arms are fully extended.",
  "Pause at the top, then lower the barbell back to shoulder level with control."
]', 'Shoulders', '["Triceps"]', '["Barbell"]', '[]', '[]', '["strength"]', true),

('Lateral Raise', '[
  "Stand with a dumbbell in each hand at your sides, palms facing inward.",
  "With a slight bend in your elbows, raise your arms out to the sides until they are parallel to the floor.",
  "Pause at the top, then slowly lower the dumbbells back to your sides."
]', 'Shoulders', '[]', '["Dumbbells"]', '[]', '[]', '["strength"]', false),

('Front Raise', '[
  "Stand with a dumbbell in each hand, arms at your sides, palms facing your thighs.",
  "Raise one or both arms straight in front of you to shoulder height.",
  "Pause at the top, then lower the dumbbells back down with control."
]', 'Shoulders', '[]', '["Dumbbells"]', '[]', '[]', '["strength"]', false),

('Arnold Press', '[
  "Sit on a bench with back support, holding a dumbbell in each hand at shoulder height, palms facing you.",
  "Press the dumbbells overhead while rotating your palms outward.",
  "At the top, your palms should face forward.",
  "Lower the dumbbells back to the starting position, rotating your palms to face you again."
]', 'Shoulders', '["Triceps"]', '["Dumbbells"]', '[]', '[]', '["strength"]', true),

('Face Pull', '[
  "Attach a rope to a high pulley on a cable machine.",
  "Grab the ends of the rope with both hands, palms facing inward.",
  "Pull the rope toward your face, keeping your elbows high and flaring out to the sides.",
  "Squeeze your rear delts at the end of the movement.",
  "Slowly return to the starting position."
]', 'Shoulders', '["Upper back"]', '["Cable machine"]', '[]', '[]', '["strength"]', false);

-- THIGHS
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Sumo Squat', '[
  "Stand with your feet wider than shoulder-width apart and toes pointed slightly outward.",
  "Brace your core and keep your chest up.",
  "Bend your knees and hips to lower your body down, keeping your knees in line with your toes.",
  "Lower until your thighs are parallel to the floor.",
  "Push through your heels to return to standing."
]', 'Thighs', '["Glutes", "Adductors"]', '[]', '[]', '[]', '["strength"]', true),

('Side Lunge', '[
  "Stand with your feet hip-width apart and hands on your hips or in front of your chest.",
  "Take a big step to the side with one leg, bending your knee and lowering your hips.",
  "Keep your other leg straight and your chest up.",
  "Push off your bent leg to return to the starting position.",
  "Repeat on the other side."
]', 'Thighs', '["Glutes"]', '[]', '[]', '[]', '["strength", "balance"]', false),

('Curtsy Lunge', '[
  "Stand with your feet hip-width apart and hands on your hips.",
  "Step one leg behind and across your body, bending both knees to lower into a lunge.",
  "Keep your chest up and hips facing forward.",
  "Push through your front heel to return to standing.",
  "Repeat on the other side."
]', 'Thighs', '["Glutes"]', '[]', '[]', '[]', '["strength", "balance"]', false),

('Leg Press', '[
  "Sit on a leg press machine and place your feet shoulder-width apart on the platform.",
  "Release the safety handles and lower the platform by bending your knees.",
  "Stop when your knees are at a 90-degree angle.",
  "Press the platform back up by extending your legs, but do not lock your knees."
]', 'Thighs', '["Glutes", "Quadriceps"]', '["Leg press machine"]', '[]', '[]', '["strength"]', true),

('Goblet Squat', '[
  "Stand with your feet shoulder-width apart, holding a dumbbell vertically at your chest.",
  "Brace your core and keep your chest up.",
  "Squat down by bending your knees and hips, keeping the dumbbell close to your chest.",
  "Lower until your thighs are parallel to the floor.",
  "Push through your heels to return to standing."
]', 'Thighs', '["Glutes", "Calves"]', '["Dumbbell"]', '[]', '[]', '["strength"]', true);

-- TRICEPS
INSERT INTO public."Exercises" (name, instructions, primary_muscle, secondary_muscles, equipment_required, photos, videos, type, compound)
VALUES
('Tricep Pushdown', '[
  "Attach a straight or angled bar to a high pulley on a cable machine.",
  "Stand facing the machine and grasp the bar with an overhand grip, hands shoulder-width apart.",
  "Keep your elbows tucked at your sides and your upper arms stationary.",
  "Push the bar down by extending your elbows until your arms are fully straightened.",
  "Pause and squeeze your triceps at the bottom, then slowly return the bar to the starting position."
]', 'Triceps', '[]', '["Cable machine"]', '[]', '[]', '["strength"]', false),

('Overhead Triceps Extension', '[
  "Stand or sit holding a dumbbell with both hands above your head, arms fully extended.",
  "Keep your elbows close to your ears and your core engaged.",
  "Lower the dumbbell behind your head by bending your elbows.",
  "Pause when you feel a stretch in your triceps, then extend your arms to return to the starting position."
]', 'Triceps', '[]', '["Dumbbell"]', '[]', '[]', '["strength"]', false),

('Bench Dip', '[
  "Sit on the edge of a bench with your hands gripping the edge beside your hips.",
  "Place your feet flat on the floor and slide your hips off the bench.",
  "Lower your body by bending your elbows until your upper arms are parallel to the floor.",
  "Push through your palms to straighten your arms and lift your body back up."
]', 'Triceps', '["Shoulders", "Chest"]', '["Bench"]', '[]', '[]', '["strength", "calisthenics"]', true),

('Close-Grip Bench Press', '[
  "Lie flat on a bench holding a barbell with a narrow, overhand grip (hands about shoulder-width apart).",
  "Unrack the bar and hold it above your chest with arms extended.",
  "Lower the bar slowly to your mid-chest, keeping your elbows close to your body.",
  "Press the bar back up to the starting position, fully extending your arms."
]', 'Triceps', '["Chest", "Shoulders"]', '["Barbell", "Bench"]', '[]', '[]', '["strength"]', true),

('Diamond Push-Up', '[
  "Start in a high plank position with your hands close together under your chest, forming a diamond shape with your thumbs and index fingers.",
  "Keep your body in a straight line from head to heels.",
  "Lower your chest toward your hands by bending your elbows.",
  "Pause when your chest is just above your hands.",
  "Push through your palms to return to the starting position."
]', 'Triceps', '["Chest", "Shoulders"]', '[]', '[]', '[]', '["strength", "calisthenics"]', true);


-- =========================
-- TRAINING SPLITS DATA
-- =========================

INSERT INTO "TrainingSplits" (title, duration, days_per_week, sessions, level, workouts, description)
VALUES
-- PUSH, PULL, LEGS
(
    'PUSH, PULL, LEGS',
    '45'' - 60''',
    '3/6',
    3,
    '["Beginner", "Intermediate", "Advanced"]',
    '[
        {
            "name": "Push",
            "main_muscles": ["chest", "shoulders", "triceps"],
            "optional_muscles": []
        },
        {
            "name": "Pull",
            "main_muscles": ["back", "biceps"],
            "optional_muscles": ["trapezius"]
        },
        {
            "name": "Legs",
            "main_muscles": ["quads", "hamstrings", "calves", "abs"],
            "optional_muscles": ["glutes", "adductors", "abductors"]
        }
    ]',
    'This structure allows you to focus on one movement pattern per day, maximizing the stimulus. It increases the intensity and volume per session for each muscle group, making it ideal for hypertrophy.'
),

-- UPPER / LOWER
(
    'UPPER / LOWER',
    '45'' - 60''',
    '4',
    4,
    '["Beginner", "Intermediate", "Advanced"]',
    '[
        {
            "name": "Upper",
            "main_muscles": ["chest", "back", "shoulders", "biceps", "triceps"],
            "optional_muscles": ["forearms"]
        },
        {
            "name": "Lower",
            "main_muscles": ["quads", "hamstrings", "calves", "glutes"],
            "optional_muscles": ["abs", "adductors", "abductors"]
        },
        {
            "name": "Upper",
            "main_muscles": ["chest", "back", "shoulders", "biceps", "triceps"],
            "optional_muscles": ["forearms"]
        },
        {
            "name": "Lower",
            "main_muscles": ["quads", "hamstrings", "calves", "glutes"],
            "optional_muscles": ["abs", "adductors", "abductors"]
        }
    ]',
    'A classic split that alternates upper and lower body sessions, allowing for higher frequency and recovery for each muscle group.'
),

-- FULL BODY
(
    'FULL BODY',
    '40'' - 60''',
    '3',
    3,
    '["Beginner", "Intermediate"]',
    '[
        {
            "name": "Full Body",
            "main_muscles": ["chest", "back", "shoulders", "legs", "arms"],
            "optional_muscles": ["abs"]
        },
        {
            "name": "Full Body",
            "main_muscles": ["chest", "back", "shoulders", "legs", "arms"],
            "optional_muscles": ["abs"]
        },
        {
            "name": "Full Body",
            "main_muscles": ["chest", "back", "shoulders", "legs", "arms"],
            "optional_muscles": ["abs"]
        }
    ]',
    'A simple and effective approach for beginners and intermediates, hitting all major muscle groups each session.'
);