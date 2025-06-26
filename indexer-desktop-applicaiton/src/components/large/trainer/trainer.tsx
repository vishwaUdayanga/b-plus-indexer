import React from "react";
import { TimeConsumingQueries } from "@/types/redux/states";
import GeneralTable from "@/components/medium/general-table/general-table";
import { useRouter } from "next/navigation";

export default function TCQueryDemonstration({ data, destination, title }: {data: TimeConsumingQueries[], destination: string, title: string}) {
    const router = useRouter();

    // Redirect to the query details page when a row is clicked
    const handleRowClick = (id: number) => {
        router.push(`/dashboard/${destination}/${id}`);
    };


    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <h1 className="text-xl font-bold ml-2">{title}</h1>
            <div className="flex w-full h-full p-2 overflow-hidden">
                <div className="flex w-full h-fit overflow-auto bg-white rounded p-4">
                    <GeneralTable props={{ data, onRowClick: handleRowClick }} />
                </div>
            </div>
        </div>
    )
}