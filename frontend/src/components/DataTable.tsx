import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { fetchRecords, ApiResponse } from "../api.ts";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
import MenuCell from "./MenuCell.tsx"; // ✅ Import menu component

// 🔧 Register AG Grid Modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const RECORDS_PER_PAGE = 10;
const GHOST_ROWS = Array.from({ length: RECORDS_PER_PAGE }, () => ({
    id: `...`,
    combinedField: `Loading...`,
}));

const DataTable: React.FC = () => {
    const [rowData, setRowData] = useState(GHOST_ROWS);
    const [page, setPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ Calculate totalPages dynamically
    const totalPages = totalRecords ? Math.ceil(totalRecords / RECORDS_PER_PAGE) : null;

    const loadPage = async (pageNumber: number) => {
        if (totalPages !== null && (pageNumber <= 0 || pageNumber > totalPages)) return;
        setLoading(true);
        console.log(`📡 Fetching Page ${pageNumber} from API...`);

        try {
            const response: ApiResponse = await fetchRecords(pageNumber);
            setRowData(response.data);
            setTotalRecords(response.totalRecords);
        } catch (error) {
            console.error("Error fetching data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPage(1);
    }, []);

    return (
        <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
            <AgGridReact
                rowData={loading ? GHOST_ROWS : rowData}
                columnDefs={[
                    { headerName: "ID", field: "id", width: 100 },
                    {
                        headerName: "Details",
                        field: "name",
                        flex: 1,
                        cellRenderer: (params: any) => (
                            <div>
                                <strong>{params.data.name}</strong> <br />
                                <span style={{ color: "gray" }}>Age: {params.data.age}</span>
                            </div>
                        ),
                        cellStyle: { color: loading ? "#ccc" : "inherit" }
                    },
                    {
                        headerName: "Actions",
                        field: "menuOptions",
                        width: 100,
                        cellRenderer: MenuCell // ✅ Uses custom 3-dots menu component
                    }
                ]}
                pagination={false}
            />

            <div style={{ marginTop: 10 }}>
                <button
                    disabled={loading || page <= 1}
                    onClick={() => {
                        const newPage = page - 1;
                        if (newPage > 0) {
                            setPage(newPage);
                            loadPage(newPage);
                        }
                    }}>
                    Previous
                </button>

                <span style={{ margin: "0 10px" }}>
                    Page {page} of {totalPages ?? "..."}
                </span>

                <button
                    disabled={loading || (totalPages !== null && page >= totalPages)}
                    onClick={() => {
                        const newPage = page + 1;
                        if (totalPages !== null && newPage <= totalPages) {
                            setPage(newPage);
                            loadPage(newPage);
                        }
                    }}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default DataTable;
