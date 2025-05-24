import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../../../../../public/animations/loading.json";

export default function TabLoading() {
    return (
        <div className="flex flex-col items-center justify-center">
            <Lottie
                animationData={loadingAnimation}
                loop={true}
                autoplay={true}
                className="w-20 h-20"
            />
            <p className="text-gray-500">Please wait for fetching the data...</p>
        </div>
    )
}