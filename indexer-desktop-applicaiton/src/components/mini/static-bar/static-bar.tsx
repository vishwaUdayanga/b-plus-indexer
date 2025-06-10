import React from "react";

export default function StaticBar({value}: {value: number}) {

    return (
        <>
            <div className="w-full h-fit bg-[#CFE9E6] rounded-xl">
                <div
                    className="h-2 rounded-xl bg-[#00897A]"
                    style={{ width: `${value}%` }}
                ></div>
            </div>
            <p className="text-sm text-[#00897A]">{value}%</p>
        </>
    )
}