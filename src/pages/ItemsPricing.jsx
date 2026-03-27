import { useState } from "react";
import { useAppData } from "../context/AppDataContext";

function ItemsPricing() {
  const { prices, setPrices } = useAppData();

  const [category, setCategory] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [unit, setUnit] = useState("");
  const [rate, setRate] = useState("");
  const [gst, setGst] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const resetForm = () => {
    setCategory("");
    setMaterialName("");
    setUnit("");
    setRate("");
    setGst("");
    setEditId(null);
  };

  const handleAddOrUpdateItem = () => {
    if (!category || !materialName || !unit || !rate || !gst) {
      alert("Please fill all fields");
      return;
    }

    if (editId) {
      const updatedPrices = prices.map((item) =>
        item.id === editId
          ? {
              ...item,
              category,
              materialName,
              unit,
              rate: Number(rate),
              gst: Number(gst),
            }
          : item
      );
      setPrices(updatedPrices);
    } else {
      const newItem = {
        id: prices.length > 0 ? Math.max(...prices.map((p) => p.id)) + 1 : 1,
        category,
        materialName,
        unit,
        rate: Number(rate),
        gst: Number(gst),
      };
      setPrices([...prices, newItem]);
    }

    resetForm();
  };

  const handleEditItem = (item) => {
    setCategory(item.category || "");
    setMaterialName(item.materialName || "");
    setUnit(item.unit || "");
    setRate(item.rate || "");
    setGst(item.gst || "");
    setEditId(item.id);
  };

  const handleDeleteItem = (id) => {
    const updatedPrices = prices.filter((item) => item.id !== id);
    setPrices(updatedPrices);

    if (editId === id) {
      resetForm();
    }
  };

  const filteredItems = prices.filter((item) => {
    const itemCategory = String(item.category || "");
    const itemMaterialName = String(item.materialName || "");
    const itemUnit = String(item.unit || "");

    const matchesCategory =
      selectedCategory === "All" || itemCategory === selectedCategory;

    const value = searchText.toLowerCase();
    const matchesSearch =
      itemCategory.toLowerCase().includes(value) ||
      itemMaterialName.toLowerCase().includes(value) ||
      itemUnit.toLowerCase().includes(value);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-card">
      <h2>Items Pricing</h2>

      <div style={{ display: "grid", gap: "10px", maxWidth: "420px", marginBottom: "20px" }}>
        <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="">Select Category</option>
  <option value="Wood">Wood</option>
  <option value="Laminate">Laminate</option>
  <option value="Hardware">Hardware</option>
  <option value="Glass">Glass</option>
</select>

        <input
          type="text"
          placeholder="Material Name"
          value={materialName}
          onChange={(e) => setMaterialName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Unit (Sheet, Sq.ft, Nos...)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />

        <input
          type="number"
          placeholder="Rate"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />

        <input
          type="number"
          placeholder="GST %"
          value={gst}
          onChange={(e) => setGst(e.target.value)}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleAddOrUpdateItem}>
            {editId ? "Update Item Price" : "Add Item Price"}
          </button>

          {editId && (
            <button onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gap: "10px", maxWidth: "280px", marginBottom: "20px" }}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Wood">Wood</option>
          <option value="Laminate">Laminate</option>
          <option value="Hardware">Hardware</option>
          <option value="Glass">Glass</option>
        </select>

        <input
          type="text"
          placeholder="Search by category, material, or unit"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <table border="1" cellPadding="10" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Material Name</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>GST %</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  {filteredItems.length > 0 ? (
    filteredItems.map((item) => (
      <tr key={item.id}>
        <td>{item.id}</td>
        <td>{item.category || "-"}</td>
        <td>{item.materialName || "-"}</td>
        <td>{item.unit || "-"}</td>
        <td>{item.rate ?? "-"}</td>
        <td>{item.gst ?? "-"}</td>
        <td style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => handleEditItem(item)}>Edit</button>
          <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7">No pricing items found.</td>
    </tr>
  )}
</tbody>
      </table>
    </div>
  );
}

export default ItemsPricing;