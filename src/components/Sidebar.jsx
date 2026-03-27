import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">Interior App</h2>

      <nav>
        <ul>
          <li><NavLink to="/">Dashboard</NavLink></li>
          <li><NavLink to="/projects">Projects</NavLink></li>
          <li><NavLink to="/sub-projects">Sub Projects</NavLink></li>
          <li><NavLink to="/template-master">Template Master</NavLink></li>
          <li><NavLink to="/wardrobe-configurator">Wardrobe Configurator</NavLink></li>
          <li><NavLink to="/wardrobe-records">Wardrobe Records</NavLink></li>
          <li><NavLink to="/items-pricing">Items Pricing</NavLink></li>
          <li><NavLink to="/dimensions-entry">Dimensions Entry</NavLink></li>
          <li><NavLink to="/cut-sheet-output">Cut Sheet Output</NavLink></li>
          <li><NavLink to="/boq">BOQ</NavLink></li>
          <li><NavLink to="/project-boq">Project BOQ</NavLink></li>
          <li><NavLink to="/quotation">Quotation</NavLink></li>
          <li><NavLink to="/project-quotation">Project Quotation</NavLink></li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;