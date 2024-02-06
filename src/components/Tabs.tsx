import clsx from 'clsx';
import React from 'react';

export default function Tabs(props: {
    tabs: { name: any, current: boolean }[],
    setSelectedTab: (tab: number) => void,
}) {
    const { tabs } = props;

    return (
        <div>
            <nav className="isolate flex divide-x divide-darkblue rounded-lg" aria-label="Tabs">
                {tabs.map((tab, tabIdx) => (
                    <button
                        key={tab.name}
                        onClick={() => props.setSelectedTab(tabIdx)}
                        className={clsx(
                            tab.current ? 'text-white bg-darkblue' : 'text-white bg-dark hover:bg-darkblue',
                            tabIdx === 0 ? 'rounded-tl-lg' : '',
                            tabIdx === tabs.length - 1 ? 'rounded-tr-lg' : '',
                            'group relative min-w-0 flex-1 overflow-hidden py-2 px-2 text-center text-sm focus:z-10 transition-colors font-bold',
                        )}
                        aria-current={tab.current ? 'page' : undefined}
                    >
                        <span>{tab.name}</span>
                        <span
                            aria-hidden="true"
                            className={clsx(
                                'absolute inset-x-0 bottom-0 h-0.5',
                            )}
                        />
                    </button>
                ))}
            </nav>
        </div>
    );
}
