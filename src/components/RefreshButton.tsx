import { classNames } from "@/helpers/classNames";
import { useProgress } from "@/hooks/useProgress";
import { IoMdRefresh } from "react-icons/io";

export const RefreshButton = (props: {
    tradeLoading?: boolean;
    refreshFn?: Function;
    interval?: number;
}) => {
    return (
        <div
            className="bg-darkblue px-2 rounded-full cursor-pointer border-2 border-activeblue transition-colors hover:bg-activeblue flex gap-1 items-center text-sm "
            onClick={() => props.refreshFn?.()}
        >
            <IoMdRefresh
                className={classNames(props.tradeLoading && "animate-spin")}
            />
        </div>
    );
};
