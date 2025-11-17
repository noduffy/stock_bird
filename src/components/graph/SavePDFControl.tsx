// src/components/graph/SavePDFControl.tsx

import React from "react";

// 共通スタイル
const buttonClass =
    "py-2 px-5 bg-gray-200 border-none rounded-md cursor-pointer text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

type Props = {
    isLoading: boolean;
    onSavePDF: () => void;
    // onPrint を削除
};

export const SavePDFControl: React.FC<Props> = ({
    isLoading,
    onSavePDF,
}) => {
    return (
        // 印刷時にこのコントロールパネル自体を非表示にする
        <div className="bg-white border border-gray-300 p-3 rounded-lg shadow-sm flex flex-col gap-2 print:hidden">
            <button
                className={`${buttonClass} bg-blue-500 text-black hover:bg-blue-600`}
                onClick={onSavePDF}
                disabled={isLoading}
            >
                {isLoading ? "処理中..." : "PDFに保存"}
            </button>
            {/* 「印刷する」ボタンを削除 */}
        </div>
    );
};