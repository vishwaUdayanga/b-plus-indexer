import React from "react";
import { TimeConsumingQueriesResponse } from "@/api-calls/analyse/analyse.type";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Colors } from "./pie-chart.type";

export default function PieChartSmall({ data }: { data: TimeConsumingQueriesResponse }) {
    const chartData = data.queries.map((query, index) => ({
        name: `Q${index + 1}-${query.id}`,
        value: query.total_exec_time,
    }));

    return (
        <div className="flex flex-col w-full h-full">
            <h1 className="font-bold min-h-[40px]">Execution Time Shared</h1>
            <div className="w-full flex-1 text-sm">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                        >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={Colors[index % Colors.length]} />
                        ))}
                        </Pie>
                        <Tooltip
                            // Shows the query with percentage and the total execution time when hovering over a slice
                            formatter={(value: number, name: string) => [`${name} : ${value.toFixed(2)} s`]}
                        />
                        <span className="mt-2"></span>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
        
    );
}