export type TrainedModelParameters = {
    number_of_hidden_layers: number;
    number_of_neurons_per_layer: number;
    early_stopping_patience: number;
    epochs: number;
    batch_size: number;
    validation_split: number;
    rmse: number;
    r2_percentage: number;
    created_at: string;
}

export type TrainedResults = {
    rmse: number;
    r2_percentage: number;
}

export type FormDataForTraining = {
    accessToken: string;
    query_id: number;
    number_of_hidden_layers: number;
    number_of_neurons_per_layer: number;
    early_stopping_patience: number;
    epochs: number;
    batch_size: number;
    validation_split: number;
    using_files: boolean;
    training_data?: File;
}