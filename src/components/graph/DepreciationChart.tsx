// src/components/graph/DepreciationChart.tsx

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  TooltipProps,
} from "recharts";
import dayjs from "dayjs";
import { MonthlyData } from "../../hooks/useChartData"; // 型をフックから
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

type Props = {
  data: MonthlyData[];
  xTicks: string[];
  highlightedRanges: { x1: string; x2: string }[];
  // グラフがクリックされたことを、ホバー中の月(month)とともに親に通知する
  onChartClick: (month: string) => void;
};

// --- CustomTooltip (GraphPage.tsxから移動) ---
const CustomTooltip = ({
  active,
  payload,
  label,
  onHoverMonth,
}: TooltipProps<ValueType, NameType> & {
  onHoverMonth: (label: string | null) => void;
}) => {
  useEffect(() => {
    if (active && label) {
      onHoverMonth(label as string);
    } else {
      onHoverMonth(null);
    }
  }, [active, label, onHoverMonth]);

  if (!active || !payload || payload.length === 0 || !label) {
    return null;
  }

  // payload[0].payload が MonthlyData 型であることを想定
  const data = payload[0].payload as MonthlyData;
  const [year, month] = (label as string).split("-");
  const formattedLabel = `${year}年${month}月`;

  return (
    <div className="bg-white p-4 border border-gray-300 shadow-lg rounded-md">
      <strong>{formattedLabel}</strong>
      <br />
      元金: {data.元金合計.toLocaleString()}
      <br />
      {data.元金イベント?.map((e, i) => <div key={i}>{e}</div>)}
      <br />
      減価償却: {data.減価償却合計.toLocaleString()}
      <br />
      {data.減価償却イベント?.map((e, i) => <div key={i}>{e}</div>)}
      <br />
    </div>
  );
};
// --- CustomTooltip ここまで ---

export const DepreciationChart: React.FC<Props> = ({
  data,
  xTicks,
  highlightedRanges,
  onChartClick,
}) => {
  // グラフコンポーネントが「今ホバーしている月」を内部で管理する
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 pt-8 pr-0 shadow-sm mx-auto mb-6 w-full">
      <ResponsiveContainer width="95%" height={500}>
        <LineChart
          data={data}
          onClick={() => {
            // ホバー中の月があれば、onChartClick を呼び出す
            if (hoveredMonth) {
              onChartClick(hoveredMonth);
            }
          }}
          margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            ticks={xTicks}
            tickFormatter={(tick) => dayjs(tick).format("YYYY年MM月")}
            interval="preserveStartEnd"
          />
          <YAxis tickFormatter={(value) => value.toLocaleString()} />
          <Tooltip
            content={(props) => (
              // CustomTooltip に hoveredMonth をセットする関数を渡す
              <CustomTooltip {...props} onHoverMonth={setHoveredMonth} />
            )}
          />
          <Legend />
          {highlightedRanges.map((range, i) => (
            <ReferenceArea
              key={i}
              x1={range.x1}
              x2={range.x2}
              stroke="red"
              strokeOpacity={0.2}
              fill="red"
              fillOpacity={0.1}
              ifOverflow="hidden"
            />
          ))}

          <Line
            type="monotone"
            dataKey="減価償却合計"
            stroke="#8884d8"
            strokeWidth={2}
            name="減価償却"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="元金合計"
            stroke="#82ca9d"
            strokeWidth={2}
            name="元金"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};