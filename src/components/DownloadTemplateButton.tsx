// src/components/DownloadTemplateButton.tsx (ロジック維持 + UI修正)

import React from "react";

// ★ export default は元のロジック のまま
const DownloadTemplateButton: React.FC = () => {
    
    // ▼▼▼ あなたが提示した、正しいCSV生成ロジック ▼▼▼
    const handleDownload = () => {
        const header = [
            "ビル名,契約日,減価償却,法定耐用年数,元金,ローンの期限,元金の支払いタイプ",
        ];
        const rows = [
            "サンプルビルA,2022-04-01,15000000,30,38000000,2042-04-01,元利均等",
            "サンプルビルB,2021-06-15,12000000,28,25000000,2041-06-15,元金均等",
        ];

        const csvContent = [header, ...rows].join("\n");
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]); // UTF-8 BOM

        const blob = new Blob([bom, csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "template.csv";
        a.click();
        URL.revokeObjectURL(url);
    };
    // ▲▲▲ 正しいロジックここまで ▲▲▲

    return (
        // ★ <></> を削除
        // ★ 元の <label> タグ を使い、className を変更
        <label
            className="block w-full px-6 py-3 bg-transparent text-blue-500 text-lg font-semibold border-2 border-blue-500 rounded-lg cursor-pointer transition-all hover:bg-blue-50"
            onClick={handleDownload}
        >
            テンプレートCSVをダウンロード
        </label>
    );
};

export default DownloadTemplateButton; // ★ export default のまま