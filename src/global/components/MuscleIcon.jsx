import React from "react";

// Import all muscle SVG components
import Abs from "../../../assets/muscles/Abs.svg";
import Back from "../../../assets/muscles/Back.svg";
import Biceps from "../../../assets/muscles/Biceps.svg";
import Calves from "../../../assets/muscles/Calves.svg";
import Cardio from "../../../assets/muscles/Cardio.svg";
import Chest from "../../../assets/muscles/Chest.svg";
import Forearms from "../../../assets/muscles/Forearms.svg";
import Hamstrings from "../../../assets/muscles/Hamstrings.svg";
import Hips from "../../../assets/muscles/Hips.svg";
import Neck from "../../../assets/muscles/Neck.svg";
import Quadriceps from "../../../assets/muscles/Quadriceps.svg";
import Shoulders from "../../../assets/muscles/Shoulders.svg";
import Thighs from "../../../assets/muscles/Thighs.svg";
import Triceps from "../../../assets/muscles/Triceps.svg";

// Mapping of alternative muscle names to their canonical names
// This allows different naming variations to point to the same muscle SVG
const muscleAliases = {
	// Quadriceps variations
	Quads: "Quadriceps",
	Quad: "Quadriceps",
	// Glutes/Hips variations
	Glutes: "Hips",
	Glute: "Hips",
	// Abs variations
	Abdominals: "Abs",
	Abdominal: "Abs",
	// Chest variations
	Pecs: "Chest",
	Pec: "Chest",
	// Shoulders variations
	Delts: "Shoulders",
	Delt: "Shoulders",
	// Back variations
	Traps: "Back",
	Trap: "Back",
	Lats: "Back",
	Lat: "Back",
	// Arms variations
	Bicep: "Biceps",
	Tricep: "Triceps",
	// Legs variations
	Calf: "Calves",
	Hamstring: "Hamstrings",
	Thigh: "Thighs",
};

// Mapping of canonical muscle names to their SVG components
const muscleComponents = {
	Abs,
	Back,
	Biceps,
	Calves,
	Cardio,
	Chest,
	Forearms,
	Hamstrings,
	Hips,
	Neck,
	Quadriceps,
	Shoulders,
	Thighs,
	Triceps,
};