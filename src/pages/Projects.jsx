import { useState } from "react";
import { useAppData } from "../context/AppDataContext";

function Projects() {
  const { projects, setProjects } = useAppData();

  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const resetForm = () => {
    setProjectName("");
    setClientName("");
    setLocation("");
    setEditId(null);
  };

  const handleAddOrUpdateProject = () => {
    if (!projectName || !clientName || !location) {
      alert("Please fill all fields");
      return;
    }

    if (editId) {
      const updatedProjects = projects.map((project) =>
        project.id === editId
          ? { ...project, name: projectName, client: clientName, location }
          : project
      );
      setProjects(updatedProjects);
    } else {
      const newProject = {
        id: projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1,
        name: projectName,
        client: clientName,
        location,
      };
      setProjects([...projects, newProject]);
    }

    resetForm();
  };

  const handleEditProject = (project) => {
    setProjectName(project.name);
    setClientName(project.client);
    setLocation(project.location);
    setEditId(project.id);
  };

  const handleDeleteProject = (id) => {
    const updatedProjects = projects.filter((project) => project.id !== id);
    setProjects(updatedProjects);

    if (editId === id) {
      resetForm();
    }
  };

  const filteredProjects = projects.filter((project) => {
    const value = searchText.toLowerCase();
    return (
      String(project.name || "").toLowerCase().includes(value) ||
      String(project.client || "").toLowerCase().includes(value) ||
      String(project.location || "").toLowerCase().includes(value)
    );
  });

  return (
    <div className="page-card">
      <h2>Projects</h2>

      <div
        style={{
          display: "grid",
          gap: "10px",
          maxWidth: "400px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Client Name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleAddOrUpdateProject}>
            {editId ? "Update Project" : "Add Project"}
          </button>

          {editId && <button onClick={resetForm}>Cancel Edit</button>}
        </div>
      </div>

      <div style={{ maxWidth: "400px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by project, client, or location"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <table border="1" cellPadding="10" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Project Name</th>
            <th>Client</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.name}</td>
                <td>{project.client}</td>
                <td>{project.location}</td>
                <td style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleEditProject(project)}>Edit</button>
                  <button onClick={() => handleDeleteProject(project.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No projects found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Projects;