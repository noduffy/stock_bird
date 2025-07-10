import React from "react";

const DownloadTemplateButton: React.FC = () => {
  const handleDownload = () => {
    const header = [
      "ビル名,契約日,減価償却,法定耐用年数,元金,ローンの期限,元金の支払いタイプ",
    ];
    const rows = [
      "サンプルビルA,2022-04-01,15000000,30,38000000,2042-04-01,元利均等",
      "サンプルビルB,2021-06-15,12000000,28,25000000,2041-06-15,元金均等",
    ];

    const csvContent = [header, ...rows].join("\n");
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]); // UTF-8 BOM

    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <label
        className="download-btn"
        onClick={handleDownload}
        style={{ cursor: "pointer" }}
      >
        テンプレートCSVをダウンロード
      </label>
    </>
  );
};

export default DownloadTemplateButton;
