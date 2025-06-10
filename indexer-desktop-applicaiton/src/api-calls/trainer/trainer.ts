import { TrainedModelParameters, TrainedResults, FormDataForTraining } from "./trainer.type";
import { getBaseUrlFromElectron } from "../utils";

export async function getTrainedModelParameters({ accessToken, query_id }: { accessToken: string, query_id: number }) {
    const baseUrl = await getBaseUrlFromElectron();
    // Post request to fetch trained model parameters
    const response = await fetch(`${baseUrl}/fetch_model_attributes`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query_id })
    });


    if (!response.ok) {
        return null
    }

    const data = await response.json();
    if (Array.isArray(data)) {
        return null; 
    }
    return data as TrainedModelParameters;
}

export async function trainModel(formData: FormDataForTraining) {
    const baseUrl = await getBaseUrlFromElectron();
    const formDataObj = new FormData();

    const {
        accessToken,
        query_id,
        number_of_hidden_layers,
        number_of_neurons_per_layer,
        early_stopping_patience,
        epochs,
        batch_size,
        validation_split,
        using_files,
        training_data
    } = formData;

    formDataObj.append("accessToken", accessToken);
    formDataObj.append("query_id", query_id.toString());
    formDataObj.append("number_of_hidden_layers", number_of_hidden_layers.toString());
    formDataObj.append("number_of_neurons_per_layer", number_of_neurons_per_layer.toString());
    formDataObj.append("early_stopping_patience", early_stopping_patience.toString());
    formDataObj.append("epochs", epochs.toString());
    formDataObj.append("batch_size", batch_size.toString());
    formDataObj.append("validation_split", validation_split.toString());
    formDataObj.append("using_files", using_files.toString());

    if (using_files && training_data) {
        formDataObj.append("training_data", training_data);
    }

    const response = await fetch(`${baseUrl}/train_model`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formDataObj
    });

    if (!response.ok) {
        throw new Error('Failed to train model');
    }

    const data = await response.json();
    if (Array.isArray(data)) {
        return [];
    }
    return data as TrainedResults;
}
