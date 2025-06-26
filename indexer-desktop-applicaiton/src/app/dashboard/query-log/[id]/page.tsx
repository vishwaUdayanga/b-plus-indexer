'use client'

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { HitsRequest } from "@/api-calls/hits/hits.type";
import { getHits } from "@/api-calls/hits/hits";
import TabMessageBox from "@/components/medium/tab-message-box/tab-message-box";
import TabLoading from "@/components/mini/loadings/tab-loading/tab-loading";
import { PreparedData } from "./query-log.type";


export default function Page() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false)
    const [emptyMessage, setEmptyMessage] = useState(false);
    const [optimized, setOptimized] = useState(true);
    const [month, setMonth] = useState(1);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [preparedData, setPreparedData] = useState<PreparedData[]>([]);


    const router = useRouter();
    const { id } = useParams();

    const accessToken = useSelector((state: RootState) => state.indexer.dba.access_token);

    // Retrieve the query text with this query id from the redux storage
    const queryText = useSelector((state: RootState) => state.indexer.queries.find(query => query.id === Number(id))?.query); 
    
    
    const fetchQueryLogs = useCallback(async () => {
        try {
            const request: HitsRequest = {
                accessToken: accessToken,
                tc_query_id: Number(id),
                duration: month,
                optimized: optimized
            };
            const response = await getHits(request);
            if (response && response.query_logs && response.query_logs.length > 0) {
                // Prepare the data for the table
                setPreparedData(response.query_logs.map(log => ({
                    year: new Date(log.time_stamp).getFullYear(),
                    month: new Date(log.time_stamp).toLocaleString('default', { month: 'long' }),
                    day: new Date(log.time_stamp).getDate(),
                    time: new Date(log.time_stamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    optimized: log.optimized ? 'Yes' : 'No',
                })));
                setEmptyMessage(false);
            } else {
                setPreparedData([]);
                setEmptyMessage(true);
                
            }
            setError(false);
        } catch {
            setEmptyMessage(false)
            setError(true);
        }
    }, [accessToken, id, month, optimized]);

    useEffect(() => {
        const callFetch = async () => {
            setIsLoading(true);
            await fetchQueryLogs();
            setIsLoading(false);
        };

        callFetch();
    }, [fetchQueryLogs]);

    const handleError = async () => {
        setButtonLoading(true);
        try {
            await fetchQueryLogs();
        } catch {
            setError(true);
        } finally {
            setButtonLoading(false);
        }
    }

    useEffect(() => {
        if (!id) {
            router.push('/dashboard/hits');
        }
    }, [id, router]);


    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <h1 className="text-xl font-bold ml-2">Query logs</h1>
            <div className="flex w-full h-full p-2 gap-4 overflow-hidden">
                <div className="bg-white rounded p-4 w-full h-full">
                    <div className="w-full flex justify-between items-center mb-4">
                        <div className="flex items-center gap-5">
                            <div>
                                <label htmlFor="month" className="text-[#828282]">Duration (months): </label>
                                <select
                                    id="month"
                                    value={month}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                    className="border rounded p-1 text-[#828282]"
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={6}>6</option>
                                    <option value={12}>12</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="optimized" className="text-[#828282]">Optimized: </label>
                                <input
                                    type="checkbox"
                                    id="optimized"
                                    checked={optimized}
                                    className="h-5 w-5 text-[#00897A] accent-[#00897A] cursor-pointer border border-[E0E0E0]"
                                    onChange={(e) => setOptimized(e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-center mt-5">
                        {isLoading && <TabLoading />}
                        {error && (
                            <TabMessageBox
                                icon="error"
                                title="Could not fetch data"
                                message="There has been an error fetching data from the API. Please check the API is all set."
                                buttonText="Try again"
                                loading={buttonLoading}
                                disabled={buttonLoading}
                                buttonType="error"
                                url="#"
                                onButtonClick={handleError}
                            />
                        )}
                        {emptyMessage && (
                            <TabMessageBox
                                icon="info"
                                title="No data to visualize"
                                message="There are no query logs to visualize. Please run diagnostics to get the data."
                                url="#"
                            />
                        )}
                        {preparedData && !isLoading && !error && !emptyMessage && (
                            <table className="text-left w-full">
                                <thead>
                                    <tr>
                                        <th className="text-[#828282]">Query</th>
                                        <th className="text-[#828282]">Executed Year</th>
                                        <th className="text-[#828282]">Executed Month</th>
                                        <th className="text-[#828282]">Execute Dat and Time</th>
                                        <th className="text-[#828282]">Optimized</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preparedData.map((log, index) => (
                                        <tr key={index} className="text-sm border-[#E0E0E0] border-t hover:bg-[#E0E0E0] cursor-pointer">
                                            <td className="py-2 font-bold">
                                                {queryText
                                                    ? (queryText.length > 15
                                                        ? queryText.substring(0, 30) + "..."
                                                        : queryText)
                                                    : "Could not fetch the query text"}
                                            </td>
                                            <td className="py-2">{log.year}</td>
                                            <td className="py-2">{log.month}</td>
                                            <td className="py-2">{log.day}T{log.time}</td>
                                            <td className="py-2">{log.optimized}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}