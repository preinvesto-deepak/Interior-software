import { useMemo, useState } from "react";
import { useAppData } from "../context/AppDataContext";

function ProjectBOQ() {
  const { projects, wardrobeRecords, prices } = useAppData();

  const [selectedProject, setSelectedProject] = useState(
    projects[0]?.name || ""
  );

  const projectRecords = useMemo(() => {
    return wardrobeRecords.filter(
      (record) => record.projectName === selectedProject
    );
  }, [wardrobeRecords, selectedProject]);

  const lineItems = useMemo(() => {
    return projectRecords.map((record) => {
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

      const totalAmount =
        woodAmount +
        Number(record.laminateAmount || 0) +
        Number(record.edgeBandAmount || 0) +
        hardwareAmount +
        Number(record.glueAmount || 0) +
        Number(record.drawerAmount || 0) +
        Number(record.frontFrameAmount || 0) +
        Number(record.laborAmount || 0) +
        Number(record.transportAmount || 0);

      return {
        ...record,
        hardwareItems: normalizedHardwareItems,
        hardwareAmount,
        woodAmount,
        totalAmount,
      };
    });
  }, [projectRecords, prices]);

  const hardwareSummary = useMemo(() => {
    const grouped = {};

    lineItems.forEach((record) => {
      (record.hardwareItems || []).forEach((item) => {
        const key = item.itemName || "Hardware";
        if (!grouped[key]) {
          grouped[key] = {
            itemName: key,
            qty: 0,
            amount: 0,
          };
        }
        grouped[key].qty += Number(item.qty || 0);
        grouped[key].amount += Number(item.amount || 0);
      });
    });

    return Object.values(grouped);
  }, [lineItems]);

  const totalWood = lineItems.reduce((sum, item) => sum + item.woodAmount, 0);
  const totalLaminate = lineItems.reduce(
    (sum, item) => sum + Number(item.laminateAmount || 0),
    0
  );
  const totalEdgeBand = lineItems.reduce(
    (sum, item) => sum + Number(item.edgeBandAmount || 0),
    0
  );
  const totalHardware = lineItems.reduce(
    (sum, item) => sum + Number(item.hardwareAmount || 0),
    0
  );
  const totalGlue = lineItems.reduce(
    (sum, item) => sum + Number(item.glueAmount || 0),
    0
  );
  const totalDrawer = lineItems.reduce(
    (sum, item) => sum + Number(item.drawerAmount || 0),
    0
  );
  const totalFrontFrame = lineItems.reduce(
    (sum, item) => sum + Number(item.frontFrameAmount || 0),
    0
  );
  const totalLabor = lineItems.reduce(
    (sum, item) => sum + Number(item.laborAmount || 0),
    0
  );
  const totalTransport = lineItems.reduce(
    (sum, item) => sum + Number(item.transportAmount || 0),
    0
  );

  const subTotal =
    totalWood +
    totalLaminate +
    totalEdgeBand +
    totalHardware +
    totalGlue +
    totalDrawer +
    totalFrontFrame +
    totalLabor +
    totalTransport;

  const gstPercent = 18;
  const gstAmount = (subTotal * gstPercent) / 100;
  const grandTotal = subTotal + gstAmount;

  return (
    <div className="page-card">
      <h2>Project BOQ</h2>

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
          {projects.map((project) => (
            <option key={project.id} value={project.name}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <p><strong>Project:</strong> {selectedProject || "-"}</p>
      <p><strong>Total Items:</strong> {lineItems.length}</p>

      {lineItems.length === 0 ? (
        <p>No wardrobe records found for this project.</p>
      ) : (
        <>
          <h3>Project Item Summary</h3>
          <table border="1" cellPadding="10" cellSpacing="0" width="100%">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Name</th>
                <th>Sub Project</th>
                <th>Door Type</th>
                <th>Hardware</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.itemName}</td>
                  <td>{item.subProjectName}</td>
                  <td>{item.doorType || "-"}</td>
                  <td>{item.hardwareAmount}</td>
                  <td>{item.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {hardwareSummary.length > 0 && (
            <>
              <h3 style={{ marginTop: "24px" }}>Project Hardware Summary</h3>
              <table border="1" cellPadding="10" cellSpacing="0" width="100%">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Hardware Item</th>
                    <th>Total Qty</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {hardwareSummary.map((item, index) => (
                    <tr key={`${item.itemName}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{item.itemName}</td>
                      <td>{item.qty}</td>
                      <td>{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <h3 style={{ marginTop: "24px" }}>Project Cost Summary</h3>
          <table border="1" cellPadding="10" cellSpacing="0" width="100%">
            <tbody>
              <tr><td>Wood / Sheet Material</td><td>{totalWood}</td></tr>
              <tr><td>Laminate</td><td>{totalLaminate}</td></tr>
              <tr><td>Edge Band</td><td>{totalEdgeBand}</td></tr>
              <tr><td>Hardware</td><td>{totalHardware}</td></tr>
              <tr><td>Glue / Adhesive</td><td>{totalGlue}</td></tr>
              <tr><td>Drawer</td><td>{totalDrawer}</td></tr>
              <tr><td>Front Frame</td><td>{totalFrontFrame}</td></tr>
              <tr><td>Labor</td><td>{totalLabor}</td></tr>
              <tr><td>Transport</td><td>{totalTransport}</td></tr>
              <tr><td><strong>Sub Total</strong></td><td><strong>{subTotal}</strong></td></tr>
              <tr><td>GST {gstPercent}%</td><td>{gstAmount}</td></tr>
              <tr><td><strong>Grand Total</strong></td><td><strong>{grandTotal}</strong></td></tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default ProjectBOQ;