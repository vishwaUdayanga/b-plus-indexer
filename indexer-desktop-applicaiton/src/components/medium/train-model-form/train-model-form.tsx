'use client'

import React, { useEffect } from "react";
import z from "zod";
import { ModelTrainingSchema } from "@/schemas/zod/model-train-form";   
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form";
import Button from "@/components/mini/buttons/form-buttons/button";
import TextField from "@/components/mini/form-inputs/text-field";
import FileUpload from "@/components/mini/form-inputs/file-upload";

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

    const onSubmit = (data: TrainedModelParameters) => {
        console.log(queryId)
        console.log('Final submitted values:', data);
    };

    const onFileDrop = (files: FileList) => {
        setValue("training_data", Array.from(files), { shouldValidate: true });
    };

    return (
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
                    />
                </div>
            </form>
        </div>
    );
}