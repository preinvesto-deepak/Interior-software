import { useNavigate } from "react-router-dom";
import { templateList } from "../data/templateData";
import { mmToFeet, roundTo2 } from "../utils/unitConversions";
import { useAppData } from "../context/AppDataContext";

function TemplateMaster() {
  const navigate = useNavigate();
  const { selectedTemplateId, setSelectedTemplateId } = useAppData();

  const handleUseTemplate = (templateId) => {
    setSelectedTemplateId(String(templateId));
    navigate("/wardrobe-configurator");
  };

  return (
    <div className="page-card">
      <h2>Template Master</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {templateList.map((template) => {
          const isSelected = String(template.id) === String(selectedTemplateId);

          return (
            <div
              key={template.id}
              style={{
                border: isSelected
                  ? "2px solid #2563eb"
                  : "1px solid #d1d5db",
                borderRadius: "12px",
                padding: "16px",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  height: "180px",
                  borderRadius: "10px",
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                Wardrobe Sample Image
              </div>

              <h3 style={{ marginTop: 0 }}>{template.templateName}</h3>
              <p><strong>Type:</strong> {template.templateType}</p>
              <p>{template.description}</p>

              <div style={{ marginTop: "12px" }}>
                <p><strong>Default Values (Input in mm)</strong></p>
                <p>
                  Width: {template.defaultValues.widthMm} mm
                  {" "}({roundTo2(mmToFeet(template.defaultValues.widthMm))} ft)
                </p>
                <p>
                  Height: {template.defaultValues.heightMm} mm
                  {" "}({roundTo2(mmToFeet(template.defaultValues.heightMm))} ft)
                </p>
                <p>
                  Depth: {template.defaultValues.depthMm} mm
                  {" "}({roundTo2(mmToFeet(template.defaultValues.depthMm))} ft)
                </p>
                <p>Doors H: {template.defaultValues.doorsH}</p>
                <p>Doors V: {template.defaultValues.doorsV}</p>
                <p>Back Parts: {template.defaultValues.backParts}</p>
                <p>Partitions: {template.defaultValues.partitions}</p>
                <p>Shelves: {template.defaultValues.shelves}</p>
                <p>Front Frame: {template.defaultValues.frontFrame}</p>

                <button
                  style={{ marginTop: "10px" }}
                  onClick={() => handleUseTemplate(template.id)}
                >
                  Use Template
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TemplateMaster;