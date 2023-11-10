import { useEffect, useState } from "react";
import { TwitterTimelineEmbed } from "react-twitter-embed"

export const TwitterEmbed = (props: { screenName?: string }) => {
    const [screenName, setScreenName] = useState('');

    // Set screenName with delay, otherwise the feed won't rendern
    useEffect(() => {
        setScreenName('');
        setTimeout(() => {
            if (props.screenName) {
                setScreenName(props.screenName);
            }
        }, 500);
    }, [props.screenName, setScreenName])

    return (
        screenName ? <div className="rounded-lg overflow-hidden">
            <TwitterTimelineEmbed
                sourceType="profile"
                screenName={screenName}
                options={{ height: 400 }}
                theme="dark"
                noHeader
                noFooter
                noBorders
            />
        </div> : null
    )
}