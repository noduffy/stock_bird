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
} from "recharts";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);
import { ReferenceArea } from "recharts";
import {useEffect, useState} from "react";

type MonthlyData = {
  month: string; // e.g., "2021-06"
  減価償却合計: number;
  元金合計: number;
  減価償却イベント?: string[];
  元金イベント?: string[];
};


const GraphPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const originalData = location.state?.parsedData as PropertyData[];
  const [threshold, setThreshold] = useState(0);
  const [virtualBuildings, setVirtualBuildings] = useState<PropertyData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null); // 編集中のビルのindex（nullなら新規追加）
  
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  type SoldBuilding = {
    ビル名: string;
    売却日: string; //YYYY-MM-DD
  };
  const [soldBuildings, setSoldBuildings] = useState<SoldBuilding[]>([]);
  const data = [
    ...originalData.filter((b) => {
      const sold = soldBuildings.find((s) => s.ビル名 === b.ビル名);
      if(!sold) return true;
      return dayjs(b.契約日).isBefore(dayjs(sold.売却日), "month");
    }),
    ...virtualBuildings,
  ];
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


  if (!data || data.length === 0) {
    return (
      <div>
        <h2>データがありません</h2>
        <button onClick={() => navigate("/")}>戻る</button>
      </div>
    );
  }

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
      diff: entry.減価償却合計 - entry.元金合計,
      month: entry.month,
    }))
    .filter(({ diff }) => diff < threshold);

  const highlightedRanges = lowDiffAreas.map(({ month }) => {
    const nextMonth = dayjs(month).add(1, "month").format("YYYY-MM");
    return { x1: month, x2: nextMonth };
  });

  const CustomTooltip = ({
    active,
    payload,
    label,
    onHoverMonth, 
  }:{
    active?: boolean;
    payload?: any;
    label?: string;
    onHoverMonth: (label: string) => void;
  }) => {
    useEffect(() =>{
      if (label) onHoverMonth(label);
    }, [label]);

    if(!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload as MonthlyData;

    return(
      <div style={{ background: "white", padding: 10, border: "1px solid #ccc"}}>
        <strong>{label}</strong>
        <br />
        元金: {data.元金合計}
        <br />
        {data.元金イベント?.map((e,i) => (
          <div key={i}>{e}</div>
        ))}
        <br />
        減価償却: {data.減価償却合計}
        <br />
        {data.減価償却イベント?.map((e,i) => (
          <div key={i}>{e}</div>
        ))}
        <br />
      </div>
    )
  }
    
  return (
    <div style={{ width: "90vw", maxWidth: "1500px", height: "500px", margin: "0 auto" }}>
      <h2>減価償却と元金の推移グラフ</h2>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setShowModal(true)}>+ 仮想ビルを追加</button>
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <label>
            売却日：
            <input
              type="date"
              value={sellForm.date}
              onChange={(e) => setSellForm({ ...sellForm, date: e.target.value })}
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>

        <button onClick={() => setShowSellModal(true)}>- ビルを売却</button>

        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "400px",
              }}
            >
              <h3>仮想ビルを追加</h3>
              {["ビル名", "契約日", "減価償却", "法定耐用年数", "元金", "ローンの期限"].map((key) => (
                <div key={key} style={{ marginBottom: "8px" }}>
                  <label>{key}：
                    <input
                      type={getInputType(key)}
                      value={(form as any)[key]?.toString() ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newValue =
                          ["減価償却", "法定耐用年数", "元金"].includes(key)
                            ? Number(value)
                            : value;
                        setForm({ ...form, [key]: newValue });
                      }}
                      style={{ marginLeft: "8px", width: "100%" }}
                    />
                  </label>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => {
                    if (editIndex !== null) {
                      // 編集の場合：既存データの上書き
                      const updated = [...virtualBuildings];
                      updated[editIndex] = form;
                      setVirtualBuildings(updated);
                    } else {
                      // 新規追加
                      setVirtualBuildings([...virtualBuildings, form]);
                    }

                    // 初期化してモーダルを閉じる
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
                >
                  保存
                </button>

                <button onClick={() => setShowModal(false)}>キャンセル</button>
              </div>
            </div>
          </div>
        )}
        {showSellModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "400px",
              }}
            >
              <h3>ビルを売却</h3>
              <ul>
                {originalData
                  .filter((b) => !soldBuildings.some((s) => s.ビル名 === b.ビル名))
                  .map((b, i) => (
                    <li key={i} style={{ marginBottom: "12px" }}>
                      <label>
                        <input
                          type="radio"
                          name="sell"
                          value={b.ビル名}
                          onChange={() => setSellForm({ ...sellForm, name: b.ビル名 })}
                          style={{ marginRight: "0.5rem" }}
                        />
                        {b.ビル名}
                      </label>
                    </li>
                  ))}
              </ul>
              <button
                onClick={() => {
                  if (!sellForm.name || !sellForm.date) return;
                  setSoldBuildings([...soldBuildings, {
                    ビル名: sellForm.name,
                    売却日: sellForm.date,
                  }]);
                  setSellForm({ name: "", date: dayjs().format("YYYY-MM-DD") });
                  setShowSellModal(false);
                }}
                style={{ marginTop: "1rem", marginRight: "1rem" }}
              >
                売却する
              </button>

              <button onClick={() => setShowSellModal(false)}>キャンセル</button>
            </div>
          </div>
        )}

      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          赤背景の基準（減価償却 - 元金 がこの値未満）:
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            inputMode="numeric"
            pattern="-?[0-9]*"
            style={{ marginLeft: "0.5rem", width: "100px" }}
          />
        </label>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          onClick={() => {
            if (hoveredMonth) {
              const parsedDataString = JSON.stringify(originalData);
              localStorage.setItem("propertyData", parsedDataString);
              window.electronAPI.openBuildingList(hoveredMonth);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            content={
              <CustomTooltip
                onHoverMonth={(label) => setHoveredMonth(label)}
              />
            }
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
            />
          ))}

          <Line
            type="monotone"
            dataKey="減価償却合計"
            stroke="#8884d8"
            strokeWidth={2}
            name="減価償却"
          />
          <Line
            type="monotone"
            dataKey="元金合計"
            stroke="#82ca9d"
            strokeWidth={2}
            name="元金"
          />
        </LineChart>
      </ResponsiveContainer>
      <button onClick={() => navigate("/")}>戻る</button>
      {virtualBuildings.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>追加済みの仮想ビル一覧</h3>
          <ul>
            {virtualBuildings.map((bldg, index) => (
              <li key={index} style={{ marginBottom: "0.5rem" }}>
                <strong>{bldg.ビル名}</strong>（契約日: {bldg.契約日}, 減価償却: {bldg.減価償却}, 元金: {bldg.元金}）
                <button
                  onClick={() => {
                    setForm(virtualBuildings[index]); // 編集対象のデータをフォームに入れる
                    setEditIndex(index);
                    setShowModal(true);
                  }}
                >
                  編集
                </button>
                <button
                  onClick={() => {
                    const updated = [...virtualBuildings];
                    updated.splice(index, 1);
                    setVirtualBuildings(updated);
                  }}
                  style={{ marginLeft: "1rem" }}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GraphPage;
