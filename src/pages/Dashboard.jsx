import { Link } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";

function Dashboard() {
  const {
    projects,
    subProjects,
    dimensions,
    prices,
    generatedParts,
    configuredWardrobe,
    wardrobeRecords,
    resetAllData,
    restoreSampleData,
  } = useAppData();

  const recentDimensions = [...dimensions].slice(-5).reverse();

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "18px",
  };

  const quickLinkStyle = {
    display: "block",
    textDecoration: "none",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "16px",
    background: "#ffffff",
    color: "#111827",
    fontWeight: "bold",
  };

  const handleResetAllData = () => {
    const confirmReset = window.confirm(
      "This will clear all current app data. Do you want to continue?"
    );

    if (!confirmReset) return;
    resetAllData();
  };

  const handleRestoreSampleData = () => {
    const confirmRestore = window.confirm(
      "This will restore the original sample data. Do you want to continue?"
    );

    if (!confirmRestore) return;
    restoreSampleData();
  };

  return (
    <div className="page-card">
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button onClick={handleResetAllData}>Reset All App Data</button>
        <button onClick={handleRestoreSampleData}>Restore Sample Data</button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "24px",
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Projects</h3>
          <p style={{ fontSize: "24px", marginBottom: 0 }}>{projects.length}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Sub Projects</h3>
          <p style={{ fontSize: "24px", marginBottom: 0 }}>{subProjects.length}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Dimension Items</h3>
          <p style={{ fontSize: "24px", marginBottom: 0 }}>{dimensions.length}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Pricing Items</h3>
          <p style={{ fontSize: "24px", marginBottom: 0 }}>{prices.length}</p>
        </div>
      
      <div style={cardStyle}>
         <h3 style={{ marginTop: 0 }}>Wardrobe Records</h3>
         <p style={{ fontSize: "24px", marginBottom: 0 }}>{wardrobeRecords.length}</p>
      </div>
      </div>
      
      <h3>Quick Actions</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          marginBottom: "24px",
        }}
      >
        <Link to="/projects" style={quickLinkStyle}>Go to Projects</Link>
        <Link to="/sub-projects" style={quickLinkStyle}>Go to Sub Projects</Link>
        <Link to="/template-master" style={quickLinkStyle}>Go to Template Master</Link>
        <Link to="/wardrobe-configurator" style={quickLinkStyle}>Go to Wardrobe Configurator</Link>
        <Link to="/cut-sheet-output" style={quickLinkStyle}>Go to Cut Sheet Output</Link>
        <Link to="/quotation" style={quickLinkStyle}>Go to Quotation</Link>
      </div>

      <div
        style={{
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "16px",
          background: "#ffffff",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Generated Wardrobe Summary</h3>

        {configuredWardrobe ? (
          <>
            <p><strong>Template:</strong> {configuredWardrobe.templateName}</p>
            <p><strong>Width:</strong> {configuredWardrobe.widthMm} mm</p>
            <p><strong>Height:</strong> {configuredWardrobe.heightMm} mm</p>
            <p><strong>Depth:</strong> {configuredWardrobe.depthMm} mm</p>
            <p><strong>Generated Parts Count:</strong> {generatedParts.length}</p>
          </>
        ) : (
          <p>No wardrobe configuration saved yet.</p>
        )}
      </div>

      <h3>Recent Dimension Entries</h3>

      <table border="1" cellPadding="10" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Project</th>
            <th>Sub Project</th>
            <th>Item</th>
            <th>Material</th>
          </tr>
        </thead>
        <tbody>
          {recentDimensions.length > 0 ? (
            recentDimensions.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>{entry.projectName}</td>
                <td>{entry.subProjectName}</td>
                <td>{entry.itemName}</td>
                <td>{entry.materialName}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No dimension entries available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;