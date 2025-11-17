// src/types/global.d.ts (全コード)

import { IpcRenderer } from "electron";
import { PropertyData } from "./property";

declare global {
    interface Window {
        electronAPI: {
            openBuildingList: (month: string) => void;

            // handlePrint の行を削除
            handleSavePDF: () => Promise<void>;
        };
    }
}