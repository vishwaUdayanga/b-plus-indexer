'use client'

import { FC, useEffect, useState } from "react";
import TabMessageBox from "@/components/medium/tab-message-box/tab-message-box";
import { TimeConsumingQueries } from "@/types/redux/states";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";
import Trainer from "@/components/large/trainer/trainer";

const Page: FC = () => {
    // states
    const [timeConsumingQueries, setTimeConsumingQueries] = useState<TimeConsumingQueries[]>([]);
    const [emptyMessage, setEmptyMessage] = useState(false);
    
    // Get the time consuming queries from the Redux store and set the empty message if the array is empty
    const queries = useSelector((state: RootState) => state.indexer.queries);
    useEffect(() => {
        if (queries.length === 0) {
            setEmptyMessage(true);
        } else {
            setTimeConsumingQueries(queries);
            setEmptyMessage(false);
        }
    }, [queries]);

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

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <Trainer data={timeConsumingQueries} />
        </div>
    )
}

export default Page;