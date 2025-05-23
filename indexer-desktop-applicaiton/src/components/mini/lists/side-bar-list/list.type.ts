export type ListProps = {
    currentTab: string;
    title: string;
    icon: string;
    link: string;
    onClick: ({tab}: {tab: string}) => void;
}