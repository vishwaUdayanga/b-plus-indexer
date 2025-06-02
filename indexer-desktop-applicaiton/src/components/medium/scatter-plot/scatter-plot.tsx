import React from "react";
import { TimeConsumingQueriesResponse } from "@/api-calls/analyse/analyse.type";
import { ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Scatter, ResponsiveContainer, Legend, ZAxis } from 'recharts';
import { ChartDataPoint } from "./scatter-plot.type";

export default function ScatterPlot({ data }: { data: TimeConsumingQueriesResponse }) {
    const getCategory = (score: number) => {
        if (score > 0.6) return 'expensive';
        if (score > 0.4) return 'average';
        return 'less';
    };

    const categorizedData = {
        expensive: [] as ChartDataPoint[],
        average: [] as ChartDataPoint[],
        less: [] as ChartDataPoint[],
    };

    data.queries.forEach((query) => {
        const point = {
        id: query.id,
        score: query.score,
        mean_exec_time: query.mean_exec_time,
        calls: query.calls,
        name: `Query ${query.id}`,
        };

        categorizedData[getCategory(query.score)].push(point);
    });

    return (
        <div className="flex flex-col w-full h-full">
            <h1 className="font-bold min-h-[40px]">Score vs. Execution Time</h1>
            <div className="w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="score" name="Score" domain={[0, 1]} />
                        <YAxis type="number" dataKey="mean_exec_time" name="Mean Exec Time (s)" />
                        <ZAxis type="number" dataKey="calls" name="Calls" range={[60, 400]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="Expensive" data={categorizedData.expensive} fill="#DD6041" shape="circle" />
                        <Scatter name="Average" data={categorizedData.average} fill="#00897A" shape="circle" />
                        <Scatter name="Less Expensive" data={categorizedData.less} fill="#243F5E" shape="circle" />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
        
    );
}