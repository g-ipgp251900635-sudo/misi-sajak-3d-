export type AreaId = 'kampung' | 'hutan' | 'tasik' | 'gunung';

export interface PlayerProfile {
  name: string;
  kelas: string;
}

export interface BookItem {
  id: string;
  title: string;
  subtitle: string;
  area: AreaId;
  x: number;
  z: number;
  summaryPoints: string[];
  checkQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface FragmentItem {
  id: string;
  title: string;
  rangkapNumber: number;
  stanzaLines: string[];
  area: AreaId;
  x: number;
  z: number;
  focusConcept: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface IramaQuestion {
  id: string;
  concept: string;
  excerpt: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GunungQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DengarkanQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  color: string;
  iconName: 'book' | 'trees' | 'waves' | 'mountain' | 'gem' | 'crown' | 'headphones';
}

export interface NpcDialogueData {
  id: string;
  name: string;
  role: string;
  area: AreaId;
  greeting: string;
  lines: string[];
  actionLabel: string;
}

export interface InteractableTarget {
  type: 'npc' | 'book' | 'fragment' | 'irama' | 'gunung' | 'dengarkan_sajak';
  id: string;
  label: string;
  area: AreaId;
  distance: number;
}

export interface MinimapMarker {
  id: string;
  type: 'npc' | 'book' | 'fragment' | 'gem' | 'station';
  x: number;
  z: number;
  completed?: boolean;
  label: string;
}

export interface PlayerTelemetry {
  x: number;
  y: number;
  z: number;
  yaw: number;
  currentArea: AreaId;
}

export interface GameProgress {
  profile: PlayerProfile | null;
  coins: number;
  points: number;
  talkedNpcs: string[];
  collectedBooks: string[];
  completedFragments: string[];
  watchedDengarkanVideo: boolean;
  completedDengarkanSajak: boolean;
  dengarkanSajakScore: number;
  completedIrama: boolean;
  iramaScore: number;
  completedGunung: boolean;
  gunungScore: number;
  collectedGems: string[];
  unlockedBadges: string[];
  victoryDismissed: boolean;
}

export interface ToastNotification {
  id: string;
  title: string;
  subtitle: string;
  tone: 'success' | 'badge' | 'info';
}
