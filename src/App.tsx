import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import GraphPage from "./pages/GraphPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/graph" element={<GraphPage />} />
      </Routes>
    </Router>
  );
};

export default App;
