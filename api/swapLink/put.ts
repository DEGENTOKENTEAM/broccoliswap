import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createReturn } from '../helpers/return'
import { getSwapLink, putLink } from '../helpers/swapLink';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log(event.body)
    const { inputToken, inputChain, outputToken, outputChain, amount, link: origLink, pro } = JSON.parse(event.body!);

    let iterator = 0;
    let exists = false;
    let skip = false
    do {
        const existingLink = await getSwapLink(iterator === 0 ? origLink : `${origLink}-${iterator}`);

        if (existingLink) {
            // If it is the same we don't have to iterate up, but can just return the same
            if (
                (
                    !pro
                    && existingLink.inputToken === inputToken
                    && existingLink.inputChain === inputChain
                    && existingLink.outputToken === outputToken
                    && existingLink.outputChain === outputChain
                    && existingLink.amount === amount
                ) || (
                    !pro
                    && existingLink.inputToken === inputToken
                    && existingLink.inputChain === inputChain
                )
            ) {
                exists = false;
                skip = true;
            } else {
                exists = true;
                iterator += 1;
            }
        } else {
            exists = false;
        }
    } while (exists);

    if (!skip) {
        if (pro) {
            await putLink({
                inputToken,
                inputChain,
                link: iterator === 0 ? origLink : `${origLink}-${iterator}`,
                pro,
            });
        } else {
            await putLink({
                inputToken,
                inputChain,
                outputToken,
                outputChain,
                amount,
                link: iterator === 0 ? origLink : `${origLink}-${iterator}`,
            });
        }
    }

    return createReturn(
        200,
        JSON.stringify({
            status: 'success',
            link: iterator === 0 ? origLink : `${origLink}-${iterator}`,
        }),
    )
}
