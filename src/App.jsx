import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import SubProjects from "./pages/SubProjects";
import TemplateMaster from "./pages/TemplateMaster";
import WardrobeConfigurator from "./pages/WardrobeConfigurator";
import WardrobeRecords from "./pages/WardrobeRecords";
import ItemsPricing from "./pages/ItemsPricing";
import MaterialModels from "./pages/MaterialModels";
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
    "/projects": "Projects & Rooms",
    "/sub-projects": "Projects & Rooms",
    "/template-master": "Templates",
    "/wardrobe-configurator": "Configurator",
    "/wardrobe-records": "Saved Records",
    "/items-pricing": "Items Pricing",
    "/material-models": "Material Models",
    "/dimensions-entry": "Dimensions Entry",
    "/cut-sheet-output": "Cut Sheet",
    "/boq": "BOQ",
    "/project-boq": "Project BOQ",
    "/quotation": "Quotation",
    "/project-quotation": "Project Quotation",
  };

  const noHeader = ["/items-pricing", "/material-models"];
  if (noHeader.includes(location.pathname)) return null;

  return (
    <div className="page-header">
      <h1>{pageTitles[location.pathname] || "Interior App"}</h1>
    </div>
  );
}

const NO_PAD_TOP_ROUTES = ["/items-pricing"];

function AppLayout() {
  const location = useLocation();
  const noPadTop = ["/items-pricing", "/material-models"].includes(location.pathname);

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content" style={noPadTop ? { paddingTop: 0 } : {}}>
        <PageHeader />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/sub-projects" element={<SubProjects />} />
          <Route path="/template-master" element={<TemplateMaster />} />
          <Route path="/wardrobe-configurator" element={<WardrobeConfigurator />} />
          <Route path="/wardrobe-records" element={<WardrobeRecords />} />
          <Route path="/items-pricing" element={<ItemsPricing />} />
          <Route path="/material-models" element={<MaterialModels />} />
          <Route path="/dimensions-entry" element={<DimensionsEntry />} />
          <Route path="/cut-sheet-output" element={<CutSheetOutput />} />
          <Route path="/boq" element={<BOQ />} />
          <Route path="/project-boq" element={<ProjectBOQ />} />
          <Route path="/quotation" element={<Quotation />} />
          <Route path="/project-quotation" element={<ProjectQuotation />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;