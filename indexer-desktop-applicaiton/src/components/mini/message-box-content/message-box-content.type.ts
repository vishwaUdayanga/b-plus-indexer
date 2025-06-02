export type MessageBoxContentProps = {
    title: string;
    type: "info" | "warning" | "error" | "success";
    icon: string;
    onCancel?: () => void;
};