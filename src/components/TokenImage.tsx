import { classNames } from "@/helpers/classNames";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { RiSwapFill } from "react-icons/ri";
import { RxCaretDown } from "react-icons/rx";

export const TokenImage = (props: {
    src?: string;
    symbol: string;
    size?: number;
}) => {
    const [showImage, setShowImage] = useState(!!props.src);

    useEffect(() => {
        setShowImage(!!props.src);
    }, [props.src]);

    return (
        <div className="w-8 h-8 rounded-full relative flex items-center justify-center">
            <div
                className={classNames(
                    showImage ? 'hidden' : 'flex',
                    "absolute bg-slate-800 rounded-full text-white items-center justify-center w-full h-full font-bold"
                )}
            >
                {props.symbol[0]}
            </div>
            {props.src && <Image
                className="absolute"
                width={props.size || 32}
                height={props.size || 32}
                src={props.src}
                alt={`Logo ${props.symbol}`}
                style={{ display: showImage ? undefined : "none" }}
                onError={e => {
                    setShowImage(false);
                }}
            />}
        </div>
    );
};
