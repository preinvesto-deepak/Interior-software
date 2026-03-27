import { useMemo, useState } from "react";
import { useAppData } from "../context/AppDataContext";
import { mmToFeet, sqMmToSqFt, roundTo2 } from "../utils/unitConversions";

function ProjectQuotation() {
  const { projects, wardrobeRecords, prices } = useAppData();

  const [selectedProject, setSelectedProject] = useState(
    projects[0]?.name || ""
  );

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [companyName, setCompanyName] = useState("Interior App");
  const [companyMobile, setCompanyMobile] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  const [quotationNo, setQuotationNo] = useState("PRJ-QTN-001");
  const [quotationDate, setQuotationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [discountAmount, setDiscountAmount] = useState(0);

  const [validityDays, setValidityDays] = useState(7);
  const [advancePercent, setAdvancePercent] = useState(50);
  const [deliveryDays, setDeliveryDays] = useState(30);
  const [scopeIncluded, setScopeIncluded] = useState(
    "Material supply, fabrication, delivery, and installation for listed items."
  );
  const [scopeExcluded, setScopeExcluded] = useState(
    "Civil, electrical shifting, plumbing, painting, and site rectification unless specified."
  );
  const [termsText, setTermsText] = useState(
    "Final site measurements and finish selection to be reconfirmed before production."
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

      const woodAmount = Object.values(materialGroups).reduce(
        (total, group) => {
          const materialRateData = prices.find(
            (item) => item.materialName === group.material
          );
          const requiredSheets =
            sheetArea > 0 ? Math.ceil(group.totalAreaSqMm / sheetArea) : 0;
          const sheetRate = materialRateData
            ? Number(materialRateData.rate)
            : 0;
          return total + requiredSheets * sheetRate;
        },
        0
      );

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

      const totalAreaSqMm = (record.parts || []).reduce((total, part) => {
        return (
          total +
          Number(part.lengthMm) * Number(part.widthMm) * Number(part.qty)
        );
      }, 0);

      return {
        ...record,
        hardwareItems: normalizedHardwareItems,
        hardwareAmount,
        totalAmount,
        totalAreaSqMm,
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

  const subTotal = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const netAmount = subTotal - Number(discountAmount || 0);
  const gstPercent = 18;
  const gstAmount = (netAmount * gstPercent) / 100;
  const grandTotal = netAmount + gstAmount;
  const advanceAmount = (netAmount * Number(advancePercent || 0)) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-card">
      <h2>Project Quotation</h2>

      <div
        className="no-print"
        style={{
          display: "grid",
          gap: "10px",
          maxWidth: "520px",
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
        style={{
          background: "#fff",
          padding: "24px",
          border: "1px solid #d1d5db",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{companyName}</h2>
            <p style={{ margin: "6px 0" }}>Project Quotation</p>
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
              <strong>Customer:</strong> {customerName || "-"}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Mobile:</strong> {customerMobile || "-"}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Address:</strong> {customerAddress || "-"}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <p><strong>Project:</strong> {selectedProject || "-"}</p>
          <p><strong>Total Items:</strong> {lineItems.length}</p>
        </div>

        {lineItems.length === 0 ? (
          <p>No wardrobe records found for this project.</p>
        ) : (
          <>
            <table border="1" cellPadding="10" cellSpacing="0" width="100%">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Sub Project</th>
                  <th>Door Type</th>
                  <th>Specification</th>
                  <th>Remarks</th>
                  <th>Size</th>
                  <th>Area</th>
                  <th>Hardware</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.itemName}</td>
                    <td>{item.subProjectName}</td>
                    <td>{item.doorType || "-"}</td>
                    <td>{item.specification || "-"}</td>
                    <td>{item.remarks || "-"}</td>
                    <td>
                      W {roundTo2(mmToFeet(item.widthMm))} ft / H{" "}
                      {roundTo2(mmToFeet(item.heightMm))} ft / D{" "}
                      {roundTo2(mmToFeet(item.depthMm))} ft
                    </td>
                    <td>{roundTo2(sqMmToSqFt(item.totalAreaSqMm))} sq ft</td>
                    <td>{item.hardwareAmount}</td>
                    <td>{item.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hardwareSummary.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <h3>Project Hardware Summary</h3>
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
              </div>
            )}

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
                marginTop: "24px",
                maxWidth: "420px",
                marginLeft: "auto",
              }}
            >
              <table border="1" cellPadding="10" cellSpacing="0" width="100%">
                <tbody>
                  <tr>
                    <td><strong>Sub Total</strong></td>
                    <td>{subTotal}</td>
                  </tr>
                  <tr>
                    <td><strong>Discount</strong></td>
                    <td>{discountAmount}</td>
                  </tr>
                  <tr>
                    <td><strong>Net Amount</strong></td>
                    <td>{netAmount}</td>
                  </tr>
                  <tr>
                    <td><strong>GST {gstPercent}%</strong></td>
                    <td>{gstAmount}</td>
                  </tr>
                  <tr>
                    <td><strong>Grand Total</strong></td>
                    <td><strong>{grandTotal}</strong></td>
                  </tr>
                </tbody>
              </table>
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
          </>
        )}
      </div>
    </div>
  );
}

export default ProjectQuotation;