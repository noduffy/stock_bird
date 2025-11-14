// src/pages/BuildingList.tsx (インデント4スペース、タイポ修正)

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { PropertyData } from "../types/property";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const BuildingList = () => {
    // ▼▼▼ "1_" を "1" に修正 ▼▼▼
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const day = params.get("month"); // 例: "2025-06"
    const year = day?.slice(0, 4);
    const month = day ? parseInt(day.slice(5), 10) : null;

    const raw = localStorage.getItem("propertyData");
    const data: PropertyData[] = raw ? JSON.parse(raw) : [];

    const targetMonth = dayjs(`${day}-01`).startOf("month");

    // その月に支払いが発生するビルのみをフィルタリング
    const filtered = data
        .map((b) => {
            const contract = dayjs(b.契約日).startOf("month");
            const loanEnd = dayjs(b.ローンの期限).startOf("month");
            const depreciationEnd = contract
                .add(Number(b.法定耐用年数), "year")
                .subtract(1, "month")
                .startOf("month");

            const hasLoanPayment =
                targetMonth.isSameOrAfter(contract, "month") &&
                targetMonth.isSameOrBefore(loanEnd, "month");

            const hasDepreciation =
                targetMonth.isSameOrAfter(contract, "month") &&
                targetMonth.isSameOrBefore(depreciationEnd, "month");

            if (!hasLoanPayment && !hasDepreciation) return null;

            return {
                ...b,
                今月元金: hasLoanPayment ? b.元金 : 0,
                今月減価償却: hasDepreciation ? b.減価償却 : 0,
            };
        })
        .filter((b): b is NonNullable<typeof b> => b !== null);
    // ▲▲▲ ロジックここまで ▲▲▲

    // 表示するヘッダー (元コードの定義に合わせる)
    const headers = ["ビル名", "契約日", "元金", "減価償却"];

    return (
        // ★ 全体をグレーの背景にし、余白を追加
        <div className="bg-gray-100 min-h-screen p-4 md:p-6">
            {/* ★ タイトル */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {year}年{month}月のビル一覧
            </h1>

            {/* ★ テーブルコンテナ (角丸、影、横スクロール対応) */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="w-full table-auto">
                    {/* ★ テーブルヘッダー (背景色、大文字化、余白) */}
                    <thead className="bg-gray-200">
                        <tr>
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="px-4 py-3 text-left font-semibold text-gray-700 uppercase"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* ★ テーブルボディ (ホバー効果、境界線) */}
                    <tbody className="divide-y divide-gray-200">
                        {filtered.map((b, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                {/* ビル名 (★ 余白、改行禁止) */}
                                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                                    {b.ビル名}
                                </td>
                                {/* 契約日 (★ YYYY-MM形式、改行禁止) */}
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                    {dayjs(b.契約日).format("YYYY-MM")}
                                </td>
                                {/* 今月元金 (★ 右揃え、改行禁止、円マーク) */}
                                <td className="px-4 py-3 text-gray-600 text-right whitespace-nowrap">
                                    ¥{b.今月元金.toLocaleString()}
                                </td>
                                {/* 今月減価償却 (★ 右揃え、改行禁止、円マーク) */}
                                <td className="px-4 py-3 text-gray-600 text-right whitespace-nowrap">
                                    ¥{b.今月減価償却.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ★ データが無い場合の表示 */}
                {filtered.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        表示するビルがありません。
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuildingList;