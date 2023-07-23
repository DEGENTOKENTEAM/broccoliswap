import { classNames } from "@/helpers/classNames";

export const SubHeader = (props: { children: any; className?: string }) => {
    return (
        <h2 className={classNames(props.className, "font-bold text-2xl")}>
            {props.children}
        </h2>
    );
};
