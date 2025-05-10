import React from "react";

type UploadButtonProps = {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const UploadButton: React.FC<UploadButtonProps> = ({ onFileChange }) => {
  return (
    <>
      <label className="upload-btn" htmlFor="excelInput">
        CSVファイルをアップロード
      </label>
      <input
        type="file"
        id="excelInput"
        accept=".csv,.xlsx,.xls"
        onChange={onFileChange}
        style={{ display: "none" }}
      />
    </>
  );
};

export default UploadButton;
