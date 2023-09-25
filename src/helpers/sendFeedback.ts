export const sendFeedback = (data: string) => {
    return fetch('https://eox8xsoknc484mv.m.pipedream.net', {
        method: 'post',
        body: JSON.stringify({ data })
    })
};
