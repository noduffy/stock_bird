// src/pages/GraphPage.tsx (全コード・PDF保存のみ)

import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

// React-Router / Electron
import { PropertyData } from "../types/property";

// 1. ロジック (カスタムフック)
import { useChartData, Simulation } from "../hooks/useChartData";
import { useSavePDF } from "../hooks/useSavePDF"; // ★ 1. リネームしたフックをインポート

// 2. プレゼンテーション (子コンポーネント)
import SimulationHistory from "../pages/SimulationHistory";
import { DateFilterControls } from "../components/graph/DateFilterControls";
import { AddBuildingModal } from "../components/graph/AddBuildingModal";
import {
    SellBuildingModal,
    SellFormData,
} from "../components/graph/SellBuildingModal";
import { DepreciationChart } from "../components/graph/DepreciationChart";
import { SavePDFControl } from "../components/graph/SavePDFControl"; // ★ 2. リネームしたコンポーネントをインポート

// 共通スタイル
const buttonClass =
    "py-2 px-5 bg-gray-200 border-none rounded-md cursor-pointer text-sm hover:bg-gray-300 transition-colors";

const GraphPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const originalData = location.state?.parsedData as PropertyData[];

    // --- 状態管理 (State) ---
    const [simulations, setSimulations] = useState<Simulation[]>([]);
    const [threshold, setThreshold] = useState(0);

    // モーダルの表示状態
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);

    // 編集中のシミュレーション (ID)
    const [editSimId, setEditSimId] = useState<string | null>(null);

    // --- データ計算 (Hook) ---
    const {
        data, // 結合済み (original + virtual)
        soldBuildings,
        chartData,
        minMonth,
        maxMonth,
        xTicks,
        highlightedRanges,
    } = useChartData(originalData, simulations, threshold);

    // ★ 3. PDF保存フックを呼び出し (onPrint はもう無い)
    const { isLoading: isSavingPDF, onSavePDF } = useSavePDF();

    // --- フィルタリング (State & Memo) ---
    const [startMonth, setStartMonth] = useState(minMonth);
    const [endMonth, setEndMonth] = useState(maxMonth);

    // グラフ期間が変更されたら、日付フィルタの state も更新
    useEffect(() => {
        setStartMonth(minMonth);
        setEndMonth(maxMonth);
    }, [minMonth, maxMonth]);

    // グラフに表示するデータ (日付フィルタ適用後)
    const filterdData = useMemo(() => {
        return chartData.filter((item) => {
            return (
                dayjs(item.month).isSameOrAfter(dayjs(startMonth)) &&
                dayjs(item.month).isSameOrBefore(dayjs(endMonth))
            );
        });
    }, [chartData, startMonth, endMonth]);

    // --- データがない場合の早期リターン ---
    if (!originalData || originalData.length === 0) {
        return (
            <div className="text-center p-10">
                <h2 className="text-xl font-semibold mb-4">
                    データがありません
                </h2>
                <button
                    onClick={() => navigate("/")}
                    className="bg-gray-200 py-2 px-6 rounded-lg hover:bg-gray-300"
                >
                    戻る
                </button>
            </div>
        );
    }

    // --- イベントハンドラ (Business Logic) ---

    // ビル(仮想)の追加 / 編集
    const handleSaveBuilding = (formData: PropertyData) => {
        if (editSimId) {
            // 編集
            setSimulations(
                simulations.map((sim) =>
                    sim.id === editSimId ? { ...sim, data: formData } : sim
                )
            );
            setEditSimId(null);
        } else {
            // 新規追加
            const newAddEvent: Simulation = {
                id: crypto.randomUUID(),
                type: "add",
                data: formData,
            };
            setSimulations([...simulations, newAddEvent]);
        }
        setShowAddModal(false);
    };

    // ビルの売却
    const handleSellBuilding = (sellData: SellFormData) => {
        const newSellEvent: Simulation = {
            id: crypto.randomUUID(),
            type: "sell",
            buildingName: sellData.name,
            date: sellData.date,
        };
        setSimulations([...simulations, newSellEvent]);
        setShowSellModal(false);
    };

    // 履歴から編集
    const handleEdit = (simToEdit: Simulation) => {
        if (simToEdit.type === "add") {
            setEditSimId(simToEdit.id); // 編集IDをセット
            setShowAddModal(true); // モーダルを開く
            setShowSellModal(false);
        }
    };

    // 履歴から削除
    const handleDelete = (idToDelete: string) => {
        setSimulations(simulations.filter((s) => s.id !== idToDelete));
    };

    // グラフクリック (ポップアップ)
    const handleChartClick = (month: string) => {
        const currentMonth = dayjs(month);
        // `data` (オリジナル+仮想) を元にフィルタリング
        const visibleData = data.filter((b) => {
            if (currentMonth.isBefore(dayjs(b.契約日), "month")) return false;
            const sold = soldBuildings.find((s) => s.ビル名 === b.ビル名);
            if (
                sold &&
                currentMonth.isSameOrAfter(dayjs(sold.売却日), "month")
            ) {
                return false;
            }
            return true;
        });
        localStorage.setItem("propertyData", JSON.stringify(visibleData));

        window.electronAPI.openBuildingList(month);
    };

    // --- レンダリング (View) ---

    // 編集モーダルに渡す初期データ
    const simulationToEdit = simulations.find(
        (sim) => sim.id === editSimId && sim.type === "add"
    ) as (Simulation & { type: "add" }) | undefined;

    // 売却モーダルに渡すビルリスト (オリジナルのみ)
    const availableBuildings = originalData.filter(
        (b) => !soldBuildings.some((s) => s.ビル名 === b.ビル名)
    );

    return (
        // 印刷時に余白を削除
        <div className="w-full max-w-[90vw] mx-auto print:max-w-none print:mx-0 print:p-0">
            {/* 1. コントロールボタン (印刷時に非表示) */}
            <div className="flex flex-wrap gap-4 justify-center mb-5 print:hidden">
                {/* 仮想ビル追加 */}
                <div className="bg-white border border-gray-300 p-3 rounded-lg shadow-sm flex flex-col gap-1.5">
                    <button
                        className={buttonClass}
                        onClick={() => {
                            setEditSimId(null);
                            setShowAddModal(true);
                            setShowSellModal(false);
                        }}
                        disabled={isSavingPDF} // ★ isSavingPDF に変更
                    >
                        仮想ビルを追加
                    </button>
                </div>
                {/* ビル売却 */}
                <div className="bg-white border border-gray-300 p-3 rounded-lg shadow-sm flex flex-col gap-1.5">
                    <button
                        className={buttonClass}
                        onClick={() => {
                            setShowSellModal(true);
                            setShowAddModal(false);
                            setEditSimId(null);
                        }}
                        disabled={isSavingPDF} // ★ isSavingPDF に変更
                    >
                        ビルを売却
                    </button>
                </div>

                {/* ★ 4. PDF保存コントロールに変更 */}
                <SavePDFControl
                    isLoading={isSavingPDF}
                    onSavePDF={onSavePDF}
                />
            </div>

            {/* 2. 日付・閾値コントロール (divごと印刷時に非表示) */}
            <div className="print:hidden">
                <DateFilterControls
                    startMonth={startMonth}
                    endMonth={endMonth}
                    minMonth={minMonth}
                    maxMonth={maxMonth}
                    threshold={threshold}
                    onStartMonthChange={setStartMonth}
                    onEndMonthChange={setEndMonth}
                    onThresholdChange={setThreshold}
                />
            </div>

            {/* 3. グラフ本体 (印刷時に影と境界線を消す) */}
            <div className="print:shadow-none print:border-none">
                <DepreciationChart
                    data={filterdData}
                    xTicks={xTicks}
                    highlightedRanges={highlightedRanges}
                    onChartClick={handleChartClick}
                />
            </div>

            {/* 4. シミュレーション履歴 (印刷時に非表示) */}
            <div className="print:hidden">
                <SimulationHistory
                    simulations={simulations}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* 5. 戻るボタン (印刷時に非表示) */}
            <div className="text-center mt-3 mb-10 print:hidden">
                <button
                    className={buttonClass}
                    onClick={() => navigate("/")}
                    disabled={isSavingPDF} // ★ isSavingPDF に変更
                >
                    戻る
                </button>
            </div>

            {/* 6. モーダル (divごと印刷時に非表示) */}
            <div className="print:hidden">
                <AddBuildingModal
                    isOpen={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditSimId(null);
                    }}
                    onSave={handleSaveBuilding}
                    initialData={simulationToEdit ? simulationToEdit.data : null}
                />

                <SellBuildingModal
                    isOpen={showSellModal}
                    onClose={() => setShowSellModal(false)}
                    onSell={handleSellBuilding}
                    availableBuildings={availableBuildings}
                />
            </div>
        </div>
    );
};

export default GraphPage;