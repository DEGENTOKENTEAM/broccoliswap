import { classNames } from "@/helpers/classNames";
import useOutsideClick from "@/hooks/useOutsideClick";
import { useEffect, useRef, useState } from "react";
import { ImCross } from "react-icons/im";
import { SubHeader } from "./SubHeader";

export const SettingsDialog = (props: {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));

    const clearLocalStorage = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    }

    return (
        <div
            className={classNames(
                "fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] transition-opacity ease-in z-10",
                props.show ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div
                ref={divRef}
                className="max-w-2xl w-full m-5 bg-darkblue border-2 border-activeblue p-5 rounded-xl relative z-20"
            >
                <div className="flex text-2xl text-light-200 mb-3 items-center justify-center">
                    <SubHeader className="flex-grow">Settings</SubHeader>
                    <ImCross
                        className="text-xl cursor-pointer hover:text-activeblue transition-colors"
                        onClick={() => props.setShow?.(false)}
                    />
                </div>
                
                <div
                    className="bg-dark border-2 cursir-pointer border-activeblue px-3 py-2 flex gap-1 items-center rounded-full text-light-200 hover:bg-activeblue transition-colors cursor-pointer"
                    onClick={() => clearLocalStorage()}
                >
                    Clear local storage
                </div>
            </div>
        </div>
    );
};
