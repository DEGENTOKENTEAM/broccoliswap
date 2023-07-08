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
            className="bg-slate-700 px-2 rounded-full cursor-pointer border border-slate-700 hover:border-slate-500 transition-colors hover:bg-slate-500 flex gap-1 items-center text-sm "
            onClick={() => props.refreshFn?.()}
        >
            <IoMdRefresh
                className={classNames(props.tradeLoading && "animate-spin")}
            />
        </div>
    );
};
