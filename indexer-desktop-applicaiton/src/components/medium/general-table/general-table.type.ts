import { TimeConsumingQueries } from "@/types/redux/states"

export type GeneralTableProps = {
    data: TimeConsumingQueries[];
    onRowClick?: (id: number) => void;
}