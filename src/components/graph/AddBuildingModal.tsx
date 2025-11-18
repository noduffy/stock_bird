// src/components/graph/AddBuildingModal.tsx (全コード・型エラー修正)

import React, { useState, useEffect } from "react";
import { PropertyData } from "../../types/property";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";

// 共通スタイル
const modalButtonClass =
    "py-1.5 px-4 rounded-md cursor-pointer transition-colors";
const modalConfirmButtonClass = `${modalButtonClass} bg-blue-500 text-white hover:bg-blue-600`;
const modalCancelButtonClass = `${modalButtonClass} bg-gray-200 text-gray-800 hover:bg-gray-300`;
const modalInputClass =
    "py-1.5 px-2.5 text-sm rounded-md border border-gray-300 w-full";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: PropertyData) => void;
    initialData: PropertyData | null;
};

const emptyForm: PropertyData = {
    ビル名: "",
    契約日: "",
    減価償却: 0,
    法定耐用年数: 0,
    元金: 0,
    ローンの期限: "",
    元金の支払いタイプ: "毎月",
};

export const AddBuildingModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const [form, setForm] = useState<PropertyData>(emptyForm);

    useEffect(() => {
        if (isOpen) {
            setForm(initialData || emptyForm);
        } else {
            setForm(emptyForm);
        }
    }, [isOpen, initialData]);

    const handleChange = (key: string, value: string | number) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // ▼▼▼ 修正点 ▼▼▼
    // 文字列(YYYY-MM-DD)をDateオブジェクトに変換 (nullではなくundefinedを返す)
    const toDate = (dateStr: string) => {
        return dateStr ? dayjs(dateStr).toDate() : undefined; // ★ null を undefined に変更
    };
    // ▲▲▲ 修正点 ▲▲▲

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[1000]">
            <div className="bg-white p-6 py-8 rounded-lg w-96 shadow-xl max-h-[80vh] overflow-y-auto">
                <h3 className="mt-0 mb-4 text-xl font-semibold">
                    {initialData ? "仮想ビルを編集" : "仮想ビルを追加"}
                </h3>

                {/* --- ビル名 --- */}
                <div className="mb-3 flex flex-col">
                    <label className="mb-1 font-medium text-sm">ビル名：</label>
                    <input
                        type="text"
                        className={modalInputClass}
                        value={form.ビル名}
                        onChange={(e) => handleChange("ビル名", e.target.value)}
                    />
                </div>

                {/* --- 契約日 --- */}
                <div className="mb-3 flex flex-col">
                    <label className="mb-1 font-medium text-sm">契約日：</label>
                    <DatePicker
                        selected={toDate(form.契約日)}
                        onChange={(date) =>
                            handleChange(
                                "契約日",
                                date ? dayjs(date).format("YYYY-MM-DD") : ""
                            )
                        }
                        dateFormat="yyyy-MM-dd"
                        className={modalInputClass}
                        autoComplete="off"
                    />
                </div>

                {/* --- 減価償却 --- */}
                <div className="mb-3 flex flex-col">
                    <label className="mb-1 font-medium text-sm">減価償却：</label>
                    <input
                        type="number"
                        className={modalInputClass}
                        value={form.減価償却}
                        onChange={(e) =>
                            handleChange("減価償却", Number(e.target.value))
                        }
                    />
                </div>

                {/* --- 法定耐用年数 --- */}
                <div className="mb-3 flex flex-col">
                    <label className="mb-1 font-medium text-sm">
                        法定耐用年数：
                    </label>
                    <input
                        type="number"
                        className={modalInputClass}
                        value={form.法定耐用年数}
                        onChange={(e) =>
                            handleChange(
                                "法定耐用年数",
                                Number(e.target.value)
                            )
                        }
                    />
                </div>

                {/* --- 元金 --- */}
                <div className="mb-3 flex flex-col">
                    <label className="mb-1 font-medium text-sm">元金：</label>
                    <input
                        type="number"
                        className={modalInputClass}
                        value={form.元金}
                        onChange={(e) =>
                            handleChange("元金", Number(e.target.value))
                        }
                    />
                </div>

                {/* --- ローンの期限 --- */}
                <div className="mb-3 flex flex-col">
                    <label className="mb-1 font-medium text-sm">
                        ローンの期限：
                    </label>
                    <DatePicker
                        selected={toDate(form.ローンの期限)}
                        onChange={(date) =>
                            handleChange(
                                "ローンの期限",
                                date ? dayjs(date).format("YYYY-MM-DD") : ""
                            )
                        }
                        dateFormat="yyyy-MM-dd"
                        className={modalInputClass}
                        autoComplete="off"
                    />
                </div>

                <div className="flex justify-end gap-4 mt-5">
                    <button
                        onClick={() => onSave(form)}
                        className={modalConfirmButtonClass}
                    >
                        保存
                    </button>
                    <button onClick={onClose} className={modalCancelButtonClass}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};