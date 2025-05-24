'use client'

import { FC, useEffect, useState } from "react";
import { TimeConsumingQueries } from "@/types/redux/states";
import { useDispatch } from "react-redux";
import { setQueries } from "@/app-state/indexer_slice";
import TabLoading from "@/components/mini/loadings/tab-loading/tab-loading";
import { runDiagnostics, getStatistics } from "@/api-calls/analyse/analyse";
import TabMessageBox from "@/components/medium/tab-message-box/tab-message-box";
import { TimeConsumingQueriesResponse } from "@/api-calls/analyse/analyse.type";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";


const Page:FC = () => {
    //States
    const [data, setData] = useState<TimeConsumingQueriesResponse>();
    const [loading, setLoading] = useState(true);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [diagnosticsInfo, setDiagnosticsInfo] = useState(false);
    
    const dispatch = useDispatch();
    const accessToken = useSelector((state: RootState) => state.indexer.dba.access_token);

    const fetchData = async () => {
        try {
            const response = await getStatistics({accessToken: accessToken});

            if (response && Array.isArray(response)) {
                setFetchError(false);
                setDiagnosticsInfo(true);
                return;
            } 

            if (response && response.queries) {
                setFetchError(false);
                setData(response);
                dispatch(setQueries(response.queries));
                return;
            }
        } catch {
            setFetchError(true);
        }
    }

    //Fetch data on page load. Show tab message box if the response is an empty array.
    useEffect(() => {
        setLoading(true);
        fetchData()
        setLoading(false);
    }, [dispatch]);

    // Handle diagnostics info
    const handleDiagnosticsInfo = () => {
        setButtonLoading(true);

        const fetchDiagnostics = async () => {
            try {
                const response = await runDiagnostics({accessToken: accessToken});
                if (response && Array.isArray(response)) {
                    return;
                }
                if (response && response.queries) {
                    setData(response);
                    dispatch(setQueries(response.queries));
                    setDiagnosticsInfo(false);
                }
            } catch {
                setFetchError(true);
            } finally {
                setButtonLoading(false);
            }
        }
        fetchDiagnostics();
    }

    // Handle error 
    const handleError = () => {
        setButtonLoading(true);
        fetchData();
        setButtonLoading(false);
    };

    if (diagnosticsInfo) {
        return (
            <TabMessageBox
                icon="info"
                title="No data to visualize"
                message="The time consuming queries have not been found and recorded hence the data cannot be visualized. To visualize them, click on Run diagnostics."
                buttonText="Run Diagnostics"
                loading={buttonLoading}
                disabled={buttonLoading}
                buttonType="info"
                url="#"
                onButtonClick={handleDiagnosticsInfo}
            />
        );
    }

    if (loading) {
        return (
            <TabLoading />
        )
    }

    if (fetchError) {
        return (
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
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <h1 className="text-2xl font-bold mb-4">Time Consuming Queries</h1>
            {data && data.queries.length > 0 ? (
                <ul className="w-full max-w-2xl">
                    {data.queries.map((query, index) => (
                        <li key={index} className="p-4 border-b border-gray-200">
                            <p><strong>Query:</strong> {query.query}</p>
                            <p><strong>Execution Time:</strong> {query.indexes} ms</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No time consuming queries found.</p>
            )}
        </div>
    )
}

export default Page;