import axios from "axios";
export interface ApiResponse {
    data: {
        id: number;
        name: string;
        age: number;
        values: number[];
    }[];
    totalRecords: number;
}

export const fetchRecords = async (page: number): Promise<ApiResponse> => {
    const response = await axios.get<ApiResponse>(
        `http://localhost:4000/api/records?page=${page}`
    );
    return response.data;
};

