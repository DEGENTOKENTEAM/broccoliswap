import { subAddress } from "@/helpers/address";
import { Chain, Token, chainsInfo } from "@/types";
import Link from "next/link";
import { BiLinkExternal } from "react-icons/bi";

export default function Address(props: { chain: Chain; address: string; isToken?: boolean; }) {
    const path = props.isToken ? "token" : "address";
    return (
        <Link
            href={`${
                chainsInfo[props.chain].explorer
            }${path}/${props.address}`}
            target="_blank"
            onClick={e => e.stopPropagation()}
            className="inline-flex flex-shrink items-center gap-1"
        >
                {subAddress(props.address)}{" "}
                <BiLinkExternal />
        </Link>
    )
}