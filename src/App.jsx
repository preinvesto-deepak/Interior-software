import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import SubProjects from "./pages/SubProjects";
import TemplateMaster from "./pages/TemplateMaster";
import WardrobeConfigurator from "./pages/WardrobeConfigurator";
import WardrobeRecords from "./pages/WardrobeRecords";
import ItemsPricing from "./pages/ItemsPricing";
import DimensionsEntry from "./pages/DimensionsEntry";
import CutSheetOutput from "./pages/CutSheetOutput";
import BOQ from "./pages/BOQ";
import ProjectBOQ from "./pages/ProjectBOQ";
import Quotation from "./pages/Quotation";
import ProjectQuotation from "./pages/ProjectQuotation";
import "./App.css";

function PageHeader() {
  const location = useLocation();

  const pageTitles = {
    "/": "Dashboard",
    "/projects": "Projects",
    "/sub-projects": "Sub Projects",
    "/template-master": "Template Master",
    "/wardrobe-configurator": "Wardrobe Configurator",
    "/wardrobe-records": "Wardrobe Records",
    "/items-pricing": "Items Pricing",
    "/dimensions-entry": "Dimensions Entry",
    "/cut-sheet-output": "Cut Sheet Output",
    "/boq": "BOQ",
    "/quotation": "Quotation",
  };

  return (
    <div className="page-header">
      <h1>{pageTitles[location.pathname] || "Interior App"}</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <div className="main-content">
          <PageHeader />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/sub-projects" element={<SubProjects />} />
            <Route path="/template-master" element={<TemplateMaster />} />
            <Route path="/wardrobe-configurator" element={<WardrobeConfigurator />} />
            <Route path="/wardrobe-records" element={<WardrobeRecords />} />
            <Route path="/items-pricing" element={<ItemsPricing />} />
            <Route path="/dimensions-entry" element={<DimensionsEntry />} />
            <Route path="/cut-sheet-output" element={<CutSheetOutput />} />
            <Route path="/boq" element={<BOQ />} />
            <Route path="/project-boq" element={<ProjectBOQ />} />
            <Route path="/quotation" element={<Quotation />} />
            <Route path="/project-quotation" element={<ProjectQuotation />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;