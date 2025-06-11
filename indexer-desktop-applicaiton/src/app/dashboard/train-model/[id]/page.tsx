'use client'

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import TrainModel from "@/components/large/train-model/train-model";
import { TrainedModelParameters } from "@/api-calls/trainer/trainer.type";
import { getTrainedModelParameters } from "@/api-calls/trainer/trainer";

export default function Page() {
    const [isLoading, setIsLoading] = useState(true);
    const [trainedModelParameters, setTrainedModelParameters] = useState<TrainedModelParameters | null>(null);

    const router = useRouter();
    const { id } = useParams();

    const accessToken = useSelector((state: RootState) => state.indexer.dba.access_token);
    // Fetch trained model parameters based on the query ID on component render
    useEffect(() => {
        if (id) {
            getTrainedModelParameters({ accessToken, query_id: Number(id) })
                .then((data) => {
                    setTrainedModelParameters(data);
                })
                .catch((error) => {
                    console.error("Error fetching trained model parameters:", error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [id, accessToken]);


    useEffect(() => {
        if (!id) {
            router.push('/dashboard/trainer');
        }
    }, [id, router]);

    return (
        <TrainModel
            params={{
                queryId: id ? Number(id) : 0,
                isLoading,
                parameters: trainedModelParameters
            }}
        />
    );
}