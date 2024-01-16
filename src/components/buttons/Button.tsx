import { classNames } from "@/helpers/classNames";

const buttonStyle = "w-full mt-10 px-3 py-3 rounded-xl my-3 text-lg flex items-center justify-center text-light-200 font-bold bg-dark border-activeblue border-2 uppercase transition-colors"

export default function Button (props: {
    children: any;
    disabled?: boolean;
    animating?: boolean;
    active?: boolean;
    onClick?: Function;
    infoMessageBorderColor?: string;
    infoMessage?: string;
}) { 
    return (
        <>
            <div
                className={classNames(
                    buttonStyle,
                    props.disabled && "cursor-not-allowed",
                    props.animating && "animate-pulse",
                    props.active && "hover:bg-activeblue cursor-pointer"
                )}
                onClick={() => props.onClick?.()}
            >
                {props.children}
            </div>
            {props.infoMessage && <div className={classNames("bg-dark border-2 p-3 rounded-xl text-center text-light-200 my-3 font-bold lg:max-w-md", props.infoMessageBorderColor)}>
                {props.infoMessage}
            </div>}
        </>
    );
}