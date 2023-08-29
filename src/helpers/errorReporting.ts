/* eslint-disable no-console */
import * as React from 'react';
import Bugsnag, { Event, NotifiableError, OnErrorCallback } from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';

let isInitialized = false;

export const initialize = () => {
    console.log(process.env.NEXT_PUBLIC_BUGSNAG_KEY)
    if (process.env.NEXT_PUBLIC_BUGSNAG_KEY) {
        Bugsnag.start({
            apiKey: process.env.NEXT_PUBLIC_BUGSNAG_KEY,
            plugins: [new BugsnagPluginReact(React)],
            maxBreadcrumbs: 100,
        });
        isInitialized = true;
    }
};

export const getErrorBoundary = () => {
    if (isInitialized) {
        return Bugsnag.getPlugin('react');
    }
    return React.Fragment;
};

export const reportError = (err: Error) => {
    if (isInitialized) {
        Bugsnag.notify(err);
    }
};

export const notify = (
    error: NotifiableError,
    onError?: OnErrorCallback
) => {
    console.log(error);
    if (isInitialized) {
        console.log('notify');
        Bugsnag.notify(error, onError);
    } else {
        console.error(error);
        if (onError) {
            const fakeEvent = { addMetadata: console.error } as unknown as Event;
            onError(fakeEvent, () => {});
        }
    }
};
