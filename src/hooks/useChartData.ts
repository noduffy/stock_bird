// src/hooks/useChartData.ts

import { useMemo } from "react";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { PropertyData } from "../types/property";

// dayjsプラグインを有効化
dayjs.extend(minMax);

// --- 型定義 (GraphPage.tsx から移動) ---
export type MonthlyData = {
  month: string;
  減価償却合計: number;
  元金合計: number;
  減価償却イベント?: string[];
  元金イベント?: string[];
};

export type Simulation =
  | { id: string; type: "add"; data: PropertyData }
  | { id: string; type: "sell"; buildingName: string; date: string };

type SoldBuilding = {
  ビル名: string;
  売却日: string;
};
// --- 型定義ここまで ---

/**
 * グラフ描画とシミュレーションに必要な計算を一括して行うカスタムフック
 */
export const useChartData = (
  originalData: PropertyData[],
  simulations: Simulation[],
  threshold: number
) => {
  // 1. シミュレーションから仮想ビルと売却ビルを計算
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

  // 2. オリジナルデータと仮想ビルを結合
  const data = useMemo(
    () => (originalData ? [...originalData, ...virtualBuildings] : [...virtualBuildings]),
    [originalData, virtualBuildings]
  );

  // 3. メインのグラフデータ(monthlyMap)を計算
  const chartData = useMemo(() => {
    const monthlyMap: Record<string, MonthlyData> = {};

    if (!data || data.length === 0) {
      return [];
    }

    data.forEach((item) => {
      // (GraphPage.tsx からコピーした計算ロジック)
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

      const sold = soldBuildings.find((s) => s.ビル名 === item.ビル名);
      const soldMonth = sold ? dayjs(sold.売却日).startOf("month") : null;

      let cur = contractStart;
      for (let i = 0; i < loanMonths; i++) {
        if (soldMonth && cur.isSameOrAfter(soldMonth)) break;
        const month = cur.format("YYYY-MM");
        if (!monthlyMap[month]) {
          monthlyMap[month] = { month, 減価償却合計: 0, 元金合計: 0 };
        }
        monthlyMap[month].元金合計 += monthlyPrincipal;
        cur = cur.add(1, "month");
      }

      cur = contractStart;
      for (let i = 0; i < depreciationMonths; i++) {
        if (soldMonth && cur.isSameOrAfter(soldMonth)) break;
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
          monthlyMap[month] = { month, 減価償却合計: 0, 元金合計: 0, 減価償却イベント: [], 元金イベント: [] };
        } else {
          monthlyMap[month]["減価償却イベント"] ??= [];
          monthlyMap[month]["元金イベント"] ??= [];
        }
      };
      
      ensureMonthlyMap(startMonth);
      monthlyMap[startMonth]["元金イベント"]!.push(`${item.ビル名}：増加`);
      monthlyMap[startMonth]["減価償却イベント"]!.push(`${item.ビル名}：増加`);
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

    return Object.values(monthlyMap).sort(
      (a, b) => dayjs(a.month).unix() - dayjs(b.month).unix()
    );
  }, [data, soldBuildings]);

  // 4. グラフのX軸目盛り (年単位)
  const xTicks = useMemo(() => {
    return chartData
      .map((d) => d.month)
      .filter((month) => dayjs(month).month() === 0); // 1月 (0) のみ
  }, [chartData]);

  // 5. グラフの赤背景エリア
  const { lowDiffAreas, highlightedRanges } = useMemo(() => {
    const areas = chartData
      .map((entry) => ({
        diff: entry.元金合計 - entry.減価償却合計,
        month: entry.month,
      }))
      .filter(({ diff }) => diff > threshold * 10000);

    const ranges = areas.map(({ month }) => {
      const nextMonth = dayjs(month).add(1, "month").format("YYYY-MM");
      return { x1: month, x2: nextMonth };
    });
    return { lowDiffAreas: areas, highlightedRanges: ranges };
  }, [chartData, threshold]);

  // 6. 全期間の開始月と終了月
  const { minMonth, maxMonth } = useMemo(() => {
    const months = chartData.map((d) => d.month);
    if (months.length === 0) {
      // データがない場合のデフォルト値
      return { minMonth: "2000-01", maxMonth: "2100-01" };
    }
    
    const dayjsMonths = months.map((m) => dayjs(m));
    const minDate = dayjs.min(dayjsMonths);
    const maxDate = dayjs.max(dayjsMonths);
    
    return {
      minMonth: minDate ? minDate.format("YYYY-MM") : "2000-01",
      maxMonth: maxDate ? maxDate.format("YYYY-MM") : "2100-01",
    };
  }, [chartData]);

  return {
    data, // 結合済みの全PropertyData (クリック処理や売却モーダルで必要)
    soldBuildings, // 売却済みビル (売却モーダルで必要)
    chartData, // グラフ描画用のメインデータ
    xTicks, // X軸の目盛り
    highlightedRanges, // 赤背景エリア
    minMonth, // 全期間の開始月
    maxMonth, // 全期間の終了月
  };
};