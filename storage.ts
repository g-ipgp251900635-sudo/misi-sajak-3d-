import { GameProgress } from '../types/game';

const STORAGE_KEY = 'misi_sajak_3d_progress_v1';

export const DEFAULT_PROGRESS: GameProgress = {
  profile: null,
  coins: 0,
  points: 0,
  talkedNpcs: [],
  collectedBooks: [],
  completedFragments: [],
  watchedDengarkanVideo: false,
  completedDengarkanSajak: false,
  dengarkanSajakScore: 0,
  completedIrama: false,
  iramaScore: 0,
  completedGunung: false,
  gunungScore: 0,
  collectedGems: [],
  unlockedBadges: [],
  victoryDismissed: false,
};

export function loadProgress(): GameProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<GameProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      talkedNpcs: Array.isArray(parsed.talkedNpcs) ? parsed.talkedNpcs : [],
      collectedBooks: Array.isArray(parsed.collectedBooks) ? parsed.collectedBooks : [],
      completedFragments: Array.isArray(parsed.completedFragments) ? parsed.completedFragments : [],
      collectedGems: Array.isArray(parsed.collectedGems) ? parsed.collectedGems : [],
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: GameProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota or private mode failures
  }
}

export function clearProgress(): GameProgress {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  return { ...DEFAULT_PROGRESS };
}
