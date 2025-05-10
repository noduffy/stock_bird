import React from "react";
// import Papa from "papaparse";
// import type { ParseResult } from "papaparse";
import { useNavigate } from "react-router-dom";
import UploadButton from "../components/UploadButton";
// import { PropertyData } from "../types/property";
import "../Main.css";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const MainPage = () => {
  const navigate = useNavigate();

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   Papa.parse<PropertyData>(file, {
  //     header: true,
  //     skipEmptyLines: true,
  //     complete: (result: ParseResult<PropertyData>) => {
  //       navigate("/graph", { state: { parsedData: result.data } });
  //     },
  //   });
  // };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, {
        type: "array",
        codepage: 65001,
        cellDates: true,
      });
    
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
    
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    
      console.log("読み込んだデータ:", jsonData);
      const cleanedData = jsonData.map((item: any) => ({
        ビル名: item["ビル名"],
        契約日: dayjs(item["契約日"]).format("YYYY-MM-DD"),
        減価償却: item["減価償却"],
        法定耐用年数: item["法定耐用年数"],
        元金: item["元金"],
        ローンの期限: dayjs(item["ローンの期限"]).format("YYYY-MM-DD"),
        元金の支払いタイプ: item["元金の支払いタイプ"],
      }));
    
      navigate("/graph", { state: { parsedData: cleanedData } });
    };
    
  
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container">
      <h1>不動産データ管理アプリ</h1>
      <UploadButton onFileChange={handleFileChange} />
      <a href="/template.csv" className="download-link" download>
        テンプレートCSVをダウンロード
      </a>
    </div>
  );
};

export default MainPage;
