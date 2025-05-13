import React from "react";

// Importa todos los SVGs que usarás
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

// Mapea los nombres a los componentes SVG
const muscleMap = {
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
  // Normaliza el nombre para que coincida con las keys del objeto
  const key =
    muscle.charAt(0).toUpperCase() + muscle.slice(1).toLowerCase();

  const MuscleSvg = muscleMap[key];

  if (!MuscleSvg) {
    // Puedes mostrar un icono por defecto si no existe
    return null;
  }

  return <MuscleSvg width={size} height={size} {...props} />;
}
