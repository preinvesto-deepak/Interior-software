import { useState } from "react";
import { useAppData } from "../context/AppDataContext";

function BOQ() {
  const { generatedParts, configuredWardrobe, prices } = useAppData();

  const STANDARD_SHEET_LENGTH = 2400;
  const STANDARD_SHEET_WIDTH = 1200;

  const [sheetLength, setSheetLength] = useState(2440);
  const [sheetWidth, setSheetWidth] = useState(1220);

  if (generatedParts.length === 0 || !configuredWardrobe) {
    return (
      <div className="page-card">
        <h2>BOQ</h2>
        <p>
          No generated parts available. Please save parts from Wardrobe
          Configurator first.
        </p>
      </div>
    );
  }

  const hardwareItems = Array.isArray(configuredWardrobe.hardwareItems)
    ? configuredWardrobe.hardwareItems
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
      : Number(configuredWardrobe.hardwareAmount || 0);

  const canFitInSheet = (lengthMm, widthMm) => {
    return (
      (lengthMm <= STANDARD_SHEET_LENGTH &&
        widthMm <= STANDARD_SHEET_WIDTH) ||
      (lengthMm <= STANDARD_SHEET_WIDTH &&
        widthMm <= STANDARD_SHEET_LENGTH)
    );
  };

  const invalidParts = generatedParts.filter(
    (part) => !canFitInSheet(part.lengthMm, part.widthMm)
  );

  if (invalidParts.length > 0) {
    return (
      <div className="page-card">
        <h2>BOQ</h2>
        <p>
          <strong>Project:</strong> {configuredWardrobe.projectName}
        </p>
        <p>
          <strong>Sub Project:</strong> {configuredWardrobe.subProjectName}
        </p>
        <p>
          <strong>Item Name:</strong> {configuredWardrobe.itemName}
        </p>
        <p>
          <strong>Door Type:</strong> {configuredWardrobe.doorType || "-"}
        </p>
        <p>
          <strong>Specification:</strong>{" "}
          {configuredWardrobe.specification || "-"}
        </p>
        <p>
          <strong>Remarks:</strong> {configuredWardrobe.remarks || "-"}
        </p>

        <div
          style={{
            marginTop: "20px",
            padding: "14px",
            border: "1px solid #dc2626",
            background: "#fef2f2",
            borderRadius: "10px",
          }}
        >
          <p>
            <strong>BOQ blocked:</strong> Some parts exceed standard sheet size
            2400 x 1200 mm.
          </p>
          {invalidParts.map((part) => (
            <p key={part.id}>
              {part.partName}: {part.lengthMm} x {part.widthMm} mm
            </p>
          ))}
        </div>
      </div>
    );
  }

  const sheetArea = Number(sheetLength) * Number(sheetWidth);

  const materialGroups = generatedParts.reduce((acc, part) => {
    const key = part.material || "Unknown";
    const partArea =
      Number(part.lengthMm) * Number(part.widthMm) * Number(part.qty);

    if (!acc[key]) {
      acc[key] = {
        material: key,
        totalAreaSqMm: 0,
        totalQty: 0,
      };
    }

    acc[key].totalAreaSqMm += partArea;
    acc[key].totalQty += Number(part.qty);

    return acc;
  }, {});

  const groupedRows = Object.values(materialGroups).map((group) => {
    const materialRateData = prices.find(
      (item) => item.materialName === group.material
    );

    const requiredSheets =
      sheetArea > 0 ? Math.ceil(group.totalAreaSqMm / sheetArea) : 0;

    const sheetRate = materialRateData ? Number(materialRateData.rate) : 0;
    const basicAmount = sheetRate * requiredSheets;

    return {
      material: group.material,
      totalQty: group.totalQty,
      totalAreaSqMm: group.totalAreaSqMm,
      requiredSheets,
      sheetRate,
      basicAmount,
      priceFound: !!materialRateData,
    };
  });

  const woodAmount = groupedRows.reduce(
    (total, row) => total + row.basicAmount,
    0
  );
  const laminateAmount = Number(configuredWardrobe.laminateAmount || 0);
  const edgeBandAmount = Number(configuredWardrobe.edgeBandAmount || 0);
  const glueAmount = Number(configuredWardrobe.glueAmount || 0);
  const drawerAmount = Number(configuredWardrobe.drawerAmount || 0);
  const frontFrameAmount = Number(configuredWardrobe.frontFrameAmount || 0);
  const laborAmount = Number(configuredWardrobe.laborAmount || 0);
  const transportAmount = Number(configuredWardrobe.transportAmount || 0);

  const subTotal =
    woodAmount +
    laminateAmount +
    edgeBandAmount +
    hardwareAmount +
    glueAmount +
    drawerAmount +
    frontFrameAmount +
    laborAmount +
    transportAmount;

  const gstPercent = 18;
  const gstAmount = (subTotal * gstPercent) / 100;
  const grandTotal = subTotal + gstAmount;

  const grandTotalArea = groupedRows.reduce(
    (total, row) => total + row.totalAreaSqMm,
    0
  );

  return (
    <div className="page-card">
      <h2>BOQ</h2>

      <p>
        <strong>Project:</strong> {configuredWardrobe.projectName}
      </p>
      <p>
        <strong>Sub Project:</strong> {configuredWardrobe.subProjectName}
      </p>
      <p>
        <strong>Item Name:</strong> {configuredWardrobe.itemName}
      </p>
      <p>
        <strong>Door Type:</strong> {configuredWardrobe.doorType || "-"}
      </p>
      <p>
        <strong>Specification:</strong> {configuredWardrobe.specification || "-"}
      </p>
      <p>
        <strong>Remarks:</strong> {configuredWardrobe.remarks || "-"}
      </p>
      <p>
        <strong>Template:</strong> {configuredWardrobe.templateName}
      </p>

      <div
        style={{
          marginBottom: "20px",
          padding: "16px",
          border: "1px solid #d1d5db",
          borderRadius: "10px",
          background: "#ffffff",
        }}
      >
        <p>
          <strong>Wardrobe Width:</strong> {configuredWardrobe.widthMm} mm
        </p>
        <p>
          <strong>Wardrobe Height:</strong> {configuredWardrobe.heightMm} mm
        </p>
        <p>
          <strong>Wardrobe Depth:</strong> {configuredWardrobe.depthMm} mm
        </p>
        <p>
          <strong>Total Generated Parts:</strong> {generatedParts.length}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "10px",
          maxWidth: "320px",
          marginBottom: "20px",
        }}
      >
        <input
          type="number"
          placeholder="Sheet Length (mm)"
          value={sheetLength}
          onChange={(e) => setSheetLength(e.target.value)}
        />

        <input
          type="number"
          placeholder="Sheet Width (mm)"
          value={sheetWidth}
          onChange={(e) => setSheetWidth(e.target.value)}
        />
      </div>

      <div
        style={{
          marginBottom: "20px",
          padding: "16px",
          border: "1px solid #d1d5db",
          borderRadius: "10px",
          background: "#ffffff",
        }}
      >
        <p>
          <strong>Grand Total Area:</strong> {grandTotalArea} sq mm
        </p>
        <p>
          <strong>Sub Total:</strong> {subTotal}
        </p>
        <p>
          <strong>GST Amount:</strong> {gstAmount}
        </p>
        <p>
          <strong>Grand Total:</strong> {grandTotal}
        </p>
      </div>

      {normalizedHardwareItems.length > 0 && (
        <>
          <h3>Hardware Breakdown</h3>
          <table
            border="1"
            cellPadding="10"
            cellSpacing="0"
            width="100%"
            style={{ marginBottom: "20px" }}
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Hardware Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {normalizedHardwareItems.map((item, index) => (
                <tr key={`${item.itemName}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{item.itemName || "-"}</td>
                  <td>{item.qty}</td>
                  <td>{item.rate}</td>
                  <td>{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3>Excel Style Cost Summary</h3>
      <table border="1" cellPadding="10" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Cost Head</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Wood / Sheet Material</td>
            <td>{woodAmount}</td>
          </tr>
          <tr>
            <td>Laminate</td>
            <td>{laminateAmount}</td>
          </tr>
          <tr>
            <td>Edge Band</td>
            <td>{edgeBandAmount}</td>
          </tr>
          <tr>
            <td>Hardware</td>
            <td>{hardwareAmount}</td>
          </tr>
          <tr>
            <td>Glue / Adhesive</td>
            <td>{glueAmount}</td>
          </tr>
          <tr>
            <td>Drawer</td>
            <td>{drawerAmount}</td>
          </tr>
          <tr>
            <td>Front Frame</td>
            <td>{frontFrameAmount}</td>
          </tr>
          <tr>
            <td>Labor</td>
            <td>{laborAmount}</td>
          </tr>
          <tr>
            <td>Transport</td>
            <td>{transportAmount}</td>
          </tr>
          <tr>
            <td>
              <strong>Sub Total</strong>
            </td>
            <td>
              <strong>{subTotal}</strong>
            </td>
          </tr>
          <tr>
            <td>GST {gstPercent}%</td>
            <td>{gstAmount}</td>
          </tr>
          <tr>
            <td>
              <strong>Grand Total</strong>
            </td>
            <td>
              <strong>{grandTotal}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BOQ;