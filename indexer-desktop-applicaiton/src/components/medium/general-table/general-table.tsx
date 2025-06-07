import React from 'react';
import { GeneralTableProps } from './general-table.type';

export default function GeneralTable({ props }: {props: GeneralTableProps}) {
    const { data, onRowClick } = props;

    // Prepare the data for the table
    const preparedData = data.map(query => ({
        id: query.id,
        query: query.query.length > 15 ? query.query.substring(0, 30) + "..." : query.query,
        blocks_read: query.shared_blks_read,
        blocks_written: query.temp_blks_written,
        mean_exec_time: query.mean_exec_time.toFixed(2),
        score: query.score.toFixed(2)
    }));

    return (
        <div className="block w-full h-full overflow-auto">
            <h1 className="font-bold mb-4">Time consuming queries</h1>
            <table className="text-left w-full">
                <thead>
                    <tr>
                        <th className="text-[#828282]">Id</th>
                        <th className="text-[#828282]">Query</th>
                        <th className="text-[#828282]">Blocks read</th>
                        <th className="text-[#828282]">Blocks written</th>
                        <th className="text-[#828282]">Mean execution time</th>
                        <th className="text-[#828282]">Score</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {preparedData.map((query, index) => (
                        <tr key={index} className="text-sm border-[#E0E0E0] border-t hover:bg-[#E0E0E0] cursor-pointer" onClick={() => onRowClick && onRowClick(query.id)}>
                            <td className="py-2 text-[#DD6041] pr-2">{query.id}</td>
                            <td className="font-bold py-2">{query.query}</td>
                            <td className=" py-2">{query.blocks_read}</td>
                            <td className=" py-2">{query.blocks_written}</td>
                            <td className=" py-2">{query.mean_exec_time} ms</td>
                            <td className=" py-2">{query.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
