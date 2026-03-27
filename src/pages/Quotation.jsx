import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import { mmToFeet, sqMmToSqFt, roundTo2 } from "../utils/unitConversions";

function Quotation() {
  const { generatedParts, configuredWardrobe, prices } = useAppData();

  const STANDARD_SHEET_LENGTH = 2400;
  const STANDARD_SHEET_WIDTH = 1200;

  const [sheetLength, setSheetLength] = useState(2440);
  const [sheetWidth, setSheetWidth] = useState(1220);

  const [customerName, setCustomerName] = useState("Ramesh");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [companyName, setCompanyName] = useState("Interior App");
  const [companyMobile, setCompanyMobile] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  const [quotationNo, setQuotationNo] = useState("QTN-001");
  const [quotationDate, setQuotationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [discountAmount, setDiscountAmount] = useState(0);

  const [validityDays, setValidityDays] = useState(7);
  const [advancePercent, setAdvancePercent] = useState(50);
  const [deliveryDays, setDeliveryDays] = useState(21);
  const [scopeIncluded, setScopeIncluded] = useState(
    "Material supply, fabrication, delivery, and installation."
  );
  const [scopeExcluded, setScopeExcluded] = useState(
    "Civil work, electrical shifting, plumbing work, and painting touchups unless mentioned."
  );
  const [termsText, setTermsText] = useState(
    "Final measurements to be confirmed at site before execution."
  );

  if (generatedParts.length === 0 || !configuredWardrobe) {
    return (
      <div className="page-card">
        <h2>Quotation</h2>
        <p>
          No generated wardrobe data available. Please save parts from Wardrobe
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
        <h2>Quotation</h2>
        <p><strong>Project:</strong> {configuredWardrobe.projectName}</p>
        <p><strong>Sub Project:</strong> {configuredWardrobe.subProjectName}</p>
        <p><strong>Item Name:</strong> {configuredWardrobe.itemName}</p>
        <p><strong>Door Type:</strong> {configuredWardrobe.doorType || "-"}</p>
        <p><strong>Specification:</strong> {configuredWardrobe.specification || "-"}</p>
        <p><strong>Remarks:</strong> {configuredWardrobe.remarks || "-"}</p>

        <div
          style={{
            marginTop: "20px",
            padding: "14px",
            border: "1px solid #dc2626",
            background: "#fef2f2",
            borderRadius: "10px",
          }}
        >
          <p><strong>Quotation blocked:</strong> Some parts exceed standard sheet size 2400 x 1200 mm.</p>
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
      };
    }

    acc[key].totalAreaSqMm += partArea;
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
      totalAreaSqMm: group.totalAreaSqMm,
      requiredSheets,
      sheetRate,
      basicAmount,
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

  const netAmount = subTotal - Number(discountAmount);
  const gstPercent = 18;
  const gstAmount = (netAmount * gstPercent) / 100;
  const grandTotal = netAmount + gstAmount;

  const totalPanelArea = groupedRows.reduce(
    (total, row) => total + row.totalAreaSqMm,
    0
  );

  const advanceAmount = (netAmount * Number(advancePercent || 0)) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-card">
      <div
        className="no-print"
        style={{
          display: "grid",
          gap: "10px",
          maxWidth: "520px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Company Mobile"
          value={companyMobile}
          onChange={(e) => setCompanyMobile(e.target.value)}
        />

        <input
          type="text"
          placeholder="Company Email"
          value={companyEmail}
          onChange={(e) => setCompanyEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Quotation Number"
          value={quotationNo}
          onChange={(e) => setQuotationNo(e.target.value)}
        />

        <input
          type="date"
          value={quotationDate}
          onChange={(e) => setQuotationDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Customer Mobile"
          value={customerMobile}
          onChange={(e) => setCustomerMobile(e.target.value)}
        />

        <input
          type="text"
          placeholder="Customer Address"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
        />

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

        <input
          type="number"
          placeholder="Discount Amount"
          value={discountAmount}
          onChange={(e) => setDiscountAmount(e.target.value)}
        />

        <input
          type="number"
          placeholder="Validity Days"
          value={validityDays}
          onChange={(e) => setValidityDays(e.target.value)}
        />

        <input
          type="number"
          placeholder="Advance %"
          value={advancePercent}
          onChange={(e) => setAdvancePercent(e.target.value)}
        />

        <input
          type="number"
          placeholder="Delivery Days"
          value={deliveryDays}
          onChange={(e) => setDeliveryDays(e.target.value)}
        />

        <textarea
          placeholder="Included Scope"
          value={scopeIncluded}
          onChange={(e) => setScopeIncluded(e.target.value)}
          rows="3"
        />

        <textarea
          placeholder="Excluded Scope"
          value={scopeExcluded}
          onChange={(e) => setScopeExcluded(e.target.value)}
          rows="3"
        />

        <textarea
          placeholder="Terms Text"
          value={termsText}
          onChange={(e) => setTermsText(e.target.value)}
          rows="3"
        />

        <button onClick={handlePrint}>Print / Save as PDF</button>
      </div>

      <div
        className="quotation-print-area"
        style={{
          background: "#fff",
          padding: "30px",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{companyName}</h2>
            <p style={{ margin: "6px 0" }}>Interior Design Quotation</p>
            <p style={{ margin: "6px 0" }}>
              <strong>Mobile:</strong> {companyMobile || "-"}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Email:</strong> {companyEmail || "-"}
            </p>
          </div>

          <div>
            <p style={{ margin: "6px 0" }}>
              <strong>Quotation No:</strong> {quotationNo}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Date:</strong> {quotationDate}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Customer:</strong> {customerName}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Mobile:</strong> {customerMobile || "-"}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Address:</strong> {customerAddress || "-"}
            </p>
          </div>
        </div>

        <hr />

        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <p><strong>Project:</strong> {configuredWardrobe.projectName}</p>
          <p><strong>Sub Project:</strong> {configuredWardrobe.subProjectName}</p>
          <p><strong>Item Name:</strong> {configuredWardrobe.itemName}</p>
          <p><strong>Door Type:</strong> {configuredWardrobe.doorType || "-"}</p>
          <p><strong>Specification:</strong> {configuredWardrobe.specification || "-"}</p>
          <p><strong>Remarks:</strong> {configuredWardrobe.remarks || "-"}</p>
          <p><strong>Template:</strong> {configuredWardrobe.templateName}</p>
          <p>
            <strong>Width:</strong>{" "}
            {roundTo2(mmToFeet(configuredWardrobe.widthMm))} ft (
            {configuredWardrobe.widthMm} mm)
          </p>
          <p>
            <strong>Height:</strong>{" "}
            {roundTo2(mmToFeet(configuredWardrobe.heightMm))} ft (
            {configuredWardrobe.heightMm} mm)
          </p>
          <p>
            <strong>Depth:</strong>{" "}
            {roundTo2(mmToFeet(configuredWardrobe.depthMm))} ft (
            {configuredWardrobe.depthMm} mm)
          </p>
          <p>
            <strong>Total Panel Area:</strong>{" "}
            {roundTo2(sqMmToSqFt(totalPanelArea))} sq ft
          </p>
        </div>

        {normalizedHardwareItems.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3>Hardware Breakdown</h3>
            <table border="1" cellPadding="10" cellSpacing="0" width="100%">
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
          </div>
        )}

        <table border="1" cellPadding="10" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Wood / Sheet Material</td><td>{woodAmount}</td></tr>
            <tr><td>Laminate</td><td>{laminateAmount}</td></tr>
            <tr><td>Edge Band</td><td>{edgeBandAmount}</td></tr>
            <tr><td>Hardware</td><td>{hardwareAmount}</td></tr>
            <tr><td>Glue / Adhesive</td><td>{glueAmount}</td></tr>
            <tr><td>Drawer</td><td>{drawerAmount}</td></tr>
            <tr><td>Front Frame</td><td>{frontFrameAmount}</td></tr>
            <tr><td>Labor</td><td>{laborAmount}</td></tr>
            <tr><td>Transport</td><td>{transportAmount}</td></tr>
            <tr><td><strong>Sub Total</strong></td><td><strong>{subTotal}</strong></td></tr>
            <tr><td><strong>Discount</strong></td><td><strong>{discountAmount}</strong></td></tr>
            <tr><td><strong>Net Amount</strong></td><td><strong>{netAmount}</strong></td></tr>
            <tr><td>GST {gstPercent}%</td><td>{gstAmount}</td></tr>
            <tr><td><strong>Grand Total</strong></td><td><strong>{grandTotal}</strong></td></tr>
          </tbody>
        </table>

        <div style={{ marginTop: "24px" }}>
          <h3>Included Scope</h3>
          <p>{scopeIncluded || "-"}</p>

          <h3>Excluded Scope</h3>
          <p>{scopeExcluded || "-"}</p>

          <h3>Terms & Conditions</h3>
          <p><strong>Validity:</strong> {validityDays} days from quotation date</p>
          <p><strong>Advance:</strong> {advancePercent}% ({advanceAmount})</p>
          <p><strong>Delivery Timeline:</strong> {deliveryDays} days from advance confirmation and final measurements</p>
          <p>{termsText || "-"}</p>
        </div>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "space-between",
            gap: "30px",
          }}
        >
          <div style={{ width: "45%" }}>
            <p><strong>Customer Acceptance</strong></p>
            <div style={{ borderTop: "1px solid #000", marginTop: "50px" }} />
          </div>

          <div style={{ width: "45%" }}>
            <p><strong>Authorized Signatory</strong></p>
            <div style={{ borderTop: "1px solid #000", marginTop: "50px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quotation;