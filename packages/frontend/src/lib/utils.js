import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";


export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export const flyAndScale = (
	node,
	params = { y: -8, x: 0, start: 0.95, duration: 150 }
) => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (valueA, scaleA, scaleB) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style) => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export function isActive(path, currentPath) {
	return path === currentPath ? 'text-primary' : 'text-muted-foreground hover:text-primary';
}

export const GetUSDExchangeRate = async (ethAmount) => {
	try {
		const response = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=ETH");
		const result = await response.json();
		const usdRate = result.data.rates.USD;
		return (Number(ethAmount) * parseFloat(usdRate)).toFixed(2); // Convert ETH to USD and format to 2 decimal places
	} catch (error) {
		console.error("Error fetching exchange rate:", error);
		return "N/A";
	}
};

import { abi } from "../../../contract/artifacts/contracts/Movie.sol/Movie.json";
export const CONTRACT_ADDRESS = "0xba4cea22e6535D551DD0723502c74D560049861b";
export const CONTRACT_ABI = abi;


export const getMyNFTs = async () => {
}

export const getNFT = async (id) => {
}
import { PUBLIC_IPFS_UPLOADS, PUBLIC_IPFS_GATEWAY } from "$env/static/public"
export const getFileFromIPFS = (cid) => {
	// const url = "https://ipfs.x06lan.com/ipfs/" + cid;
	// const url = "/api/ipfs/get/" + cid;
	// const url = "https://cloudflare-ipfs.com/ipfs/" + cid;
	// return (await fetch(url)).blob();
	// return url;
	return `${PUBLIC_IPFS_GATEWAY}/${cid}`;
}

export const uploadToIPFS = async (file) => {
	const formData = new FormData();
	formData.append("file", file);
	try {
		const response = await fetch(PUBLIC_IPFS_UPLOADS, {
			method: "POST",
			body: formData,
			redirect: "manual",
		});
		if (!response.ok) {
			if (response.type === "opaqueredirect")
				throw new Error(
					"Request was redirected to HTTPS, which is not supported."
				);
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Error uploading file to IPFS:", error);
		return null; // or handle the error as needed
	}
};
