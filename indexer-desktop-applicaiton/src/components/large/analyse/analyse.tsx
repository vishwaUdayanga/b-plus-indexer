import React from "react";
import { TimeConsumingQueriesResponse } from "@/api-calls/analyse/analyse.type";
import TableWithOptions from "@/components/medium/table-with-options/table-with-options";
import ScatterPlot from "@/components/medium/scatter-plot/scatter-plot";
import BarChartExecTime from "@/components/medium/bar-chart-exec-time/bar-chart-exec-time";
import BarChartExecBlocks from "@/components/medium/bar-chart-blocks/bar-chart-blocks";
import PieChartSmall from "@/components/medium/pie-chart/pie-chart";

export default function Analyse({ data }: { data: TimeConsumingQueriesResponse }) {
    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <h1 className="text-xl font-bold ml-2">Dashboard</h1>
            <div className="flex w-full h-full p-2 gap-4 overflow-hidden">
                <div className="w-2/5 flex flex-col gap-4">
                    <div className="bg-white rounded p-4 h-[45%] overflow-auto">
                        <TableWithOptions data={data} />
                    </div>
                    <div className="bg-white rounded p-4 h-[55%] overflow-auto">
                        <ScatterPlot data={data} />
                    </div>
                </div>
                <div className="w-3/5 flex flex-col gap-4">
                    <div className="flex flex-1 gap-4">
                        <div className="w-2/5 bg-white rounded p-4">
                            <PieChartSmall data={data} />
                        </div>
                        <div className="w-3/5 bg-white rounded p-4">
                            <BarChartExecBlocks data={data} />
                        </div>
                    </div>
                    <div className="flex-1 bg-white rounded p-4">
                        <BarChartExecTime data={data} />
                    </div>
                </div>
            </div>
        </div>
    )
}