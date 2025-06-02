export type TabMessageBoxProps = {
    icon: string;
    title: string;
    message: string;
    buttonText?: string;
    loading?: boolean;
    disabled?: boolean;
    buttonType?: "submit" | "info" | "error" | "logout";
    url: string;
    onButtonClick?: () => void;
}
