import React from "react";
import { TrainedModelParameters } from "@/api-calls/trainer/trainer.type";
import TabMessageBox from "../tab-message-box/tab-message-box";
import TabLoading from "@/components/mini/loadings/tab-loading/tab-loading";
import StaticBar from "@/components/mini/static-bar/static-bar";

export default function RecentParameters({data, isLoading}: {data: TrainedModelParameters | null, isLoading: boolean}) {
    if (isLoading) {
        return <TabLoading />;
    }

    if (!data) {
        return <TabMessageBox
            icon="info"
            title="No data to visualize"
            message="There are no recent trained model parameters to visualize."
            url="#"
        />;
    }
    console.log(data.created_at)

    return (
        <div className="w-full">
            <div className="flex justify-between items-center">
                <h1 className="font-bold">Recent model parameters</h1>
                <div className="w-fit px-2 rounded-xl bg-[#CFE9E6]">
                    {/* created_at time stamp in readable format */}
                    <p className="text-sm text-[#00897A]">
                        {new Date(data.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </p>
                </div>
            </div>
            <div className="mt-7 w-full">
                <div className="w-full">
                    <p className="text-sm font-bold mb-1">Model accuracy based on R2 score</p>
                    <StaticBar value={data.r2_percentage} />
                </div>
                <div className="w-full mt-2">
                    <p className="text-sm font-bold mb-1">Validation split</p>
                    <StaticBar value={data.validation_split*100} />
                </div>
                <div className="w-full flex justify-between items-center mt-2">
                    <p className="text-sm text-[#00897A]">RMSE</p>
                    <p className="text-sm text-[#00897A]">{data.rmse}</p>
                </div>
                <div className="w-full flex justify-between items-center mt-2">
                    <p className="text-sm text-[#828282]">Number of hidden layers</p>
                    <p className="text-sm text-[#828282]">{data.number_of_hidden_layers}</p>           
                </div>
                <div className="w-full flex justify-between items-center mt-2">
                    <p className="text-sm text-[#828282]">Number of neurons per layer</p>
                    <p className="text-sm text-[#828282]">{data.number_of_neurons_per_layer}</p>
                </div>
                <div className="w-full flex justify-between items-center mt-2">
                    <p className="text-sm text-[#828282]">Early stopping patience</p>
                    <p className="text-sm text-[#828282]">{data.early_stopping_patience}</p>
                </div>
                <div className="w-full flex justify-between items-center mt-2">
                    <p className="text-sm text-[#828282]">Badge size</p>
                    <p className="text-sm text-[#828282]">{data.batch_size}</p>
                </div>
                <div className="w-full flex justify-between items-center mt-2">
                    <p className="text-sm text-[#828282]">Epochs</p>
                    <p className="text-sm text-[#828282]">{data.epochs}</p>
                </div>
            </div>
        </div>
    )
}