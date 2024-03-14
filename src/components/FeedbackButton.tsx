import { classNames } from '@/helpers/classNames';
import useDisableScroll from '@/hooks/useDisableScroll';
import useOutsideClick from '@/hooks/useOutsideClick';
import React, { useRef, useState } from 'react';
import { SubHeader } from './SubHeader';
import { ImCross } from 'react-icons/im';
import { sendFeedback } from '@/helpers/sendFeedback';

const FeedbackForm = (props: {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => {
    const [sent, setSent] = useState(false);
    const divRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));
    useDisableScroll(props.show);

    const handleFeedbackForm = async () => {
        await sendFeedback(inputRef.current?.value ?? '')
        setSent(true);
        setTimeout(() => props.setShow?.(false), 5000);
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
                <div className="flex text-2xl text-white mb-3 items-center justify-center">
                    <SubHeader className="flex-grow">Support</SubHeader>
                    <ImCross
                        className="text-xl cursor-pointer hover:text-activeblue transition-colors"
                        onClick={() => props.setShow?.(false)}
                    />
                </div>

                <h2 className="text-lg font-bold">Need help?</h2>
                <p>Check out our <a href="https://docs.dgnx.finance/Help-Centre/Broccoliswap/broccoliswap_help_index" target="_blank" rel="noreferrer" className="font-bold text-degenOrange underline">help center</a> or join <a href="https://t.me/broccoliswapsupport" target="_blank" rel="noreferrer" className="font-bold text-degenOrange underline">our support Telegram group</a>.</p>

                <h2 className="text-lg font-bold">Feedback</h2>
                <div>
                    If you have any feedback we{'\''}d love to hear it!
                    <textarea ref={inputRef} className="w-full h-16 p-3 bg-dark"></textarea>
                    {sent
                        ? '🎉 Thanks for your input!'
                        : <button onClick={handleFeedbackForm} className="bg-darkblue px-2 rounded-full cursor-pointer border-2 border-activeblue transition-colors hover:bg-activeblue">
                            Send
                        </button>}
                </div>

            </div>
        </div>
    );
};


export default function FeedbackButton() { 
    const [show, setShow] = useState(false);

    return (
        <>
            <div
                className="bg-darkblue px-2 rounded-full cursor-pointer border-2 border-activeblue transition-colors hover:bg-activeblue flex gap-1 items-center text-xs "
                onClick={() => setShow(true)}
            >
                Support
            </div>
            <FeedbackForm show={show} setShow={setShow} />
        </>
    )
}