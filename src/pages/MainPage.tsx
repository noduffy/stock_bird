// src/pages/MainPage.tsx (ロジック修正 + UI修正)

import React from "react";
import { useNavigate } from "react-router-dom";
// ★ PapaParse はCSV専用なので、今回のロジックでは不要
// import Papa from "papaparse"; 
import * as XLSX from "xlsx";
import dayjs from "dayjs";
// import { PropertyData } from "../types/property";
// ★ export default に合わせてインポート名を元に戻す
import UploadButton from "../components/UploadButton";
import DownloadTemplateButton from "../components/DownloadTemplateButton";

const MainPage = () => {
    const navigate = useNavigate();

    // ▼▼▼ あなたが提示した、日付が正しく処理されるロジック ▼▼▼
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, {
                type: "array",
                codepage: 65001,
                cellDates: true, // ★ これが日付を正しく読むための鍵です
            });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            console.log("読み込んだデータ:", jsonData);
            const cleanedData = jsonData.map((item: any) => ({
                ビル名: item["ビル名"],
                契約日: dayjs(item["契約日"]).format("YYYY-MM-DD"),
                減価償却: item["減価償却"],
                法定耐用年数: item["法定耐用年数"],
                元金: item["元金"],
                ローンの期限: dayjs(item["ローンの期限"]).format("YYYY-MM-DD"),
                元金の支払いタイプ: item["元金の支払いタイプ"],
            }));

            navigate("/graph", { state: { parsedData: cleanedData } });
        };

        reader.readAsArrayBuffer(file);
    };
    // ▲▲▲ 正しいロジックここまで ▲▲▲

    // ▼▼▼ 以前に作成した「完璧なUI」 ▼▼▼
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                <img
                    src="/icon.png"
                    alt="Stock Bird Logo"
                    className="w-24 h-24 mx-auto mb-4"
                />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Stock Bird
                </h1>
                <p className="text-gray-500 mb-8">
                    元金と減価償却のシミュレーター
                </p>
                <div className="flex flex-col gap-4">
                    {/* ★ 呼び出し方は元のロジック(onFileChange) のまま */}
                    <UploadButton onFileChange={handleFileChange} />
                    <DownloadTemplateButton />
                </div>
            </div>
        </div>
    );
};

export default MainPage;