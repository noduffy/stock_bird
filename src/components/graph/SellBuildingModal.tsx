// src/components/graph/SellBuildingModal.tsx (UI改善版)

import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { PropertyData } from "../../types/property";

// 共通スタイル
const modalButtonClass = "py-1.5 px-4 rounded-md cursor-pointer transition-colors";
const modalConfirmButtonClass = `${modalButtonClass} bg-blue-500 text-white hover:bg-blue-600`;
const modalCancelButtonClass = `${modalButtonClass} bg-gray-200 text-gray-800 hover:bg-gray-300`;

export type SellFormData = {
    name: string;
    date: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSell: (data: SellFormData) => void;
    availableBuildings: PropertyData[];
};

export const SellBuildingModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSell,
    availableBuildings,
}) => {
    // --- ロジック (変更なし) ---
    const [sellForm, setSellForm] = useState<SellFormData>({
        name: "",
        date: dayjs().format("YYYY-MM-DD"),
    });

    const minDate = useMemo(() => {
        if (!sellForm.name) return undefined;
        const selectedBuilding = availableBuildings.find(
            (b) => b.ビル名 === sellForm.name
        );
        return selectedBuilding
            ? dayjs(selectedBuilding.契約日).format("YYYY-MM-DD")
            : undefined;
    }, [sellForm.name, availableBuildings]);

    useEffect(() => {
        if (minDate && dayjs(sellForm.date).isBefore(dayjs(minDate))) {
            setSellForm((prev) => ({ ...prev, date: minDate }));
        }
    }, [minDate, sellForm.date]);

    const handleBuildingChange = (buildingName: string) => {
        setSellForm((prev) => ({ ...prev, name: buildingName }));
    };

    useEffect(() => {
        if (isOpen) {
            setSellForm({ name: "", date: dayjs().format("YYYY-MM-DD") });
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (sellForm.name && sellForm.date) {
            onSell(sellForm);
        } else {
            alert("売却するビルと売却日を選択してください。");
        }
    };
    // --- ロジック (ここまで) ---

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[1000]">
            <div className="bg-white p-6 py-8 rounded-lg w-96 shadow-xl max-h-[80vh] overflow-y-auto">
                <h3 className="mt-0 mb-4 text-xl font-semibold">ビルを売却</h3>

                <div className="mb-4">
                    <label className="text-sm">売却日：</label>
                    <input
                        type="date"
                        value={sellForm.date}
                        min={minDate}
                        disabled={!sellForm.name}
                        onChange={(e) =>
                            setSellForm({ ...sellForm, date: e.target.value })
                        }
                        className="ml-2 border-gray-300 rounded-md p-1 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                </div>

                {/* ▼▼▼ UI改善 ▼▼▼ */}
                {/* 1. リスト全体に枠線と縦のスクロールを追加 */}
                <ul className="list-none p-0 m-0 mb-5 border border-gray-200 rounded-lg max-h-60 overflow-y-auto divide-y divide-gray-200">
                    {availableBuildings.length > 0 ? (
                        availableBuildings.map((b) => (
                            // 2. li 自体をラベルとして機能させる
                            <li key={b.ビル名}>
                                <label className="flex items-center cursor-pointer p-3 hover:bg-gray-50 w-full">
                                    <input
                                        type="radio"
                                        name="sell"
                                        value={b.ビル名}
                                        checked={sellForm.name === b.ビル名}
                                        onChange={() => handleBuildingChange(b.ビル名)}
                                        className="mr-3"
                                    />
                                    {/* 3. flex-grow でビル名を左に、契約日を右に配置 */}
                                    <div className="flex justify-between w-full">
                                        <span className="text-sm font-medium text-gray-900">
                                            {b.ビル名}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            (契約: {dayjs(b.契約日).format("YYYY-MM-DD")})
                                        </span>
                                    </div>
                                </label>
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-gray-500">
                            売却可能なビルがありません。
                        </li>
                    )}
                </ul>
                {/* ▲▲▲ UI改善 ▲▲▲ */}

                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={!sellForm.name || availableBuildings.length === 0}
                        className={`${modalConfirmButtonClass} disabled:bg-gray-400`}
                    >
                        売却する
                    </button>
                    <button onClick={onClose} className={modalCancelButtonClass}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};