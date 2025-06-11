'use client'

import React, { useEffect, useState } from "react";
import z from "zod";
import { ModelTrainingSchema } from "@/schemas/zod/model-train-form";   
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form";
import Button from "@/components/mini/buttons/form-buttons/button";
import TextField from "@/components/mini/form-inputs/text-field";
import FileUpload from "@/components/mini/form-inputs/file-upload";
import { TrainedModelParameters } from "@/api-calls/trainer/trainer.type";
import { FormDataForTraining } from "@/api-calls/trainer/trainer.type";
import { trainModel } from "@/api-calls/trainer/trainer";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { TrainedResults } from "@/api-calls/trainer/trainer.type";
import MessageBox from "../message-box/message-box";
import Image from "next/image";
import TabLoading from "@/components/mini/loadings/tab-loading/tab-loading";
import TabMessageBox from "../tab-message-box/tab-message-box";
import StaticBar from "@/components/mini/static-bar/static-bar";

type TrainedModelParametersValidated = z.infer<typeof ModelTrainingSchema>;

export default function TrainModelForm({
    queryId,
    params,
    setRecentParameters
}: {
    queryId: number;
    params: Omit<TrainedModelParametersValidated, 'using_files' | 'training_data'>;
    setRecentParameters: (params: TrainedModelParameters) => void;
}) {
    const accessToken = useSelector((state: RootState) => state.indexer.dba.access_token);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<boolean>(false);
    const [trainedResult, setTrainedResult] = useState<TrainedResults | null>(null);
    const [loadScreen, setLoadScreen] = useState<boolean>(false);


    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm<TrainedModelParametersValidated>({
        resolver: zodResolver(ModelTrainingSchema),
        defaultValues: {
            ...params,
            using_files: true,
            training_data: undefined,
        },
    });

    // Reset form when parameters change
    useEffect(() => {
        reset({
            ...params,
            using_files: true,
            training_data: undefined,
        });
    }, [params, reset]);

    const usingFiles = watch('using_files');

    const onSubmit = (data: TrainedModelParametersValidated) => {
        setIsLoading(true);
        setError(false);
        setLoadScreen(true);
        const formData: FormDataForTraining = {
            accessToken,
            query_id: queryId,
            number_of_hidden_layers: data.number_of_hidden_layers,
            number_of_neurons_per_layer: data.number_of_neurons_per_layer,
            early_stopping_patience: data.early_stopping_patience,
            epochs: data.epochs,
            batch_size: data.batch_size,
            validation_split: data.validation_split,
            using_files: data.using_files,
            training_data: data.using_files ? data.training_data : undefined,
        };

        trainModel(formData)
            .then((response) => {
                // Explicitly type response as TrainedResults
                const trainedResponse = response as import("@/api-calls/trainer/trainer.type").TrainedResults;
                if (trainedResponse) {
                    // The response only contains rmse and r2_percentage
                    const trainedParams: TrainedModelParameters = {
                        number_of_hidden_layers: data.number_of_hidden_layers,
                        number_of_neurons_per_layer: data.number_of_neurons_per_layer,
                        early_stopping_patience: data.early_stopping_patience,
                        epochs: data.epochs,
                        batch_size: data.batch_size,
                        validation_split: data.validation_split,
                        rmse: trainedResponse.rmse,
                        r2_percentage: trainedResponse.r2_score,
                        created_at: new Date().toISOString(), // Assuming current time as created_at
                    };
                    setRecentParameters(trainedParams);
                    setTrainedResult(trainedResponse);
                    reset();
                }
            })
            .catch(() => {
                setError(true);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const onFileDrop = (file: File) => {
        setValue('training_data', file);
    };

    return (
        <>
            <MessageBox 
                messageBoxProps={{
                    visible: loadScreen,
                    onClose: () => setLoadScreen(true)
                }}
            >
                <div className="p-4 rounded-lg shadow-md w-full border border-transparent bg-white border-l-[#00897A] border-l-8">
                    <div className="flex items-center w-full justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Image
                                src={`/logos/info.png`}
                                alt={`Indexer|Info icon`}
                                width={20}
                                height={20}
                            />
                            <span className="text-lg font-bold">Training in progress</span>
                        </div>
                        <div>
                            {!isLoading && (
                                <div
                                    className="w-10 h-10 rounded-md flex items-center justify-center bg-[#EEEEEE] cursor-pointer"
                                    onClick={() => setLoadScreen(false)}
                                >
                                    <Image
                                        src="/logos/close.png"
                                        alt="Indexer|Close icon"
                                        width={10}
                                        height={10}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                        {
                            isLoading ? (
                                <div className="mb-4">
                                    <TabLoading />
                                </div>
                                
                            ) : error ? (
                                <div className="mb-4">
                                    <TabMessageBox
                                        icon="error"
                                        title="Could not fetch data"
                                        message="There has been an error training the model. Please check the API is all set."
                                        url="#"
                                    />
                                </div>
                                
                            ) : trainedResult ? (
                                <div className="w-full">
                                    <div className="flex flex-col items-center justify-center mb-4">
                                        <Image
                                            src={`/logos/success.png`}
                                            alt={`Indexer|Success icon`}
                                            width={50}
                                            height={50}
                                        />
                                        <span className="text-[#828282] mt-2">Training completed</span>
                                    </div>
                                    <div className="w-full">
                                        <div className="w-full">
                                            <p className="text-sm font-bold">Model accuracy based on R2 score</p>
                                            <StaticBar
                                                value={trainedResult.r2_score}
                                            />
                                        </div>
                                        <div className="w-full flex justify-between items-center mt-2">
                                            <p className="text-sm text-[#00897A]">RMSE</p>
                                            <p className="text-sm text-[#00897A]">{trainedResult.rmse}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <TabLoading />
                                </div>
                            )
                        }
                    </div>
                </div>
            </MessageBox>

            <div className="w-full">
                <h1 className="font-bold mb-5">Configure model parameters</h1>
                <form className="w-full">
                    <div className="flex gap-2 items-center">
                        <label className="text-sm font-bold">Using files</label>
                        <input
                            type="checkbox"
                            className="h-5 w-5 text-[#00897A] accent-[#00897A] cursor-pointer"
                            {...register('using_files')}
                            onChange={(e) => setValue('using_files', e.target.checked)}
                        />
                    </div>

                    {usingFiles && (
                        <div className="w-full pt-3">
                            <FileUpload
                                error={typeof errors.training_data?.message === "string" ? errors.training_data.message : undefined}
                                onFileDrop={onFileDrop}
                                {...register("training_data")}
                            />
                        </div>
                    )}
                    <div className="w-full flex justify-between gap-4 mt-4">
                        <div className="w-1/2">
                            <label className="block mb-1 text-sm">Number of Hidden Layers</label>
                            <TextField
                                type="number"
                                placeholder="Number of Hidden Layers"
                                error={errors.number_of_hidden_layers?.message}
                                {...register("number_of_hidden_layers", { valueAsNumber: true })}
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block mb-1 text-sm">Number of Neurons per Layer</label>
                            <TextField
                                type="number"
                                placeholder="Number of Neurons per Layer"
                                error={errors.number_of_neurons_per_layer?.message}
                                {...register("number_of_neurons_per_layer", { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                    <div className="w-full flex justify-between gap-4 mt-4">
                        <div className="w-1/2">
                            <label className="block mb-1 text-sm">Early Stopping Patience</label>
                            <TextField
                                type="number"
                                placeholder="Early Stopping Patience"
                                error={errors.early_stopping_patience?.message}
                                {...register("early_stopping_patience", { valueAsNumber: true })}
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block mb-1 text-sm">Epochs</label>
                            <TextField
                                type="number"
                                placeholder="Number of Epochs"
                                error={errors.epochs?.message}
                                {...register("epochs", { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                    <div className="w-full flex justify-between gap-4 mt-4">
                        <div className="w-1/2">
                            <label className="block mb-1 text-sm">Batch Size</label>
                            <TextField
                                type="number"
                                placeholder="Batch Size"
                                error={errors.batch_size?.message}
                                {...register("batch_size", { valueAsNumber: true })}
                            />
                            
                        </div>
                        <div className="w-1/2">
                            <label className="block mb-1 text-sm">Validation Split</label>
                            <TextField
                                type="number"
                                placeholder="Validation Split (0 to 1)"
                                error={errors.validation_split?.message}
                                {...register("validation_split", { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                    <div className="w-full flex justify-end mt-3">
                        <Button
                            text="Train Model"
                            buttonType="submit"
                            onClick={handleSubmit(onSubmit)}
                            loading={isLoading}
                            disabled={isLoading}
                        />
                    </div>
                </form>
            </div>
        </>
    );
}