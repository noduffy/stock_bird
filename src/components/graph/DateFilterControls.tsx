// src/components/graph/DateFilterControls.tsx (全コード・型エラー修正)

import React from "react";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";

// 共通スタイル
const modalInputClass =
    "py-1.5 px-2.5 text-sm rounded-md border border-gray-300 w-full";

type Props = {
    startMonth: string;
    endMonth: string;
    minMonth: string;
    maxMonth: string;
    threshold: number;
    onStartMonthChange: (month: string) => void;
    onEndMonthChange: (month: string) => void;
    onThresholdChange: (value: number) => void;
};

export const DateFilterControls: React.FC<Props> = ({
    startMonth,
    endMonth,
    minMonth,
    maxMonth,
    threshold,
    onStartMonthChange,
    onEndMonthChange,
    onThresholdChange,
}) => {
    const handleThresholdChange = (value: number) => {
        const clampedValue = Math.max(-100, Math.min(100, value));
        onThresholdChange(clampedValue);
    };

    // ▼▼▼ 修正点 ▼▼▼
    // 文字列(YYYY-MM)をDateオブジェクトに変換 (nullではなくundefinedを返す)
    const toDate = (monthStr: string) => {
        return monthStr ? dayjs(monthStr).toDate() : undefined; // ★ null を undefined に変更
    };
    // ▲▲▲ 修正点 ▲▲▲

    return (
        <div className="bg-white border border-gray-300 p-3 px-4 rounded-lg shadow-sm mx-auto mb-5 w-fit">
            <div className="flex items-end flex-wrap justify-start gap-4">
                {/* 開始月 */}
                <div className="flex flex-col">
                    <label
                        htmlFor="startMonth"
                        className="mb-1 font-medium text-sm whitespace-nowrap"
                    >
                        開始月
                    </label>
                    <DatePicker
                        id="startMonth"
                        selected={toDate(startMonth)}
                        onChange={(date) =>
                            onStartMonthChange(
                                date ? dayjs(date).format("YYYY-MM") : ""
                            )
                        }
                        minDate={toDate(minMonth)} // これで型が一致
                        maxDate={toDate(endMonth)} // これで型が一致
                        dateFormat="yyyy-MM"
                        showMonthYearPicker
                        className={modalInputClass}
                    />
                </div>

                {/* 終了月 */}
                <div className="flex flex-col">
                    <label
                        htmlFor="endMonth"
                        className="mb-1 font-medium text-sm whitespace-nowrap"
                    >
                        終了月
                    </label>
                    <DatePicker
                        id="endMonth"
                        selected={toDate(endMonth)}
                        onChange={(date) =>
                            onEndMonthChange(
                                date ? dayjs(date).format("YYYY-MM") : ""
                            )
                        }
                        minDate={toDate(startMonth)} // これで型が一致
                        maxDate={toDate(maxMonth)} // これで型が一致
                        dateFormat="yyyy-MM"
                        showMonthYearPicker
                        className={modalInputClass}
                    />
                </div>

                {/* --- 閾値 (変更なし) --- */}
                <div className="flex flex-col">
                    <label
                        htmlFor="threshold-number"
                        className="mb-2 font-medium text-sm whitespace-nowrap flex items-center gap-1"
                    >
                        <span>赤背景（元金 − 減価償却 ＞</span>
                        <input
                            id="threshold-number"
                            type="number"
                            min="-100"
                            max="100"
                            step="1"
                            value={threshold}
                            onChange={(e) =>
                                handleThresholdChange(Number(e.target.value))
                            }
                            className={`${modalInputClass} w-20 text-center`}
                        />
                        <span>万円）</span>
                    </label>
                    <input
                        id="threshold-slider"
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value={threshold}
                        onChange={(e) =>
                            handleThresholdChange(Number(e.target.value))
                        }
                        className="appearance-none w-full h-2 bg-gray-300 rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-500 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-500"
                    />
                </div>
            </div>
        </div>
    );
};