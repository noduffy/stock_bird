// src/App.tsx

import {
  // MemoryRouter as Router, // ← これを削除
  HashRouter as Router,   // ← これに変更
  Routes,
  Route,
} from "react-router-dom";
import MainPage from "./pages/MainPage";
import GraphPage from "./pages/GraphPage";
import BuildingList from "./pages/BuildingList";

const App = () => {
  return (
    <Router> {/* ← ここが HashRouter になります */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/graph" element={<GraphPage />} />
        <Route path="/building-list" element={<BuildingList />} />
      </Routes>
    </Router>
  );
};

export default App;