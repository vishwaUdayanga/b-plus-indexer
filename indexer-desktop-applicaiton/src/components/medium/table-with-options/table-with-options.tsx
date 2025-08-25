import React from "react";
import { TimeConsumingQueriesResponse } from "@/api-calls/analyse/analyse.type";
import Image from "next/image";
import MessageBox from "../message-box/message-box";
import MessageBoxContent from "@/components/mini/message-box-content/message-box-content";

export default function TableWithOptions({ data }: { data: TimeConsumingQueriesResponse }) {
    //Prepare the data for the table. Prepare only the first fifteen characters of the query, two decimal places for the mean execution time, and he score.
    const preparedData = data.queries.map(query => ({
        id: query.id,
        query: query.query.length > 15 ? query.query.substring(0, 15) + "..." : query.query,
        mean_exec_time: query.mean_exec_time.toFixed(2),
        score: query.score.toFixed(2)
    }));

    const [messageBox, setMessageBox] = React.useState(false);
    const [currentQuery, setCurrentQuery] = React.useState<TimeConsumingQueriesResponse["queries"][number] | null>(null);

    // Function to handle the click on the options button
    const handleOptionsClick = (query: TimeConsumingQueriesResponse["queries"][number]) => {
        setCurrentQuery(query);
        setMessageBox(true);
    };

    return (
        <div className="block w-full h-full overflow-auto">
            <h1 className="font-bold mb-4">Time consuming queries</h1>
            <table className="text-left w-full">
                <thead>
                    <tr>
                        <th className="text-[#828282]">Id</th>
                        <th className="text-[#828282]">Query</th>
                        <th className="text-[#828282]">Mean execution time</th>
                        <th className="text-[#828282]">Score</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {preparedData.map((query, index) => (
                        <tr key={index} className="text-sm border-[#E0E0E0] border-t">
                            <td className="py-2 text-[#DD6041] pr-2">{query.id}</td>
                            <td className="font-bold py-2">{query.query}</td>
                            <td className=" py-2">{query.mean_exec_time} ms</td>
                            <td className=" py-2">{query.score}</td>
                            <td className="">
                                <button className="mt-1" onClick={() => handleOptionsClick(data.queries[index])}>
                                    <Image src="/logos/option-dots.png" alt="Indexer|Options icon" width={16} height={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <MessageBox 
                messageBoxProps={{
                    visible: messageBox,
                    onClose: () => setMessageBox(false)
                }}
            >
                <MessageBoxContent
                    messageBoxContent={{
                        title: "Query information",
                        type: "info",
                        icon: "info",
                        onCancel: () => setMessageBox(false)
                    }}
                >
                    
                    <div className="w-full flex flex-col h-96 overflow-auto pr-2">
                        <div className="">
                            <h1 className="text-lg font-bold mb-2">Query</h1>
                            <div className="p-2 bg-[#E6E6E6] rounded-md">
                                <p className="text-sm text-[#454545]">{currentQuery?.query}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h1 className="text-lg font-bold mb-2">Indexes</h1>
                            <div className="p-2 bg-[#E6E6E6] rounded-md">
                                {
                                    currentQuery?.indexes.length ? (
                                        <ul className="">
                                            {currentQuery.indexes.map((index, idx) => (
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
                                <p className="text-sm text-[#454545]"><strong>Total execution time:</strong> {currentQuery?.total_exec_time.toFixed(2)} ms</p>
                                <p className="text-sm text-[#454545]"><strong>Mean execution time:</strong> {currentQuery?.mean_exec_time.toFixed(2)} ms</p>
                                <p className="text-sm text-[#454545]"><strong>Calls:</strong> {currentQuery?.calls}</p>
                                <p className="text-sm text-[#454545]"><strong>Score:</strong> {currentQuery?.score.toFixed(2)}</p>
                                <p className="text-sm text-[#454545]"><strong>Shared block read:</strong> {currentQuery?.shared_blks_read}</p>
                                <p className="text-sm text-[#454545]"><strong>Temp block written:</strong> {currentQuery?.temp_blks_written}</p>
                                <p className="text-sm text-[#454545]"><strong>Estimated time for indexes:</strong> {currentQuery?.estimated_time_for_indexes} ms</p>
                                <p className="text-sm text-[#454545]"><strong>Auto indexing:</strong> {currentQuery?.auto_indexing !== undefined ? String(currentQuery.auto_indexing) : "None"}</p>
                                <p className="text-sm text-[#454545]"><strong>Next time execution:</strong> {currentQuery?.next_time_execution !== undefined ? String(currentQuery.next_time_execution) : "None"}</p>
                            </div>
                        </div>
                    </div>

                </MessageBoxContent>
            </MessageBox>
        </div>
    );
}