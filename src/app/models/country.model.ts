export interface Country {
  id: number;
  name: string;
  capital: string;
  flag: string;
  funFact: string;
  latitude: number;
  longitude: number;
}

export interface WeatherResult {
  temperature: number;
  weathercode: number;
  windspeed: number;
  description: string;
}

export type AnimationPhase = 'idle' | 'throwing' | 'landed' | 'modal';
