import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import TablePage from "./TablePage";
import EnzymeQuantificationPage from "./components/EnzymeQuantificationPage";
import EnzymeAnalytics from "./components/EnzymeAnalytics";
import EnzymeQuantificationModule from "./components/EnzymeQuantificationModule";
import { DataProvider } from "./context/DataContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/table" element={<TablePage />} />
          <Route path="/enzyme-quantification" element={<EnzymeQuantificationPage />} />
          <Route path="/enzyme-analytics" element={<EnzymeAnalytics />} />
          <Route path="/enzyme-quantification-module" element={<EnzymeQuantificationModule />} />
        </Routes>
      </Router>
    </DataProvider>
  </React.StrictMode>
);
