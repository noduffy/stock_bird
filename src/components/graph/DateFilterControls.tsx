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
  return (
    <div className="bg-white border border-gray-300 p-3 px-4 rounded-lg shadow-sm mx-auto mb-5 w-fit">
      <div className="flex items-end flex-wrap justify-start gap-4">
        {/* 開始月 */}
        <div className="flex flex-col">
          <label htmlFor="startMonth" className="mb-1 font-medium text-sm whitespace-nowrap">
            開始月
          </label>
          <input
            type="month"
            id="startMonth"
            value={startMonth}
            min={minMonth}
            max={endMonth} // 終了月より後には設定させない
            onChange={(e) => onStartMonthChange(e.target.value)}
            className={modalInputClass}
          />
        </div>

        {/* 終了月 */}
        <div className="flex flex-col">
          <label htmlFor="endMonth" className="mb-1 font-medium text-sm whitespace-nowrap">
            終了月
          </label>
          <input
            type="month"
            id="endMonth"
            value={endMonth}
            min={startMonth} // 開始月より前には設定させない
            max={maxMonth}
            onChange={(e) => onEndMonthChange(e.target.value)}
            className={modalInputClass}
          />
        </div>

        {/* 閾値 */}
        <div className="flex items-center gap-2">
          <label htmlFor="threshold" className="text-sm">
            赤背景：元金 − 減価償却 ＞
          </label>
          <input
            id="threshold"
            type="number"
            value={threshold}
            onChange={(e) => onThresholdChange(Number(e.target.value))}
            className={`${modalInputClass} w-24`}
          />
          <span className="text-sm">万円</span>
        </div>
      </div>
    </div>
  );
};