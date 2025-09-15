import { PropertyData } from "../types/property";
import styles from "../styles/SimulationHistory.module.css";

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
    <div className={styles.historyContainer}>
      <h3>シミュレーション履歴</h3>
      <ul className={styles.historyList}>
        {simulations.map((sim) => (
          <li key={sim.id} className={styles.historyItem}>
            <span
              className={`${styles.itemType} ${
                sim.type === "add" ? styles.typeAdd : styles.typeSell
              }`}
            >
              {sim.type === "add" ? "追加" : "売却"}
            </span>

            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>
                {sim.type === "add" ? sim.data.ビル名 : sim.buildingName}
              </p>
              <p className={styles.itemDetails}>
                {sim.type === "add"
                  ? `契約日: ${sim.data.契約日} | 元金: ${sim.data.元金.toLocaleString()}円 | 減価償却: ${sim.data.減価償却.toLocaleString()}円`
                  : `売却日: ${sim.date}`}
              </p>
            </div>

            <div className={styles.itemActions}>
              {sim.type === "add" && (
                <button
                  onClick={() => onEdit(sim)}
                  className={styles.actionButton}
                >
                  編集
                </button>
              )}
              <button
                onClick={() => onDelete(sim.id)}
                className={styles.deleteButton}
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