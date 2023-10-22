import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createReturn } from '../helpers/return'
import { getSwapLink, putLink } from '../helpers/swapLink';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log(event.body)
    const { inputToken, inputChain, outputToken, outputChain, amount, link: origLink } = JSON.parse(event.body!);

    let iterator = 0;
    let exists = false;
    do {
        const existingLink = await getSwapLink(iterator === 0 ? origLink : `${origLink}-${iterator}`);

        if (existingLink
            && existingLink.inputToken === inputToken
            && existingLink.inputChain === inputChain
            && existingLink.outputToken === outputToken
            && existingLink.outputChain === outputChain
            && existingLink.amount === amount
        ) {
            exists = true;
            iterator += 1;
        } else {
            exists = false;
        }
    } while (exists);

    await putLink({
        inputToken,
        inputChain,
        outputToken,
        outputChain,
        amount,
        link: iterator === 0 ? origLink : `${origLink}-${iterator}`
    });

    return createReturn(
        200,
        JSON.stringify({
            status: 'success',
            link: iterator === 0 ? origLink : `${origLink}-${iterator}`,
        }),
    )
}
