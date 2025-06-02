import React from "react";
import { TimeConsumingQueriesResponse } from "@/api-calls/analyse/analyse.type";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, } from 'recharts';

export default function BarChartExecBlocks({ data }: { data: TimeConsumingQueriesResponse }) {
    const chartData = data.queries.map((query, index) => ({
        name: `Q${index+1}-${query.id}`,
        sharedBlocksRead: query.shared_blks_read,
        tempBlocksWritten: query.temp_blks_written,
    }));

    return (
        <div className="flex flex-col w-full h-full">
            <h1 className="font-bold min-h-[40px]">Shared Blocks Read vs. Temp Blocks Written</h1>
            <div className="w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sharedBlocksRead" name="Shared Blocks Read" fill="#00897A" />
                        <Bar dataKey="meanExecTime" name="Temp Blocks Written" fill="#DD6041" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        
    );
}