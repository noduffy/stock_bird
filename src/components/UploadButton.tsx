// src/components/UploadButton.tsx (UIのみ修正)

import React from "react";

type UploadButtonProps = {
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

// ★ export default と props (onFileChange) は元のロジック のまま
const UploadButton: React.FC<UploadButtonProps> = ({ onFileChange }) => {
    return (
        // ★ <></> を <div> に変更 (スタイリングのため)
        <div>
            {/* ★ labelにTailwindクラスを適用 */}
            <label
                className="block w-full px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-md cursor-pointer transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                htmlFor="excelInput"
            >
                CSVファイルをアップロード
            </label>
            {/* ★ inputのロジック(onChange) は元のまま、UI(style) をclassNameに変更 */}
            <input
                type="file"
                id="excelInput"
                accept=".csv,.xlsx,.xls"
                onChange={onFileChange} // ★ ロジックは変更しない
                className="hidden" // ★ style={{ display: "none" }} をTailwindに変更
            />
        </div>
    );
};

export default UploadButton; // ★ export default のまま