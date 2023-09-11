import React, { useEffect, useState } from "react";
import { Table, TableData } from "@finos/perspective";
import "@finos/perspective-viewer/dist/css/pro-dark.css";

import perspective from "@finos/perspective";
import { HoldingProps } from "../Positions/types/HoldingProps";
import axios from "../../api/axios";
import { DateTime } from "luxon";
import { io } from "socket.io-client"; // Import socket.io-client library

interface PerspectiveViewerElement extends HTMLElement {
	load: (table: Table) => void;
	restore: (args: any) => void;
}

function fetchLayout() {
	const layout = {
		plugin: "Candlestick",
		plugin_config: {},
		title: "Candlestick",
		group_by: ["bucket(\"timestamp\", 'm')"],
		row_pivots: ["timestamp"],
		// filter: [["timestamp", ">", currentDay.toUnixInteger()]],
		split_by: [],
		columns: ["open", "close", "low", "high"],
		sort: [],
		aggregates: {
			open: "avg",
			high: "high",
			low: "low",
			close: "last",
		},
		expressions: [
			"bucket(\"timestamp\", 'm')",
			'// close\nif("_close" > 0, "_close", "open")',
			'// high\nif("_high" > 0, "_high", "open")',
			'// low\nif("_low" > 0, "_low", "open")',
		],
	};

	return layout;
}

const Graph = ({ historicalPrices, ticker_symbol }: HoldingProps) => {
	const [table, setTable] = useState<Table | undefined>();
	const socket = io("https://io-stocksense.shayankhan.dev"); // Initialize socket.io connection
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [events, setEvents] = useState([]);

	useEffect(() => {
		const schema = {
			open: "float",
			_close: "float",
			_high: "float",
			_low: "float",
			timestamp: "datetime",
		};

		const table_worker = perspective.worker();
		table_worker.table(schema).then((value) => setTable(value));

		return () => {
			// Cleanup: remove perspective-viewer element manually
			const elem = document.getElementsByTagName(
				"perspective-viewer"
			)[0] as PerspectiveViewerElement;
			if (elem) {
				elem.remove();
			}
		};
	}, []);

	useEffect(() => {
		if (table) {
			const elem = document.getElementsByTagName(
				"perspective-viewer"
			)[0] as PerspectiveViewerElement;

			if (elem) {
				elem.load(table);
				elem.setAttribute("view", "Candlestick");
				elem.setAttribute("title", ticker_symbol);
				elem.setAttribute(
					"columns",
					JSON.stringify(["open", "close", "high", "float"])
				);
				elem.setAttribute(
					"aggregates",
					JSON.stringify({
						open: "avg",
						close: "last",
						low: "low",
						high: "high",
					})
				);
				elem.setAttribute(
					"group_by",
					JSON.stringify(["bucket(\"timestamp\", 's')"])
				);
				const settings = !/(iPad|iPhone|iPod)/g.test(
					navigator.userAgent
				);
				elem.restore({
					theme: "Pro Light",
					settings,
					...fetchLayout(),
				});

				// Function to update historical data to the table
				const updateHistoricalData = (startIndex: number) => {
					const endIndex = Math.min(
						startIndex + 60,
						historicalPrices.length
					);
					for (
						let index = startIndex;
						index < endIndex;
						index++
					) {
						const priceData = historicalPrices[index];
						table.update([
							{
								timestamp: priceData.timestamp,
								open: priceData.open,
								_close: priceData.close,
								_high: priceData.high,
								_low: priceData.low,
							},
						] as unknown as TableData);
					}

					if (endIndex < historicalPrices.length) {
						// Continue with the next iteration after 5 seconds
						setTimeout(() => {
							updateHistoricalData(endIndex);
						}, 2000);
					} else {
						// Send websocket request after all iterations are done
						socket.send(JSON.stringify({ ticker_symbol }));
					}
				};

				const onQuoteEvent = (response: any) => {
					const data = JSON.parse(response);
					console.log("Received data from");
					console.log(data);

					if (data && Array.isArray(data) && table) {
						data.forEach((point) => {
							console.log("Adding to table")
							table.update([
								{
									open: point.p,
									timestamp: DateTime.fromMillis(
										point.t
									)
										.toJSDate()
										.toISOString(),
								},
							] as unknown as TableData);
						});
					}
				};

				socket.on("quote", onQuoteEvent);

				// Start the iteration
				updateHistoricalData(0);

				// Cleanup: remove perspective-viewer element manually
				return () => {
					if (elem) {
						elem.remove();
					}
					socket.off("quote");
				};
			}
		}
	}, [table]);

	useEffect(() => {
		const onConnect = () => {
			console.log("Connected!");
			setIsConnected(true);
		};
		const onDisconnect = () => setIsConnected(false);

		socket.open();
		socket.on("connect", onConnect);

		socket.on("disconnect", onDisconnect);

		return () => {
			socket.disconnect();
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
		};
	}, []);

	return React.createElement("perspective-viewer");
};

export default Graph;
