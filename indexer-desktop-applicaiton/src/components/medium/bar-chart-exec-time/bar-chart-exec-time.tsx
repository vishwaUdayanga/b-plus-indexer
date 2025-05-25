import React from "react";
import { TimeConsumingQueriesResponse } from "@/api-calls/analyse/analyse.type";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, } from 'recharts';

export default function BarChartExecTime({ data }: { data: TimeConsumingQueriesResponse }) {
    const chartData = data.queries.map((query, index) => ({
        name: `Q${index+1}-${query.id}`,
        totalExecTime: query.total_exec_time,
        meanExecTime: query.mean_exec_time,
    }));

    return (
        <div className="flex flex-col w-full h-full">
            <h1 className="font-bold min-h-[40px]">Total vs. mean execution time</h1>
            <div className="w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalExecTime" name="Total Execution Time (s)" fill="#243F5E" />
                        <Bar dataKey="meanExecTime" name="Mean Execution Time (s)" fill="#00897A" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        
    );
}