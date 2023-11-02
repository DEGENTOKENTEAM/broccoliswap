import { TwitterTimelineEmbed } from "react-twitter-embed"

export const TwitterEmbed = (props: { screenName: string }) => {
    return (
        <div className="rounded-lg overflow-hidden">
            <TwitterTimelineEmbed
                sourceType="profile"
                screenName={props.screenName}
                options={{height: 400}}
                theme="dark"
                noHeader
                noFooter
                noBorders
            />
        </div>
    )
}