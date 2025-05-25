'use client'

import { FC, useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setQueries } from "@/app-state/indexer_slice";
import TabLoading from "@/components/mini/loadings/tab-loading/tab-loading";
import { runDiagnostics, getStatistics } from "@/api-calls/analyse/analyse";
import TabMessageBox from "@/components/medium/tab-message-box/tab-message-box";
import { TimeConsumingQueriesResponse } from "@/api-calls/analyse/analyse.type";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";
import Analyse from "@/components/large/analyse/analyse";


const Page:FC = () => {
    //States
    const [data, setData] = useState<TimeConsumingQueriesResponse>();
    const [loading, setLoading] = useState(true);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [diagnosticsInfo, setDiagnosticsInfo] = useState(false);
    
    const dispatch = useDispatch();
    const accessToken = useSelector((state: RootState) => state.indexer.dba.access_token);

    const fetchData = useCallback(async () => {
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
    }, [accessToken, dispatch])

    //Fetch data on page load. Show tab message box if the response is an empty array.
    useEffect(() => {
        const callFetch = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        };

        callFetch();
    }, [fetchData]);

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
    const handleError = async () => {
        setButtonLoading(true);
        try {
            await fetchData();
        } catch {
            setFetchError(true);
        } finally {
            setButtonLoading(false);
        }
    }

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
        <>
            {data && data.queries && data.queries.length > 0 ? (
                <Analyse data={data} />
            ) : (
                <TabLoading />
            )}
        </>
    )
}

export default Page;