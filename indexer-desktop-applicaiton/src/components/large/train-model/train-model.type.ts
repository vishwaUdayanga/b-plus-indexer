import { TrainedModelParameters } from "@/api-calls/trainer/trainer.type"

export type TrainModelParams = {
    queryId: number;
    parameters: TrainedModelParameters | null;
    isLoading: boolean;
}
