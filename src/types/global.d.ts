// src/types/global.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
      openBuildingList: (month: string) => void;
    };
  }
}
