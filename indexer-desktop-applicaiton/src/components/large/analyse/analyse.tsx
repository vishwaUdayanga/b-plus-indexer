import React from "react";
import { TimeConsumingQueriesResponse } from "@/api-calls/analyse/analyse.type";
import TableWithOptions from "@/components/medium/table-with-options/table-with-options";
import ScatterPlot from "@/components/medium/scatter-plot/scatter-plot";

export default function Analyse({ data }: { data: TimeConsumingQueriesResponse }) {
    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <h1 className="text-xl font-bold ml-2">Dashboard</h1>
            <div className="flex w-full h-full p-2 gap-4 overflow-hidden">
                <div className="w-1/2 flex flex-col gap-4">
                    <div className="flex-1 bg-white rounded p-4 h-1/2 overflow-auto">
                        <TableWithOptions data={data} />
                    </div>
                    <div className="flex-1 bg-white rounded p-4 h-1/2 overflow-auto">
                        <ScatterPlot data={data} />
                    </div>
                </div>
                <div className="w-1/2 flex flex-col gap-4">
                    <div className="flex flex-1 gap-4">
                    <div className="w-1/2 bg-white rounded p-4">Box 3</div>
                    <div className="w-1/2 bg-white rounded p-4">Box 4</div>
                    </div>
                    <div className="flex-1 bg-white rounded p-4">Box 5</div>
                </div>
            </div>
        </div>
    )
}