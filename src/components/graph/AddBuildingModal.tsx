// src/components/graph/AddBuildingModal.tsx

import React, { useState, useEffect } from "react";
import { PropertyData } from "../../types/property";

// 共通スタイル (GraphPageから移動)
const modalButtonClass = "py-1.5 px-4 rounded-md cursor-pointer transition-colors";
const modalConfirmButtonClass = `${modalButtonClass} bg-blue-500 text-white hover:bg-blue-600`;
const modalCancelButtonClass = `${modalButtonClass} bg-gray-200 text-gray-800 hover:bg-gray-300`;
const modalInputClass = "py-1.5 px-2.5 text-sm rounded-md border border-gray-300 w-full";

// このコンポーネントが受け取るProps
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PropertyData) => void;
  // 編集時は初期データ、新規追加時は null を受け取る
  initialData: PropertyData | null;
};

// 新規追加時の空のフォーム
const emptyForm: PropertyData = {
  ビル名: "",
  契約日: "",
  減価償却: 0,
  法定耐用年数: 0,
  元金: 0,
  ローンの期限: "",
  元金の支払いタイプ: "毎月",
};

// フォームの入力タイプを返すヘルパー関数 (GraphPageから移動)
const getInputType = (key: string): string => {
  if (["契約日", "ローンの期限"].includes(key)) return "date";
  if (["減価償却", "法定耐用年数", "元金"].includes(key)) return "number";
  return "text"; // ビル名など
};

export const AddBuildingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  // モーダルが自身のフォーム状態を管理する
  const [form, setForm] = useState<PropertyData>(emptyForm);

  // isOpenまたはinitialDataが変更されたら、フォームの状態を同期する
  useEffect(() => {
    if (isOpen) {
      // 編集データがあればそれをセット、なければ空のフォームをセット
      setForm(initialData || emptyForm);
    } else {
      // 閉じたときにフォームをリセット
      setForm(emptyForm);
    }
  }, [isOpen, initialData]);

  const handleChange = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // モーダルが開いていなければ何もレンダリングしない
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
      <div className="bg-white p-6 py-8 rounded-lg w-96 shadow-xl max-h-[80vh] overflow-y-auto">
        <h3 className="mt-0 mb-4 text-xl font-semibold">
          {initialData ? "仮想ビルを編集" : "仮想ビルを追加"}
        </h3>
        
        {["ビル名", "契約日", "減価償却", "法定耐用年数", "元金", "ローンの期限"].map(
          (key) => (
            <div key={key} className="mb-3 flex flex-col">
              <label className="mb-1 font-medium text-sm">{key}：</label>
              <input
                type={getInputType(key)}
                className={modalInputClass}
                value={(form as any)[key]?.toString() ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const newValue = ["減価償却", "法定耐用年数", "元金"].includes(
                    key
                  )
                    ? Number(value)
                    : value;
                  handleChange(key, newValue);
                }}
              />
            </div>
          )
        )}
        
        <div className="flex justify-end gap-4 mt-5">
          <button
            onClick={() => onSave(form)}
            className={modalConfirmButtonClass}
          >
            保存
          </button>
          <button onClick={onClose} className={modalCancelButtonClass}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};