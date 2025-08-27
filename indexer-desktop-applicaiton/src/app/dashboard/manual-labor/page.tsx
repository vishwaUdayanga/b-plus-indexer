'use client'

import { FC, useEffect, useState } from "react";
import TabMessageBox from "@/components/medium/tab-message-box/tab-message-box";
import { TimeConsumingQueries } from "@/types/redux/states";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";
import TCQueryDemonstration from "@/components/large/trainer/trainer";
import Image from "next/image";
import MessageForAdd from "@/components/medium/message-for-add/message-for-add";

const Page: FC = () => {
    // states
    const [timeConsumingQueries, setTimeConsumingQueries] = useState<TimeConsumingQueries[]>([]);
    const [emptyMessage, setEmptyMessage] = useState(false);
    const [showAddMessage, setShowAddMessage] = useState(false);

    // Get the time consuming queries from the Redux store and set the empty message if the array is empty
    const queries = useSelector((state: RootState) => state.indexer.queries);
    const searchQuery = useSelector((state: RootState) => state.indexer.search);
    
    useEffect(() => {
        let filtered = queries;

        if (searchQuery.trim() !== "") {
            filtered = queries.filter((q) =>
                q.query.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filtered.length === 0) {
            setEmptyMessage(true);
        } else {
            setTimeConsumingQueries(filtered);
            setEmptyMessage(false);
        }
    }, [queries, searchQuery]);

    // Render the empty message using the TabMessageBox component
    if (emptyMessage) {
        return (
            <TabMessageBox
                icon="info"
                title="No data to visualize"
                message="There are not time consuming queries to visualize. Please run diagnostics to get the data."
                url="#"
            />
        );
    }

    // Onclose
    const handleClose = () => {
        setShowAddMessage(false);
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex justify-end">
                <Image className="cursor-pointer" src="/logos/add.png" alt="Add" width={30} height={30} onClick={() => setShowAddMessage(true)} />
            </div>
            <TCQueryDemonstration data={timeConsumingQueries} destination="manual-config" title="Manual Labor"/>
            {showAddMessage && <MessageForAdd onClose={handleClose} />}
        </div>
    )
}

export default Page;