import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const TOTAL_RECORDS = 100;
const PAGE_SIZE = 10;

// Generate mock data
const generateRecords = () =>
    Array.from({ length: TOTAL_RECORDS }, (_, i) => ({
        id: i + 1,
        name: `Record ${i + 1}`,
        value: Math.floor(Math.random() * 100),
        menuOptions: ["Edit", "Delete", "View Details"],
    }));

const records = generateRecords();

// API Route for Pagination
app.get("/api/records", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const startIndex = (page - 1) * PAGE_SIZE;
    const paginatedData = records.slice(startIndex, startIndex + PAGE_SIZE);

    res.json({
        page,
        recordsPerPage: PAGE_SIZE,
        totalRecords: TOTAL_RECORDS,
        data: paginatedData,
    });
});

// Start Server
app.listen(4000, () => console.log("Server running on port 4000"));
