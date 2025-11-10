// src/pages/SimulationHistory.tsx

import { PropertyData } from "../types/property";
// import styles from "../styles/SimulationHistory.module.css"; // ← 削除

type Simulation =
  | { id: string; type: "add"; data: PropertyData }
  | { id: string; type: "sell"; buildingName: string; date: string };

type Props = {
  simulations: Simulation[];
  onEdit: (simulation: Simulation) => void;
  onDelete: (id: string) => void;
};

const SimulationHistory = ({ simulations, onEdit, onDelete }: Props) => {
  if (simulations.length === 0) {
    return null; // 履歴がない場合は何も表示しない
  }

  return (
    // .historyContainer
    <div className="w-full max-w-3xl mx-auto my-10 print:hidden">
      {/* h3 */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
        シミュレーション履歴
      </h3>
      {/* .historyList */}
      <ul className="list-none p-0 m-0 flex flex-col gap-4">
        {simulations.map((sim) => (
          // .historyItem
          <li
            key={sim.id}
            className="bg-white border border-gray-200 rounded-lg p-4 px-6 flex items-center gap-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            {/* .itemType */}
            <span
              className={`font-bold py-1 px-3 rounded-full text-xs text-white shrink-0 ${
                sim.type === "add" ? "bg-green-500" : "bg-red-500" // .typeAdd / .typeSell
              }`}
            >
              {sim.type === "add" ? "追加" : "売却"}
            </span>

            {/* .itemContent */}
            <div className="flex-grow">
              {/* .itemTitle */}
              <p className="text-lg font-semibold text-gray-800 m-0 mb-1">
                {sim.type === "add" ? sim.data.ビル名 : sim.buildingName}
              </p>
              {/* .itemDetails */}
              <p className="text-sm text-gray-600 m-0">
                {sim.type === "add"
                  ? `契約日: ${sim.data.契約日} | 元金: ${sim.data.元金.toLocaleString()}円 | 減価償却: ${sim.data.減価償却.toLocaleString()}円`
                  : `売却日: ${sim.date}`}
              </p>
            </div>

            {/* .itemActions */}
            <div className="flex gap-3">
              {sim.type === "add" && (
                // .actionButton
                <button
                  onClick={() => onEdit(sim)}
                  className="bg-transparent border border-gray-300 rounded-md py-1.5 px-3 cursor-pointer text-sm transition-all hover:bg-gray-100 hover:border-gray-400"
                >
                  編集
                </button>
              )}
              {/* .deleteButton */}
              <button
                onClick={() => onDelete(sim.id)}
                className="bg-transparent border border-red-500 text-red-500 rounded-md py-1.5 px-3 cursor-pointer text-sm transition-all hover:bg-red-500 hover:text-white"
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SimulationHistory;