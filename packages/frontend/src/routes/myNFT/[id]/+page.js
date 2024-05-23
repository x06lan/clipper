/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    return { nftData: { id: params.id } };
}
