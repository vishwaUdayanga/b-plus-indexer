'use client'

import { TrainModelParams } from "./train-model.type";
import React from "react";
import { useState, useEffect } from "react";
import TrainModelForm from "@/components/medium/train-model-form/train-model-form";
import { TrainedModelParameters } from "@/api-calls/trainer/trainer.type";
import RecentParameters from "@/components/medium/recent-model-params/recent-parameters";

export default function TrainModel({params}: {params: TrainModelParams}) {
    const [recentParameters, setRecentParameters] = useState<TrainedModelParameters | null>(params.parameters || null);

    useEffect(() => {
        if (params.parameters) {
            setRecentParameters(params.parameters);
        }
    }
    , [params.parameters]);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <h1 className="text-xl font-bold ml-2">Train Model {params.queryId} {params.parameters?.epochs}</h1>
            <div className="flex w-full h-full p-2 gap-4 overflow-hidden">
                <div className="bg-white rounded p-4 w-2/5 h-fit">
                    <TrainModelForm
                        queryId={params.queryId}
                        params={{
                            number_of_hidden_layers: params.parameters?.number_of_hidden_layers || 2,
                            number_of_neurons_per_layer: params.parameters?.number_of_neurons_per_layer || 20,
                            early_stopping_patience: params.parameters?.early_stopping_patience || 10,
                            epochs: params.parameters?.epochs || 200,
                            batch_size: params.parameters?.batch_size || 32,
                            validation_split: params.parameters?.validation_split || 0.2,
                        }}
                        setRecentParameters={setRecentParameters}
                    />
                </div>
                <div className="bg-white rounded h-fit p-4 w-3/5 flex justify-center">
                    <RecentParameters
                        data={recentParameters}
                        isLoading={params.isLoading}
                    />
                </div>
            </div>
        </div>
    );
}