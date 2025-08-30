'use client'

import React from "react";
import MessageBox from "../message-box/message-box";
import MessageBoxContent from "@/components/mini/message-box-content/message-box-content";
import { MessageForAddProps } from "./message-for-add.type";
import clsx from "clsx";
import { getStatQueries, createTCQuery } from "@/api-calls/manual-labor/manual-labor";
import { TimeConsumingQueries } from "@/types/redux/states";
import { statQuery, createTCQueryRequest} from "@/api-calls/manual-labor/manual-labor.type";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import TabMessageBox from "@/components/medium/tab-message-box/tab-message-box";
import Button from "@/components/mini/buttons/form-buttons/button";
import { addQuery } from "@/app-state/indexer_slice";


export default function MessageForAdd({ onClose }: MessageForAddProps) {
    const dispatch = useDispatch();
    const accessToken = useSelector((state: RootState) => state.indexer.dba.access_token);

    const [statQueries, setStatQueries] = React.useState<statQuery[]>([]);
    const [currentQueryId, setCurrentQueryId] = React.useState<string | null>(null);
    const [showQueryStat, setShowQueryStat] = React.useState<boolean>(false);
    const [statistics, setStatistics] = React.useState<TimeConsumingQueries | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);

    useEffect(() => {
        const fetchStatQueries = async () => {
            try {
                const response = await getStatQueries({ access_token: accessToken });
                setStatQueries(response.queries);
            } catch (error) {
                console.error("Error fetching stat queries:", error);
            }
        };

        fetchStatQueries();
    }, [accessToken]);

    const handleAddQuery = async () => {
        setLoading(true);
        try {
            if (!currentQueryId) return;
            // Create the createTCQueryRequest
            const createTCQueryRequest: createTCQueryRequest = {
                query_id: currentQueryId
            };
            const response = await createTCQuery({ data: createTCQueryRequest, access_token: accessToken });
            setStatistics(response);
            setShowQueryStat(true);
            // Dispatch an action to update the Redux store with the new query
            dispatch(addQuery(response));
        } catch (error) {
            console.error("Error adding query:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="block w-full h-full overflow-auto">
            <MessageBox 
                messageBoxProps={{
                    visible: true,
                    onClose: () => onClose()
                }}
            >
                <MessageBoxContent
                    messageBoxContent={{
                        title: "Add Query",
                        type: "info",
                        icon: "info",
                        onCancel: () => onClose()
                    }}
                >
                    {/* Print the empty message if the statQueries array is empty */}
                    {statQueries.length === 0 ? (
                        <div className="flex items-center justify-center">
                            <TabMessageBox
                                icon="info"
                                title="No queries to visualize"
                                message="No queries were found in the pg_stat_statements."
                                buttonType="info"
                                url="#"
                            />
                        </div>
                    ) : showQueryStat ? (
                        <div className="w-full flex flex-col h-96 overflow-auto pr-2">
                            <div className="">
                                <h1 className="text-lg font-bold mb-2">Query</h1>
                                <div className="p-2 bg-[#E6E6E6] rounded-md">
                                    <p className="text-sm text-[#454545]">{statistics ? statistics.query : ""}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h1 className="text-lg font-bold mb-2">Indexes</h1>
                                <div className="p-2 bg-[#E6E6E6] rounded-md">
                                    {
                                        statistics?.indexes.length ? (
                                            <ul className="">
                                                {statistics.indexes.map((index, idx) => (
                                                    <li key={idx} className="text-sm text-[#454545]">{index}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-[#454545]">No indexes found for this query.</p>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="mt-4">
                                <h1 className="text-lg font-bold mb-2">Other statistics</h1>
                                <div className="p-2 bg-[#E6E6E6] rounded-md">
                                    <p className="text-sm text-[#454545]"><strong>Total execution time:</strong> {statistics?.total_exec_time.toFixed(2)} ms</p>
                                    <p className="text-sm text-[#454545]"><strong>Mean execution time:</strong> {statistics?.mean_exec_time.toFixed(2)} ms</p>
                                    <p className="text-sm text-[#454545]"><strong>Calls:</strong> {statistics?.calls}</p>
                                    <p className="text-sm text-[#454545]"><strong>Score:</strong> {statistics?.score.toFixed(2)}</p>
                                    <p className="text-sm text-[#454545]"><strong>Shared block read:</strong> {statistics?.shared_blks_read}</p>
                                    <p className="text-sm text-[#454545]"><strong>Temp block written:</strong> {statistics?.temp_blks_written}</p>
                                    <p className="text-sm text-[#454545]"><strong>Estimated time for indexes:</strong> {statistics?.estimated_time_for_indexes} ms</p>
                                    <p className="text-sm text-[#454545]"><strong>Auto indexing:</strong> {statistics?.auto_indexing || `None`}</p>
                                    <p className="text-sm text-[#454545]"><strong>Next time execution:</strong> {statistics?.next_time_execution || `None`}</p>
                                </div>
                            </div>
                        </div>
                    ) : 
                        <div className="w-full flex flex-col h-96 overflow-auto pr-2">
                            {statQueries.map((query) => (
                                <div
                                    onClick={() => {
                                        setCurrentQueryId(query.query_id);
                                    }}
                                    key={query.query_id}
                                    className={clsx(
                                        "border rounded p-2 mb-4 bg-[#E6E6E6] cursor-pointer",
                                        "hover:bg-gray-100 transition-colors duration-200",
                                        currentQueryId === query.query_id ? "border-[#00897A]" : "border-gray-300"
                                    )}
                                >
                                    <p className="text-[#454545] whitespace-pre-wrap break-all text-sm">{query.query}</p>
                                </div>
                            ))}
                            <Button
                                text="Add Query"
                                loading={loading}
                                disabled={loading}
                                buttonType="submit"
                                onClick={handleAddQuery}
                            />
                        </div>
                        
                    }
                </MessageBoxContent>
            </MessageBox>
        </div>
    );
}