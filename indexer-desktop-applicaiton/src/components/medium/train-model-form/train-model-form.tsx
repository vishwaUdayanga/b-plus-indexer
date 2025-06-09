'use client'

import React, { useEffect } from "react";
import z from "zod";
import { ModelTrainingSchema } from "@/schemas/zod/model-train-form";   
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form";
import Button from "@/components/mini/buttons/form-buttons/button";
import TextField from "@/components/mini/text-fields/text-field";

type TrainedModelParameters = z.infer<typeof ModelTrainingSchema>;

export default function TrainModelForm({
    queryId,
    params,
}: {
    queryId: number;
    params: Omit<TrainedModelParameters, 'using_files' | 'training_data'>;
}) {

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm<TrainedModelParameters>({
        resolver: zodResolver(ModelTrainingSchema),
        defaultValues: {
            ...params,
            using_files: false,
            training_data: null,
        },
    });

    // Reset form when parameters change
    useEffect(() => {
        reset({
            ...params,
            using_files: false,
            training_data: null,
        });
    }, [params, reset]);

    const usingFiles = watch('using_files');

    const onSubmit = (data: TrainedModelParameters) => {
        console.log(queryId)
        console.log('Final submitted values:', data);
    };

    return (
        <div className="w-full">
            <h1>Configure model parameters</h1>
            <form className="w-full">
                <div className="flex gap-2">
                    <label>Using files</label>
                    <label className="flex items-center gap-1">
                    <input
                        type="radio"
                        value="true"
                        {...register('using_files')}
                        onChange={() => setValue('using_files', true)}
                    />
                    Yes
                    </label>
                    <label className="flex items-center gap-1">
                    <input
                        type="radio"
                        value="false"
                        {...register('using_files')}
                        onChange={() => setValue('using_files', false)}
                    />
                    No
                    </label>
                </div>

                {usingFiles && (
                    <div className="w-full">
                        <label className="block mb-1">Upload Training Data</label>
                        <input type="file" {...register('training_data')} className="border p-2 w-full" />
                    </div>
                )}
                <div className="w-full flex justify-between gap-2">
                    <div>
                        <label className="block mb-1">Number of Hidden Layers</label>
                        <TextField
                            type="number"
                            placeholder="Number of Hidden Layers"
                            error={errors.number_of_hidden_layers?.message}
                            {...register("number_of_hidden_layers", { valueAsNumber: true })}
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Number of Neurons per Layer</label>
                        <TextField
                            type="number"
                            placeholder="Number of Neurons per Layer"
                            error={errors.number_of_neurons_per_layer?.message}
                            {...register("number_of_neurons_per_layer", { valueAsNumber: true })}
                        />
                    </div>
                </div>
                <div className="w-full flex justify-between gap-2">
                    <div>
                        <label className="block mb-1">Early Stopping Patience</label>
                        <TextField
                            type="number"
                            placeholder="Early Stopping Patience"
                            error={errors.early_stopping_patience?.message}
                            {...register("early_stopping_patience", { valueAsNumber: true })}
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Epochs</label>
                        <TextField
                            type="number"
                            placeholder="Number of Epochs"
                            error={errors.epochs?.message}
                            {...register("epochs", { valueAsNumber: true })}
                        />
                    </div>
                </div>
                <div className="w-full flex justify-between gap-2">
                    <div>
                        <label className="block mb-1">Batch Size</label>
                        <TextField
                            type="number"
                            placeholder="Batch Size"
                            error={errors.batch_size?.message}
                            {...register("batch_size", { valueAsNumber: true })}
                        />
                        
                    </div>
                    <div>
                        <label className="block mb-1">Validation Split</label>
                        <TextField
                            type="number"
                            placeholder="Validation Split (0 to 1)"
                            error={errors.validation_split?.message}
                            {...register("validation_split", { valueAsNumber: true })}
                        />
                    </div>
                </div>
                <div className="w-full flex justify-end mt-4">
                    <Button
                        text="Train Model"
                        buttonType="submit"
                        onClick={handleSubmit(onSubmit)}
                        disabled={Object.keys(errors).length > 0}
                    />
                </div>
            </form>
        </div>
    );
}