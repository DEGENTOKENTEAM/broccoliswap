import { classNames } from "@/helpers/classNames";

export const Header = (props: { children: any; className?: string }) => {
    return (
        <h2
            className={classNames(
                props.className,
                "font-title font-bold text-4xl"
            )}
        >
            {props.children}
        </h2>
    );
};
