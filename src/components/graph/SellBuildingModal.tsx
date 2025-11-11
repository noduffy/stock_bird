// src/components/graph/SellBuildingModal.tsx

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { PropertyData } from "../../types/property";

// 共通スタイル
const modalButtonClass = "py-1.5 px-4 rounded-md cursor-pointer transition-colors";
const modalConfirmButtonClass = `${modalButtonClass} bg-blue-500 text-white hover:bg-blue-600`;
const modalCancelButtonClass = `${modalButtonClass} bg-gray-200 text-gray-800 hover:bg-gray-300`;

export type SellFormData = {
  name: string;
  date: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSell: (data: SellFormData) => void;
  // 売却可能なビルのリストを親から受け取る
  availableBuildings: PropertyData[];
};

export const SellBuildingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSell,
  availableBuildings,
}) => {
  // モーダルが自身のフォーム状態を管理する
  const [sellForm, setSellForm] = useState<SellFormData>({
    name: "",
    date: dayjs().format("YYYY-MM-DD"),
  });

  // 開くたびに選択をリセット
  useEffect(() => {
    if (isOpen) {
      setSellForm({
        name: "",
        date: dayjs().format("YYYY-MM-DD"),
      });
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (sellForm.name && sellForm.date) {
      onSell(sellForm);
    } else {
      alert("売却するビルと売却日を選択してください。");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 py-8 rounded-lg w-96 shadow-xl max-h-[80vh] overflow-y-auto">
        <h3 className="mt-0 mb-4 text-xl font-semibold">ビルを売却</h3>
        
        <div className="mb-4">
          <label className="text-sm">売却日：</label>
          <input
            type="date"
            value={sellForm.date}
            onChange={(e) =>
              setSellForm({ ...sellForm, date: e.target.value })
            }
            className="ml-2 border-gray-300 rounded-md p-1"
          />
        </div>

        <ul className="list-none p-0 m-0 mb-5">
          {availableBuildings.length > 0 ? (
            availableBuildings.map((b) => (
              <li key={b.ビル名} className="mb-2.5">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="sell"
                    value={b.ビル名}
                    checked={sellForm.name === b.ビル名}
                    onChange={() =>
                      setSellForm({ ...sellForm, name: b.ビル名 })
                    }
                    className="mr-2"
                  />
                  {b.ビル名}
                </label>
              </li>
            ))
          ) : (
            <p className="text-gray-500">売却可能なビルがありません。</p>
          )}
        </ul>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSubmit}
            disabled={!sellForm.name || availableBuildings.length === 0}
            className={`${modalConfirmButtonClass} disabled:bg-gray-400`}
          >
            売却する
          </button>
          <button onClick={onClose} className={modalCancelButtonClass}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};