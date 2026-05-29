export interface EdgeVoice {
  id: string;
  label: string;
  gender: "feminina" | "masculino";
}

export const EDGE_TTS_VOICES: EdgeVoice[] = [
  { id: "pt-BR-FranciscaNeural", label: "Francisca", gender: "feminina" },
  { id: "pt-BR-AntonioNeural", label: "Antonio", gender: "masculino" },
  { id: "pt-BR-ThalitaNeural", label: "Thalita", gender: "feminina" },
];

export const DEFAULT_VOICE_ID = "pt-BR-FranciscaNeural";
