// src/components/graph/DateFilterControls.tsx

import React from "react";

// 共通スタイルを GraphPage から移管
const modalInputClass = "py-1.5 px-2.5 text-sm rounded-md border border-gray-300 w-full";

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
  
  // ユーザーが範囲外の数値を入力した場合に、値を-100〜+100の範囲に丸める関数
  const handleThresholdChange = (value: number) => {
    const clampedValue = Math.max(-100, Math.min(100, value));
    onThresholdChange(clampedValue);
  };

  return (
    <div className="bg-white border border-gray-300 p-3 px-4 rounded-lg shadow-sm mx-auto mb-5 w-fit">
      <div className="flex items-end flex-wrap justify-start gap-4">
        {/* 開始月 (変更なし) */}
        <div className="flex flex-col">
          <label htmlFor="startMonth" className="mb-1 font-medium text-sm whitespace-nowrap">
            開始月
          </label>
          <input
            type="month"
            id="startMonth"
            value={startMonth}
            min={minMonth}
            max={endMonth}
            onChange={(e) => onStartMonthChange(e.target.value)}
            className={modalInputClass}
          />
        </div>

        {/* 終了月 (変更なし) */}
        <div className="flex flex-col">
          <label htmlFor="endMonth" className="mb-1 font-medium text-sm whitespace-nowrap">
            終了月
          </label>
          <input
            type="month"
            id="endMonth"
            value={endMonth}
            min={startMonth}
            max={maxMonth}
            onChange={(e) => onEndMonthChange(e.target.value)}
            className={modalInputClass}
          />
        </div>

        {/* ▼▼▼ 閾値 (ここを変更) ▼▼▼ */}
        <div className="flex flex-col">
          {/* 1. ラベルと数値入力を一行に (flex, items-center) */}
          <label htmlFor="threshold-number" className="mb-3 font-medium text-sm whitespace-nowrap flex items-center gap-1">
            <span>赤背景（元金 − 減価償却 ＞</span>
            {/* 数値入力 */}
            <input
              id="threshold-number"
              type="number"
              min="-100"
              max="100"
              step="1"
              value={threshold}
              onChange={(e) => handleThresholdChange(Number(e.target.value))}
              className={`${modalInputClass} w-20 text-center`}
            />
            <span>万円）</span>
          </label>
          
          {/* 2. スライダーをその下に配置 */}
          <input
            id="threshold-slider"
            type="range"
            min="-100"
            max="100"
            step="1"
            value={threshold}
            onChange={(e) => handleThresholdChange(Number(e.target.value))}
            // w-32 から w-full に変更し、上の要素の幅に合わせる
            className="appearance-none w-full h-2 mb-3 bg-gray-300 rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-500 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-500"
          />
        </div>
        {/* ▲▲▲ 閾値 (ここまで) ▲▲▲ */}

      </div>
    </div>
  );
};