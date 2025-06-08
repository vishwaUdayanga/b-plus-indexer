import { TrainModelParams } from "./train-model.type";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TabMessageBox from "@/components/medium/tab-message-box/tab-message-box";

export default function TrainModel({params}: {params: TrainModelParams}) {
    const router = useRouter();
    // Transfer these into the form component
    const [formValues, setFormValues] = useState({
        number_of_hidden_layers: 2,
        number_of_neurons_per_layer: 20,
        early_stopping_patience: 10,
        epochs: 100,
        batch_size: 32,
        validation_split: 0.2,
        using_files: false,
        training_data: null as File | null,
    });

    // Set the form values if the parameters are provided
    useEffect(() => {
        if (params.parameters) {
            setFormValues({
                number_of_hidden_layers: params.parameters.number_of_hidden_layers,
                number_of_neurons_per_layer: params.parameters.number_of_neurons_per_layer,
                early_stopping_patience: params.parameters.early_stopping_patience,
                epochs: params.parameters.epochs,
                batch_size: params.parameters.batch_size,
                validation_split: params.parameters.validation_split,
                using_files: true,
                training_data: null
            });
        }
    }, [params.parameters]);


    return (
        <div>
        </div>
    );
}