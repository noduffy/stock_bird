import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import GraphPage from "./pages/GraphPage";
import BuildingList from "./pages/BuildingList";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/graph" element={<GraphPage />} />
        <Route path="/building-list" element={<BuildingList />} />
      </Routes>
    </Router>
  );
};

export default App;
