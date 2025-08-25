'use client'

import { TimeConsumingQueries } from "@/types/redux/states"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { changeAutoIndexRequest, indexStatus, removeIndexRequest, addIndexRequest } from "@/api-calls/manual-labor/manual-labor.type"
import { changeAutoIndex, getIndexStatus, materializeIndexes, deMaterializeIndexes, removeIndex, addIndex, deleteTCQuery } from "@/api-calls/manual-labor/manual-labor"
import MessageBox from "@/components/medium/message-box/message-box"
import MessageBoxContent from "@/components/mini/message-box-content/message-box-content";
import Button from "@/components/mini/buttons/form-buttons/button"
import { RootState } from "@/app/store";
import { useSelector, useDispatch } from "react-redux";
import { updateQuery, removeQuery } from "@/app-state/indexer_slice"
import Image from "next/image"
import { CreateIndexRequestSchema } from './../../../schemas/zod/create-index';
import Input from "@/components/mini/form-inputs/input"
import { useRouter } from "next/navigation"

export default function ManualConfiguration({props}: {props: TimeConsumingQueries | undefined}) {
    const [showMessageToChangeAutoIndexing, setShowMessageToChangeAutoIndexing] = useState(false);
    const [showMessageToCreateIndexes, setShowMessageToCreateIndexes] = useState(false);
    const [showMessageToRemoveIndexes, setShowMessageToRemoveIndexes] = useState(false);
    const [showMessageToAddIndex, setShowMessageToAddIndex] = useState(false);
    const [showMessageToDeleteTCQuery, setShowMessageToDeleteTCQuery] = useState(false);

    const [indexStatus, setIndexStatus] = useState<indexStatus[] | undefined>(undefined);
    const [currentIndexToDelete, setCurrentIndexToDelete] = useState<string | undefined>(undefined);
    const [indexCommand, setIndexCommand] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const router = useRouter();


    // Redux data
    const accessToken = useSelector((state: RootState) => state.indexer.dba.access_token);
    const dispatch = useDispatch();

    // Get index statuses
    useEffect(() => {
        const fetchIndexStatus = async () => {
            if (!props) return;

            const response = await getIndexStatus({query_id: String(props.id), access_token: accessToken});
            setIndexStatus(response.indexes);
        };

        fetchIndexStatus();
    }, [props, accessToken, showMessageToCreateIndexes, showMessageToRemoveIndexes, currentIndexToDelete, showMessageToAddIndex]);

    // Handle the change auto indexing request
    const handleChangeAutoIndex = async () => {
        if (!props) return;

        setLoading(true);

        const request: changeAutoIndexRequest = {
            query_id: props.id,
            enable: !props.auto_indexing
        };

        try {
            await changeAutoIndex({data: request, access_token: accessToken});
            dispatch(updateQuery({...props, auto_indexing: !props.auto_indexing}));
            setShowMessageToChangeAutoIndexing(false);
        } catch (error) {
            console.error("Error changing auto index:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle the materialize indexes request
    const handleMaterializeIndexes = async () => {
        if (!props) return;

        setLoading(true);

        try {
            await materializeIndexes({query_id: String(props.id), access_token: accessToken});
            // Change existing indexes status. Set all queries index status to materialized
            setIndexStatus((prev) => prev?.map((index) => {
                return {...index, status: "materialized"};
            }));
            setShowMessageToCreateIndexes(false);
        } catch (error) {
            console.error("Error materializing indexes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle the de-materialize indexes request
    const handleDeMaterializeIndexes = async () => {
        if (!props) return;

        setLoading(true);

        try {
            await deMaterializeIndexes({query_id: String(props.id), access_token: accessToken});
            // Change existing indexes status. Set all queries index status to not materialized
            setIndexStatus((prev) => prev?.map((index) => {
                return {...index, status: "not_materialized"};
            }));
            setShowMessageToRemoveIndexes(false);
        } catch (error) {
            console.error("Error de-materializing indexes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle removing index
    const handleRemoveIndex = async () => {
        if (!props) return;

        setLoading(true);

        if (!currentIndexToDelete) {
            setLoading(false);
            return;
        }

        const fullStatement = props.indexes.find(cmd =>
            cmd.includes(currentIndexToDelete)
        );

        if (!fullStatement) {
            console.error("Index statement not found for:", currentIndexToDelete);
            setLoading(false);
            return;
        }

        const request: removeIndexRequest = {
            query_id: props.id,
            index: fullStatement
        };

        try {
            await removeIndex({data: request, access_token: accessToken});
            // Remove the index from the redux store
            const updatedQuery = {
                ...props,
                indexes: props.indexes.filter(cmd => cmd !== fullStatement)
            };
            dispatch(updateQuery(updatedQuery));
            setCurrentIndexToDelete(undefined);
        } catch (error) {
            console.error("Error removing index:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle add index
    const handleAddIndex = async () => {
        if (!props) return;

        setLoading(true);

        const commandToValidate = {
            index_command: indexCommand || ""
        }

        // Validate the command
        const validatedResult = CreateIndexRequestSchema.safeParse(commandToValidate);
        if (!validatedResult.success) {
            const errors = validatedResult.error.flatten().fieldErrors;
            if (errors.index_command) {
                setError(errors.index_command[0]);
            } else {
                setError("Validation error. Please check your input.");
            }
            setLoading(false);
            return;
        }

        const request: addIndexRequest = {
            query_id: props.id,
            index: indexCommand
        };

        try {
            await addIndex({data: request, access_token: accessToken});
            // Add the index to the redux store
            const updatedQuery = {
                ...props,
                indexes: [...props.indexes, indexCommand]
            };
            dispatch(updateQuery(updatedQuery));
            setIndexCommand("");
            setShowMessageToAddIndex(false);
        } catch (error) {
            console.error("Error adding index:", error);
        } finally {
            setLoading(false);
        }
    }

    // Handle delete TC query
    const handleDeleteTCQuery = async () => {
        if (!props) return;

        setLoading(true);

        try {
            await deleteTCQuery({query_id: String(props.id), access_token: accessToken});
            // Remove the query from the redux store
            dispatch(removeQuery(props.id));
            setShowMessageToDeleteTCQuery(false);
            // Redirect to the query page
            router.push(`/dashboard/manual-labor`);
        } catch (error) {
            console.error("Error deleting TC query:", error);
        } finally {
            setLoading(false);
        }
    };

    if (showMessageToChangeAutoIndexing) {
        return (
            <MessageBox
                messageBoxProps={{
                    visible: true,
                    onClose: () => setShowMessageToChangeAutoIndexing(false)
                }}
            >
                <MessageBoxContent
                    messageBoxContent={{
                        title: "Change Auto Indexing",
                        type: "info",
                        icon: "info",
                        onCancel: () => setShowMessageToChangeAutoIndexing(false)
                    }}
                >
                    <p className="text-sm w-11/12">Are you sure you want to change the auto indexing setting? If the auto indexing is true it will start materializing the indexes automatically.</p>

                    <Button
                        text="Change"
                        loading={loading}
                        disabled={loading}
                        buttonType="submit"
                        onClick={handleChangeAutoIndex}
                    />
                </MessageBoxContent>
            </MessageBox>
        );
    }

    if (showMessageToCreateIndexes) {
        return (
            <MessageBox
                messageBoxProps={{
                    visible: true,
                    onClose: () => setShowMessageToCreateIndexes(false)
                }}
            >
                <MessageBoxContent
                    messageBoxContent={{
                        title: "Materialize Indexes",
                        type: "info",
                        icon: "info",
                        onCancel: () => setShowMessageToCreateIndexes(false)
                    }}
                >
                    <p className="text-sm w-11/12">Are you sure you want to materialize the indexes for this query?</p>

                    <Button
                        text="Materialize"
                        loading={loading}
                        disabled={loading}
                        buttonType="submit"
                        onClick={handleMaterializeIndexes}
                    />
                </MessageBoxContent>
            </MessageBox>
        );
    }

    if (showMessageToRemoveIndexes) {
        return (
            <MessageBox
                messageBoxProps={{
                    visible: true,
                    onClose: () => setShowMessageToRemoveIndexes(false)
                }}
            >
                <MessageBoxContent
                    messageBoxContent={{
                        title: "Remove Indexes",
                        type: "info",
                        icon: "info",
                        onCancel: () => setShowMessageToRemoveIndexes(false)
                    }}
                >
                    <p className="text-sm w-11/12">Are you sure you want to remove the indexes for this query?</p>

                    <Button
                        text="Remove"
                        loading={loading}
                        disabled={loading}
                        buttonType="submit"
                        onClick={handleDeMaterializeIndexes}
                    />
                </MessageBoxContent>
            </MessageBox>
        );
    }

    if (currentIndexToDelete) {
        return (
            <MessageBox
                messageBoxProps={{
                    visible: true,
                    onClose: () => setCurrentIndexToDelete(undefined)
                }}
            >
                <MessageBoxContent
                    messageBoxContent={{
                        title: "Delete Index",
                        type: "info",
                        icon: "info",
                        onCancel: () => setCurrentIndexToDelete(undefined)
                    }}
                >
                    <p className="text-sm w-11/12">Are you sure you want to delete the index for this query?</p>

                    <Button
                        text="Delete"
                        loading={loading}
                        disabled={loading}
                        buttonType="submit"
                        onClick={handleRemoveIndex}
                    />
                </MessageBoxContent>
            </MessageBox>
        );
    }

    if (showMessageToAddIndex) {
        return (
            <MessageBox
                messageBoxProps={{
                    visible: true,
                    onClose: () => setShowMessageToAddIndex(false)
                }}
            >
                <MessageBoxContent
                    messageBoxContent={{
                        title: "Add Index",
                        type: "info",
                        icon: "info",
                        onCancel: () => setShowMessageToAddIndex(false)
                    }}
                >
                    <Input
                        placeholder="Create Index Name"
                        type="text"
                        value={indexCommand}
                        onChange={(e) => setIndexCommand(e.target.value)}
                        error={error}
                    />
                    
                    <Button
                        text="Create"
                        loading={loading}
                        disabled={loading}
                        buttonType="submit"
                        onClick={handleAddIndex}
                    />
                </MessageBoxContent>
            </MessageBox>
        );
    }

    if (showMessageToDeleteTCQuery) {
        return (
            <MessageBox
                messageBoxProps={{
                    visible: true,
                    onClose: () => setShowMessageToDeleteTCQuery(false)
                }}
            >
                <MessageBoxContent
                    messageBoxContent={{
                        title: "Delete Query",
                        type: "error",
                        icon: "info",
                        onCancel: () => setShowMessageToDeleteTCQuery(false)
                    }}
                >
                    <p className="text-sm w-11/12">Are you sure you want to delete this query?</p>

                    <Button
                        text="Delete"
                        loading={loading}
                        disabled={loading}
                        buttonType="logout"
                        onClick={handleDeleteTCQuery}
                    />
                </MessageBoxContent>
            </MessageBox>
        );
    }

    return (
        <div className="w-full h-full flex flex-col overflow-auto">
            <h1 className="text-xl font-bold ml-2">Manual Configuration</h1>
            <div className="flex w-full h-full p-2 gap-4 overflow-auto">
                <div className="bg-white rounded p-4 w-4/5 h-fit">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Query Details</h2>
                        <button onClick={() => setShowMessageToChangeAutoIndexing(true)} className={clsx(
                            "px-3 py-1 text-sm rounded-2xl",
                            {
                                "text-[#00897A] bg-[#CFE9E6]": props?.auto_indexing,
                                "text-[#828282] bg-[#E0E0E0]": !props?.auto_indexing
                            }
                        )}>
                            {props?.auto_indexing ? "Auto Indexing On" : "Auto Indexing Off"}
                        </button>
                    </div>
                    <div className="">
                        <h1 className="font-bold mt-5 mb-2">Query</h1>
                        <div className="p-2 bg-[#CFE9E6] rounded-md">
                            <p className="text-sm text-[#00897A]">{props?.query}</p>
                        </div>
                    </div>

                    <div className="">
                        <div className="flex items-center mt-2 justify-between">
                            <h1 className="font-bold mb-2">Indexes</h1>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 text-sm rounded-2xl bg-[#00897A] text-[#FFFFFF]" onClick={() => setShowMessageToCreateIndexes(true)}>
                                    Materialized
                                </button>
                                <button className="px-3 py-1 text-sm rounded-2xl bg-[#E54A3B] text-[#FFFFFF]" onClick={() => setShowMessageToRemoveIndexes(true)}>
                                    De Materialized
                                </button>
                            </div>
                        </div>
                            {
                            Array.isArray(indexStatus) && indexStatus.length > 0 ? (
                                indexStatus.map((index, idx) => (
                                    <div className="flex gap-2" key={idx}>
                                        <div className={clsx(
                                            "p-2 rounded-md mb-2",
                                            {
                                                "bg-[#CFE9E6] text-[#00897A]": index.status === "materialized",
                                                "bg-[#E0E0E0] text-[#828282]": index.status === "not materialized"
                                            }
                                        )}>
                                            <p className="text-sm">{index.index_name}</p>
                                        </div>
                                        <div>
                                            <Image className="cursor-pointer" src="/logos/delete.png" alt="Index Delete" width={35} height={35} onClick={() => setCurrentIndexToDelete(index.index_name)}/>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-2 bg-[#E6E6E6] rounded-md">
                                    <p className="text-sm text-[#454545]">No indexes found for this query.</p>
                                </div>
                            )
                            }
                    </div>
                    <div className="mt-2">
                        <h2 className="font-bold">Other Statistics</h2>
                        <div className="w-full flex justify-between items-center mt-2">
                            <p className="text-sm">Total execution time</p>
                            <p className="text-sm text-[#00897A]">{props?.total_exec_time}</p>
                        </div>
                        <div className="w-full flex justify-between items-center mt-2">
                            <p className="text-sm">Mean execution time</p>
                            <p className="text-sm text-[#00897A]">{props?.mean_exec_time}</p>
                        </div>
                        <div className="w-full flex justify-between items-center mt-2">
                            <p className="text-sm">Number of calls</p>
                            <p className="text-sm text-[#00897A]">{props?.calls}</p>
                        </div>
                        <div className="w-full flex justify-between items-center mt-2">
                            <p className="text-sm">Temporary blocks written</p>
                            <p className="text-sm text-[#00897A]">{props?.temp_blks_written}</p>
                        </div>
                        <div className="w-full flex justify-between items-center mt-2">
                            <p className="text-sm">Shared blocks read</p>
                            <p className="text-sm text-[#00897A]">{props?.shared_blks_read}</p>
                        </div>
                        <div className="w-full flex justify-between items-center mt-2">
                            <p className="text-sm">Score</p>
                            <p className="text-sm text-[#00897A]">{props?.score}</p>
                        </div>
                        <div className="w-full flex justify-between items-center mt-2">
                            <p className="text-sm">Estimated time for indexes</p>
                            <p className="text-sm text-[#00897A]">{props?.estimated_time_for_indexes}</p>
                        </div>
                        <div className="w-full flex justify-between items-center mt-2">
                            <p className="text-sm">Next time execution</p>
                            <p className="text-sm text-[#00897A]">{props?.next_time_execution}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <div className="w-40">
                            <Button
                                text="Delete Query"
                                buttonType="logout"
                                onClick={() => setShowMessageToDeleteTCQuery(true)}
                            />
                        </div>
                        <div className="w-40">
                            <Button
                                text="Add Index"
                                buttonType="submit"
                                onClick={() => setShowMessageToAddIndex(true)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}