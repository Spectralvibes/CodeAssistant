import React from "react";
import DataTable from "./components/DataTable.tsx";

const App: React.FC = () => {
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>React Ag-Grid with Pagination</h2>
      <DataTable />
    </div>
  );
};

export default App;