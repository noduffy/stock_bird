// src/main.tsx (全コード・修正版)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";

import "react-datepicker/dist/react-datepicker.css"; // DatepickerのCSS
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { ja } from "date-fns/locale/ja"; // 日本語ロケール

// Datepickerをグローバルで日本語化
registerLocale("ja", ja);
setDefaultLocale("ja");

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);