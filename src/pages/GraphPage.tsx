// src/pages/GraphPage.tsx (修正版)

import SimulationHistory from "./SimulationHistory";
import { useLocation, useNavigate } from "react-router-dom";
import { PropertyData } from "../types/property";
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
} from "recharts";
import dayjs from "dayjs";

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useState, useMemo } from "react";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// import styles from "../styles/GraphPage.module.css"; // ← 削除
import minMax from "dayjs/plugin/minMax";
dayjs.extend(minMax);

type MonthlyData = {
  month: string; // e.g., "2021-06"
  減価償却合計: number;
  元金合計: number;
  減価償却イベント?: string[];
  元金イベント?: string[];
};

// 売却と追加の操作を区別するための型
type Simulation =
  | { id: string; type: "add"; data: PropertyData }
  | { id: string; type: "sell"; buildingName: string; date: string };

const GraphPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const originalData = location.state?.parsedData as PropertyData[];
  const [threshold, setThreshold] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [editIndex, setEditIndex] = useState<string | null>(null); // 編集中のビルのindex（nullなら新規追加）
  
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const [simulations, setSimulations] = useState<Simulation[]>([]);

  type SoldBuilding = {
    ビル名: string;
    売却日: string;
  };

  const { virtualBuildings, soldBuildings } = useMemo((): {
    virtualBuildings: PropertyData[];
    soldBuildings: SoldBuilding[];
  } => {
    const vBuildings: PropertyData[] = [];
    const sBuildings: SoldBuilding[] = [];

    simulations.forEach((sim) => {
      if (sim.type === "add") {
        vBuildings.push(sim.data);
      } else if (sim.type === "sell") {
        sBuildings.push({ ビル名: sim.buildingName, 売却日: sim.date });
      }
    });
    return { virtualBuildings: vBuildings, soldBuildings: sBuildings };
  }, [simulations]);

  const data = useMemo(
      () => [...originalData, ...virtualBuildings],
      [originalData, virtualBuildings]
  );

  // ▼▼▼ ロジックを復元 ▼▼▼
  const [form, setForm] = useState<PropertyData>({
    ビル名: "",
    契約日: "",
    減価償却: 0,
    法定耐用年数: 0,
    元金: 0,
    ローンの期限: "",
    元金の支払いタイプ: "毎月", // 仮で固定
  });
  const getInputType = (key: string): string => {
    if (["契約日", "ローンの期限"].includes(key)) return "date";
    if (["減価償却", "法定耐用年数", "元金"].includes(key)) return "number";
    return "text"; // ビル名など
  };
  const [sellForm, setSellForm] = useState<{ name: string; date: string }>({
    name: "",
    date: dayjs().format("YYYY-MM-DD"),
  });
  // ▲▲▲ ロジックを復元 ▲▲▲


  if (!data || data.length === 0) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl font-semibold mb-4">データがありません</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-200 py-2 px-6 rounded-lg hover:bg-gray-300"
        >
          戻る
        </button>
      </div>
    );
  }

  // ▼▼▼ グラフ計算ロジックを復元 ▼▼▼
  const monthlyMap: Record<string, MonthlyData> = {};

  data.forEach((item) => {
    const contractStart = dayjs(item.契約日).startOf("month");
    const loanEnd = dayjs(item.ローンの期限).startOf("month");
    const years = parseInt(item.法定耐用年数.toString(), 10) || 0;
    const depreciationEnd = contractStart.add(years, "year").subtract(1, "month");

    const depreciationMonths = depreciationEnd.diff(contractStart, "month") + 1;
    const loanMonths = loanEnd.diff(contractStart, "month") + 1;

    if (loanMonths <= 0 || depreciationMonths <= 0) return;

    const monthlyDepreciation = parseInt(item.減価償却.toString(), 10) || 0;
    const monthlyPrincipal = parseInt(item.元金.toString(), 10) || 0;

    if (monthlyDepreciation === 0 && monthlyPrincipal === 0) return;

    // 元金（ローン）加算
    const sold = soldBuildings.find((s) => s.ビル名 === item.ビル名);
    const soldMonth = sold ? dayjs(sold.売却日).startOf("month") : null;

    // 元金（ローン）加算
    let cur = contractStart;
    for (let i = 0; i < loanMonths; i++) {
      if (soldMonth && cur.isSameOrAfter(soldMonth)) break; // 売却月以降は除外

      const month = cur.format("YYYY-MM");
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, 減価償却合計: 0, 元金合計: 0 };
      }
      monthlyMap[month].元金合計 += monthlyPrincipal;
      cur = cur.add(1, "month");
    }

    // 減価償却は耐用年数まで
    cur = contractStart;
    for (let i = 0; i < depreciationMonths; i++) {
      if (soldMonth && cur.isSameOrAfter(soldMonth)) break; // 売却月以降は除外

      const month = cur.format("YYYY-MM");
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, 減価償却合計: 0, 元金合計: 0 };
      }
      monthlyMap[month].減価償却合計 += monthlyDepreciation;
      cur = cur.add(1, "month");
    }


    const startMonth = contractStart.format("YYYY-MM");
    const endLoanMonth = loanEnd.add(1, "month").format("YYYY-MM");
    const endDepreciationMonth = depreciationEnd.add(1, "month").format("YYYY-MM");
    
    const ensureMonthlyMap = (month: string) => {
      if (!monthlyMap[month]) {
        monthlyMap[month] = {
          month,
          減価償却合計: 0,
          元金合計: 0,
          減価償却イベント: [],
          元金イベント: [],
        };
      } else {
        // 存在するがイベント配列が未定義な場合は個別初期化
        monthlyMap[month]["減価償却イベント"] ??= [];
        monthlyMap[month]["元金イベント"] ??= [];
      }
    };
    

    //開始
    ensureMonthlyMap(startMonth);
    monthlyMap[startMonth]["元金イベント"]!.push(`${item.ビル名}：増加`);
    monthlyMap[startMonth]["減価償却イベント"]!.push(`${item.ビル名}：増加`);

    //終了
    ensureMonthlyMap(endLoanMonth);
    monthlyMap[endLoanMonth]["元金イベント"]!.push(`${item.ビル名}：減少`);

    ensureMonthlyMap(endDepreciationMonth);
    monthlyMap[endDepreciationMonth]["減価償却イベント"]!.push(`${item.ビル名}：減少`);

    if (soldMonth) {
      const endMonthStr = soldMonth.format("YYYY-MM");
      ensureMonthlyMap(endMonthStr);
      monthlyMap[endMonthStr]["元金イベント"]!.push(`${item.ビル名}：売却`);
      monthlyMap[endMonthStr]["減価償却イベント"]!.push(`${item.ビル名}：売却`);
    }

  });

  const chartData: MonthlyData[] = Object.values(monthlyMap).sort(
    (a, b) => dayjs(a.month).unix() - dayjs(b.month).unix()
  );

  const lowDiffAreas = chartData
    .map((entry, index) => ({
      index,
      diff: entry.元金合計 - entry.減価償却合計,
      month: entry.month,
    }))
    .filter(({ diff }) => diff > threshold * 10000);

  const highlightedRanges = lowDiffAreas.map(({ month }) => {
    const nextMonth = dayjs(month).add(1, "month").format("YYYY-MM");
    return { x1: month, x2: nextMonth };
  });

  const xTicks = chartData
    .map((d) => d.month)
    .filter((month) => dayjs(month).month() === 0);

  const months = chartData.map((d) => d.month);
  const dayjsMonths = months.map((m) => dayjs(m));

  let minMonth = "";
  let maxMonth = "";

  const minDate = dayjs.min(dayjsMonths);
  const maxDate = dayjs.max(dayjsMonths);

  if (minDate && maxDate) {
    minMonth = minDate.format("YYYY-MM");
    maxMonth = maxDate.format("YYYY-MM");
  } else {
    // デフォルト値（空でない期間）を入れておくとUI崩壊を防げます
    minMonth = "2000-01";
    maxMonth = "2100-01";
  }
  // ▲▲▲ グラフ計算ロジックを復元 ▲▲▲

  const [startMonth, setStartMonth] = useState(minMonth);
  const [endMonth, setEndMonth] = useState(maxMonth);

  // 起動時にminMonth, maxMonthがセットされるように
  useEffect(() => {
    setStartMonth(minMonth);
    setEndMonth(maxMonth);
  }, [minMonth, maxMonth]);

  const filterdData = chartData.filter((item) => {
    return (
      dayjs(item.month).isSameOrAfter(dayjs(startMonth)) &&
      dayjs(item.month).isSameOrBefore(dayjs(endMonth))
    );
  });


  // ▼▼▼ Tooltipロジックを復元 ▼▼▼
  const CustomTooltip = ({
    active,
    payload,
    label,
    onHoverMonth,
  }: {
    active?: boolean;
    payload?: any;
    label?: string;
    onHoverMonth: (label: string | null) => void;
  }) => {
    useEffect(() => {
      if (active && label) {
        onHoverMonth(label);
      } else {
        onHoverMonth(null);
      }
    }, [active, label, onHoverMonth]);

    if (!active || !payload || payload.length === 0 || !label) {
        return null;
    }

    const data = payload[0].payload as MonthlyData;
    const [year, month] = label.split("-"); // この時点でlabelは必ずstring型
    const formattedLabel = `${year}年${month}月`;

    return (
      <div className="bg-white p-4 border border-gray-300 shadow-lg rounded-md">
        <strong>{formattedLabel}</strong>
        <br />
        元金: {data.元金合計.toLocaleString()}
        <br />
        {data.元金イベント?.map((e, i) => (
          <div key={i}>{e}</div>
        ))}
        <br />
        減価償却: {data.減価償却合計.toLocaleString()}
        <br />
        {data.減価償却イベント?.map((e, i) => (
          <div key={i}>{e}</div>
        ))}
        <br />
      </div>
    );
  };
  // ▲▲▲ Tooltipロジックを復元 ▲▲▲

    
  // ボタン共通スタイル
  const buttonClass = "py-2 px-5 bg-gray-200 border-none rounded-md cursor-pointer text-sm hover:bg-gray-300 transition-colors";
  const modalButtonClass = "py-1.5 px-4 rounded-md cursor-pointer transition-colors";
  const modalConfirmButtonClass = `${modalButtonClass} bg-blue-500 text-white hover:bg-blue-600`;
  const modalCancelButtonClass = `${modalButtonClass} bg-gray-200 text-gray-800 hover:bg-gray-300`;
  const modalInputClass = "py-1.5 px-2.5 text-sm rounded-md border border-gray-300 w-full"; // .formInput
    
  return (
    // .container (print: クラスを削除)
    <div className="w-full max-w-[90vw] mx-auto">
      
      {/* --- コントロールパネル --- */}
      {/* .controls (print: クラスを削除) */}
      <div className="flex flex-wrap gap-4 justify-center mb-5">

        {/* --- 印刷ボタンを削除 --- */}

        {/* --- 売却コントロール --- */}
        {/* .controlGroup */}
        <div className="bg-white border border-gray-300 p-3 rounded-lg shadow-sm flex flex-col gap-1.5">
          <label className="text-sm">
            売却日：
            <input
              type="date"
              value={sellForm.date}
              onChange={(e) => setSellForm({ ...sellForm, date: e.target.value })}
              className="ml-2 border-gray-300 rounded-md"
            />
          </label>
          <button className={buttonClass} onClick={() => setShowSellModal(true)}>
            ビルを売却
          </button>
        </div>
        
        {/* --- 売却モーダル --- */}
        {showSellModal && (
          // .modalOverlay
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            {/* .modalContent */}
            <div className="bg-white p-6 py-8 rounded-lg w-96 shadow-xl max-h-[80vh] overflow-y-auto">
              <h3 className="mt-0 mb-4 text-xl font-semibold">ビルを売却</h3>
              {/* .radioGroup */}
              <ul className="list-none p-0 m-0 mb-5">
                {originalData
                  .filter((b) => !soldBuildings.some((s) => s.ビル名 === b.ビル名))
                  .map((b, i) => (
                    <li key={i} className="mb-2.5">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="sell"
                          value={b.ビル名}
                          onChange={() => setSellForm({ ...sellForm, name: b.ビル名 })}
                          className="mr-2"
                        />
                        {b.ビル名}
                      </label>
                    </li>
                  ))}
              </ul>
              {/* .modalButtons */}
              <div className="flex justify-end gap-4">
                <button
                  // ▼▼▼ 売却ロジックを復元 ▼▼▼
                  onClick={() => {
                    if (!sellForm.name || !sellForm.date) return;

                    const newSellEvent: Simulation = {
                      id: crypto.randomUUID(), // 一意のIDを付与
                      type: "sell",
                      buildingName: sellForm.name,
                      date: sellForm.date,
                    };
                    setSimulations([...simulations, newSellEvent]);

                    setSellForm({ name: "", date: dayjs().format("YYYY-MM-DD") });
                    setShowSellModal(false);
                  }}
                  // ▲▲▲ 売却ロジックを復元 ▲▲▲
                  className={modalConfirmButtonClass}
                >
                  売却する
                </button>
                <button onClick={() => setShowSellModal(false)} className={modalCancelButtonClass}>
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- 追加コントロール --- */}
        {/* .controlGroup */}
        <div className="bg-white border border-gray-300 p-3 rounded-lg shadow-sm flex flex-col gap-1.5">
          <button className={buttonClass} onClick={() => {
            setForm({ // フォームをリセット
              ビル名: "", 契約日: "", 減価償却: 0, 法定耐用年数: 0, 元金: 0, ローンの期限: "", 元金の支払いタイプ: "毎月",
            });
            setEditIndex(null); // 新規追加モード
            setShowModal(true);
          }}>
            仮想ビルを追加
          </button>
        </div>

        {/* --- 追加モーダル --- */}
        {showModal && (
          // .modalOverlay
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            {/* .modalContent */}
            <div className="bg-white p-6 py-8 rounded-lg w-96 shadow-xl max-h-[80vh] overflow-y-auto">
              <h3 className="mt-0 mb-4 text-xl font-semibold">
                {editIndex ? "仮想ビルを編集" : "仮想ビルを追加"}
              </h3>
              {["ビル名", "契約日", "減価償却", "法定耐用年数", "元金", "ローンの期限"].map((key) => (
                // .formField
                <div key={key} className="mb-3 flex flex-col">
                  <label className="mb-1 font-medium text-sm">{key}：</label>
                  <input
                    type={getInputType(key)}
                    className={modalInputClass}
                    value={(form as any)[key]?.toString() ?? ""}
                    // ▼▼▼ onChangeロジックを復元 ▼▼▼
                    onChange={(e) => {
                      const value = e.target.value;
                      const newValue =
                        ["減価償却", "法定耐用年数", "元金"].includes(key)
                          ? Number(value)
                          : value;
                      setForm({ ...form, [key]: newValue });
                    }}
                    // ▲▲▲ onChangeロジックを復元 ▲▲▲
                  />
                </div>
              ))}
              {/* .modalButtons */}
              <div className="flex justify-end gap-4 mt-5">
                <button
                  // ▼▼▼ 保存ロジックを復元 ▼▼▼
                  onClick={() => {
                    if (editIndex !== null) {
                      const updatedSimulations = simulations.map((sim) =>
                        sim.id === editIndex ? { ...sim, data: form } : sim
                      );
                      setSimulations(updatedSimulations);
                    } else {
                      const newAddEvent: Simulation = {
                        id: crypto.randomUUID(),
                        type: "add",
                        data: form,
                      };
                      setSimulations([...simulations, newAddEvent]);
                    }

                    setForm({
                      ビル名: "",
                      契約日: "",
                      減価償却: 0,
                      法定耐用年数: 0,
                      元金: 0,
                      ローンの期限: "",
                      元金の支払いタイプ: "毎月",
                    });
                    setEditIndex(null);
                    setShowModal(false);
                  }}
                  // ▲▲▲ 保存ロジックを復元 ▲▲▲
                  className={modalConfirmButtonClass}
                >
                  保存
                </button>
                <button onClick={() => {
                  setEditIndex(null);
                  setShowModal(false);
                }} className={modalCancelButtonClass}>
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- 日付・閾値コントロール --- */}
      {/* .dateControlsBox (print: クラスを削除) */}
      <div className="bg-white border border-gray-300 p-3 px-4 rounded-lg shadow-sm mx-auto mb-5 w-fit">
        {/* .dateControlsRow */}
        <div className="flex items-end flex-wrap justify-start gap-4">
          {/* .dateInputGroup */}
          <div className="flex flex-col">
            <label htmlFor="startMonth" className="mb-1 font-medium text-sm whitespace-nowrap">開始月</label>
            <input
              type="month"
              id="startMonth"
              value={startMonth}
              min={minMonth}
              max={endMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className={modalInputClass}
            />
          </div>
          {/* .dateInputGroup */}
          <div className="flex flex-col">
            <label htmlFor="endMonth" className="mb-1 font-medium text-sm whitespace-nowrap">終了月</label>
            <input
              type="month"
              id="endMonth"
              value={endMonth}
              min={startMonth}
              max={maxMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className={modalInputClass}
            />
          </div>
          {/* .thresholdInline */}
          <div className="flex items-center gap-2">
            <label htmlFor="threshold" className="text-sm">赤背景：元金 − 減価償却 ＞</label>
            <input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className={`${modalInputClass} w-24`} // .thresholdInput
            />
            <span className="text-sm">万円</span>
          </div>
        </div>
      </div>

      {/* --- グラフコンテナ --- */}
      {/* .chartContainer (print: クラスを削除) */}
      <div className="bg-white border border-gray-300 rounded-lg p-5 pt-8 pr-0 shadow-sm mx-auto mb-6 w-full">
        <ResponsiveContainer width="95%" height={500}>
          <LineChart
            data={filterdData}
            // ▼▼▼ クリックロジックを復元 ▼▼▼
            onClick={() => {
              if (hoveredMonth) {
                const currentMonth = dayjs(hoveredMonth);
                // `data` (オリジナル+仮想) を元にフィルタリング
                const visibleData = data.filter((b) => {
                  // 契約前は除外
                  if (currentMonth.isBefore(dayjs(b.契約日), "month")) {
                    return false;
                  }
                  // 売却済みか確認
                  const sold = soldBuildings.find(
                    (s) => s.ビル名 === b.ビル名
                  );
                  if (
                    sold &&
                    currentMonth.isSameOrAfter(dayjs(sold.売却日), "month")
                  ) {
                    return false; // 売却月以降は除外
                  }
                  return true; // 上記以外は表示
                });
                localStorage.setItem("propertyData", JSON.stringify(visibleData));
                window.electronAPI.openBuildingList(hoveredMonth);
              }
            }}
            // ▲▲▲ クリックロジックを復元 ▲▲▲
            margin={{ top: 20, right: 30, left: 50, bottom: 20}}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              ticks={xTicks}
              tickFormatter={(tick) => dayjs(tick).format("YYYY年MM月")}
              // 期間が長すぎる場合に備えて間隔を調整
              interval="preserveStartEnd" 
            />
            <YAxis
              tickFormatter={(value) =>
                value.toLocaleString()
              }
            />
            <Tooltip
              content={(props) => (
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
                ifOverflow="hidden" // グラフ範囲外に描画しない
              />
            ))}

            <Line
              type="monotone"
              dataKey="減価償却合計"
              stroke="#8884d8"
              strokeWidth={2}
              name="減価償却"
              dot={false} // 点を非表示にして見やすく
            />
            <Line
              type="monotone"
              dataKey="元金合計"
              stroke="#82ca9d"
              strokeWidth={2}
              name="元金"
              dot={false} // 点を非表示にして見やすく
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* --- 履歴コンポーネント --- */}
      <SimulationHistory
        simulations={simulations}
        // ▼▼▼ 編集・削除ロジックを復元 ▼▼▼
        onEdit={(sim) => {
          if (sim.type === 'add') {
            setForm(sim.data);
            setEditIndex(sim.id);
            setShowModal(true);
          }
        }}
        onDelete={(id) => {
          setSimulations(simulations.filter((s) => s.id !== id));
        }}
        // ▲▲▲ 編集・削除ロジックを復元 ▲▲▲
      />

      {/* --- 戻るボタン --- */}
      {/* (print: クラスを削除) */}
      <div className="text-center mt-3 mb-10">
        <button
          className={`${buttonClass} text-center`} // .backbutton
          onClick={() => navigate("/")}
        >
          戻る
        </button>
      </div>

    </div>
  );
};

export default GraphPage;