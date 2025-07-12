export interface AutoRemovalConfig {
  enableAutoRemoval: boolean;
  removeAfterHours: number; // default: 1
  adminCanOverride: boolean; // default: true
  checkIntervalMinutes: number; // default: 5
}

const autoRemovalConfig: AutoRemovalConfig = {
  enableAutoRemoval: true,
  removeAfterHours: 1,
  adminCanOverride: true,
  checkIntervalMinutes: 5,
};

export function getAutoRemovalConfig(): AutoRemovalConfig {
  return autoRemovalConfig;
} 