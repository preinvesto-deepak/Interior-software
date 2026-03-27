import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { mmToFeet, sqMmToSqFt, roundTo2 } from "../utils/unitConversions";
import { useState } from "react";

function WardrobeRecords() {
  const navigate = useNavigate();

  const {
    projects,
    prices,
    wardrobeRecords,
    setWardrobeRecords,
    setConfiguredWardrobe,
    setGeneratedParts,
    setSelectedTemplateId,
    setEditingWardrobeRecordId,
  } = useAppData();

  const [selectedProject, setSelectedProject] = useState("All");
  const [searchText, setSearchText] = useState("");

  const handleOpenRecord = (record) => {
    setConfiguredWardrobe(record);
    setGeneratedParts(record.parts || []);
    setSelectedTemplateId(String(record.templateId || ""));
    setEditingWardrobeRecordId(null);
    alert("Wardrobe record loaded");
  };

  const handleEditRecord = (record) => {
    setConfiguredWardrobe(record);
    setGeneratedParts(record.parts || []);
    setSelectedTemplateId(String(record.templateId || ""));
    setEditingWardrobeRecordId(record.id);
    navigate("/wardrobe-configurator");
  };

  const handleDeleteRecord = (id) => {
    const confirmDelete = window.confirm(
      "Do you want to delete this wardrobe record?"
    );

    if (!confirmDelete) return;

    const updated = wardrobeRecords.filter((record) => record.id !== id);
    setWardrobeRecords(updated);
  };

  const filteredRecords = wardrobeRecords.filter((record) => {
    const matchesProject =
      selectedProject === "All" || record.projectName === selectedProject;

    const value = searchText.toLowerCase();

    const hardwareNames = Array.isArray(record.hardwareItems)
      ? record.hardwareItems.map((item) => item.itemName || "").join(" ").toLowerCase()
      : "";

    const matchesSearch =
      String(record.projectName || "").toLowerCase().includes(value) ||
      String(record.subProjectName || "").toLowerCase().includes(value) ||
      String(record.itemName || "").toLowerCase().includes(value) ||
      String(record.templateName || "").toLowerCase().includes(value) ||
      String(record.doorType || "").toLowerCase().includes(value) ||
      String(record.specification || "").toLowerCase().includes(value) ||
      String(record.remarks || "").toLowerCase().includes(value) ||
      hardwareNames.includes(value);

    return matchesProject && matchesSearch;
  });

  return (
    <div className="page-card">
      <h2>Wardrobe Records</h2>

      <div
        style={{
          display: "grid",
          gap: "10px",
          maxWidth: "360px",
          marginBottom: "20px",
        }}
      >
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="All">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.name}>
              {project.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by item, door type, spec, remarks, hardware"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <table border="1" cellPadding="10" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Project</th>
            <th>Sub Project</th>
            <th>Item Name</th>
            <th>Door Type</th>
            <th>Specification</th>
            <th>Remarks</th>
            <th>Template</th>
            <th>Width</th>
            <th>Height</th>
            <th>Depth</th>
            <th>Total Area</th>
            <th>Hardware Items</th>
            <th>Hardware Amount</th>
            <th>Estimated Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => {
              const totalAreaSqMm = (record.parts || []).reduce((total, part) => {
                return total + Number(part.lengthMm) * Number(part.widthMm) * Number(part.qty);
              }, 0);

              const sheetArea = 2440 * 1220;

              const materialGroups = (record.parts || []).reduce((acc, part) => {
                const key = part.material || "Unknown";
                const partArea =
                  Number(part.lengthMm) * Number(part.widthMm) * Number(part.qty);

                if (!acc[key]) {
                  acc[key] = {
                    material: key,
                    totalAreaSqMm: 0,
                  };
                }

                acc[key].totalAreaSqMm += partArea;
                return acc;
              }, {});

              const woodAmount = Object.values(materialGroups).reduce((total, group) => {
                const materialRateData = prices.find(
                  (item) => item.materialName === group.material
                );
                const requiredSheets =
                  sheetArea > 0 ? Math.ceil(group.totalAreaSqMm / sheetArea) : 0;
                const sheetRate = materialRateData ? Number(materialRateData.rate) : 0;
                return total + requiredSheets * sheetRate;
              }, 0);

              const hardwareItems = Array.isArray(record.hardwareItems)
                ? record.hardwareItems
                : [];

              const normalizedHardwareItems = hardwareItems
                .map((item) => ({
                  ...item,
                  amount: Number(item.qty || 0) * Number(item.rate || 0),
                }))
                .filter(
                  (item) =>
                    String(item.itemName || "").trim() !== "" ||
                    Number(item.qty || 0) > 0 ||
                    Number(item.rate || 0) > 0
                );

              const hardwareAmount =
                normalizedHardwareItems.length > 0
                  ? normalizedHardwareItems.reduce((sum, item) => sum + item.amount, 0)
                  : Number(record.hardwareAmount || 0);

              const estimatedTotal =
                woodAmount +
                Number(record.laminateAmount || 0) +
                Number(record.edgeBandAmount || 0) +
                hardwareAmount +
                Number(record.glueAmount || 0) +
                Number(record.drawerAmount || 0) +
                Number(record.frontFrameAmount || 0) +
                Number(record.laborAmount || 0) +
                Number(record.transportAmount || 0);

              return (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.projectName}</td>
                  <td>{record.subProjectName}</td>
                  <td>{record.itemName}</td>
                  <td>{record.doorType || "-"}</td>
                  <td>{record.specification || "-"}</td>
                  <td>{record.remarks || "-"}</td>
                  <td>{record.templateName}</td>
                  <td>{record.widthMm} mm ({roundTo2(mmToFeet(record.widthMm))} ft)</td>
                  <td>{record.heightMm} mm ({roundTo2(mmToFeet(record.heightMm))} ft)</td>
                  <td>{record.depthMm} mm ({roundTo2(mmToFeet(record.depthMm))} ft)</td>
                  <td>{roundTo2(sqMmToSqFt(totalAreaSqMm))} sq ft</td>
                  <td>{normalizedHardwareItems.length}</td>
                  <td>{hardwareAmount}</td>
                  <td>{estimatedTotal}</td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleOpenRecord(record)}>Open</button>
                    <button onClick={() => handleEditRecord(record)}>Edit</button>
                    <button onClick={() => handleDeleteRecord(record.id)}>Delete</button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="16">No wardrobe records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default WardrobeRecords;