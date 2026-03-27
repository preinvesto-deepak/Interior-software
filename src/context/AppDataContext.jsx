import { createContext, useContext, useEffect, useState } from "react";
import { projectList } from "../data/projectData";
import { subProjectList } from "../data/subProjectData";
import { dimensionEntries } from "../data/dimensionData";
import { priceList } from "../data/priceData";
import { templateList } from "../data/templateData";

const AppDataContext = createContext();

const STORAGE_KEY = "interior_app_data_v1";

const defaultData = {
  projects: projectList,
  subProjects: subProjectList,
  dimensions: dimensionEntries,
  prices: priceList,
  selectedTemplateId: String(templateList[0]?.id || ""),
  generatedParts: [],
  configuredWardrobe: null,
  wardrobeRecords: [],
  editingWardrobeRecordId: null,
};

function getInitialData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return defaultData;

    const parsed = JSON.parse(savedData);

    return {
      projects: parsed.projects || projectList,
      subProjects: parsed.subProjects || subProjectList,
      dimensions: parsed.dimensions || dimensionEntries,
      prices: parsed.prices || priceList,
      selectedTemplateId:
        parsed.selectedTemplateId || String(templateList[0]?.id || ""),
      generatedParts: parsed.generatedParts || [],
      configuredWardrobe: parsed.configuredWardrobe || null,
      wardrobeRecords: parsed.wardrobeRecords || [],
      editingWardrobeRecordId: parsed.editingWardrobeRecordId || null,
    };
  } catch (error) {
    return defaultData;
  }
}

function AppDataProvider({ children }) {
  const initialData = getInitialData();

  const [projects, setProjects] = useState(initialData.projects);
  const [subProjects, setSubProjects] = useState(initialData.subProjects);
  const [dimensions, setDimensions] = useState(initialData.dimensions);
  const [prices, setPrices] = useState(initialData.prices);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.selectedTemplateId
  );
  const [generatedParts, setGeneratedParts] = useState(initialData.generatedParts);
  const [configuredWardrobe, setConfiguredWardrobe] = useState(
    initialData.configuredWardrobe
  );
  const [wardrobeRecords, setWardrobeRecords] = useState(
    initialData.wardrobeRecords
  );
  const [editingWardrobeRecordId, setEditingWardrobeRecordId] = useState(
    initialData.editingWardrobeRecordId
  );

  useEffect(() => {
    const dataToSave = {
      projects,
      subProjects,
      dimensions,
      prices,
      selectedTemplateId,
      generatedParts,
      configuredWardrobe,
      wardrobeRecords,
      editingWardrobeRecordId,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    projects,
    subProjects,
    dimensions,
    prices,
    selectedTemplateId,
    generatedParts,
    configuredWardrobe,
    wardrobeRecords,
    editingWardrobeRecordId,
  ]);

  const resetAllData = () => {
    setProjects([]);
    setSubProjects([]);
    setDimensions([]);
    setPrices([]);
    setSelectedTemplateId(String(templateList[0]?.id || ""));
    setGeneratedParts([]);
    setConfiguredWardrobe(null);
    setWardrobeRecords([]);
    setEditingWardrobeRecordId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const restoreSampleData = () => {
    setProjects(projectList);
    setSubProjects(subProjectList);
    setDimensions(dimensionEntries);
    setPrices(priceList);
    setSelectedTemplateId(String(templateList[0]?.id || ""));
    setGeneratedParts([]);
    setConfiguredWardrobe(null);
    setWardrobeRecords([]);
    setEditingWardrobeRecordId(null);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        projects: projectList,
        subProjects: subProjectList,
        dimensions: dimensionEntries,
        prices: priceList,
        selectedTemplateId: String(templateList[0]?.id || ""),
        generatedParts: [],
        configuredWardrobe: null,
        wardrobeRecords: [],
        editingWardrobeRecordId: null,
      })
    );
  };

  return (
    <AppDataContext.Provider
      value={{
        projects,
        setProjects,
        subProjects,
        setSubProjects,
        dimensions,
        setDimensions,
        prices,
        setPrices,
        selectedTemplateId,
        setSelectedTemplateId,
        generatedParts,
        setGeneratedParts,
        configuredWardrobe,
        setConfiguredWardrobe,
        wardrobeRecords,
        setWardrobeRecords,
        editingWardrobeRecordId,
        setEditingWardrobeRecordId,
        resetAllData,
        restoreSampleData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

function useAppData() {
  return useContext(AppDataContext);
}

export { AppDataProvider, useAppData };