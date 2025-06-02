import React from "react";

// All muscle SVG components
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

// Aliases for alternative muscle names
const muscleAliases = {
  Quads: "Quadriceps",
  Quad: "Quadriceps",
  Glutes: "Hips",
  Glute: "Hips",
  Abdominals: "Abs",
  Abdominal: "Abs",
  Pecs: "Chest",
  Pec: "Chest",
  Delts: "Shoulders",
  Delt: "Shoulders",
  Traps: "Back",
  Trap: "Back",
  Lats: "Back",
  Lat: "Back",
  Bicep: "Biceps",
  Tricep: "Triceps",
  Calf: "Calves",
  Hamstring: "Hamstrings",
  Thigh: "Thighs",
};

// Canonical muscle name to component map
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

export default function MuscleIcon({ muscle, size = 40, ...props }) {
  if (!muscle) return null;

  // Capitalize first letter to match keys
  const normalized =
    muscle.charAt(0).toUpperCase() + muscle.slice(1).toLowerCase();

  const canonicalName = muscleAliases[normalized] || normalized;
  const MuscleSvg = muscleComponents[canonicalName];

  if (!MuscleSvg) return null;

  return <MuscleSvg width={size} height={size} {...props} />;
}
