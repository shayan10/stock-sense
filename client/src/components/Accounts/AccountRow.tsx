import React from "react";
import { AccountRowProps } from "./types/AccountProps";
import { AccountItem } from "../AccountItem";
import { Link } from "react-router-dom";

const percentDiff = (x: number, y: number): number => {
    return parseInt(((x - y) / y * 100).toFixed(2));
}

const AccountRow = ({ holding, priceData}: AccountRowProps) => {
    return (
        <tr>
            <th scope="row" className="">
                <Link to={`/holdings/${holding.id}`}>
                <span className="ticker-header">{holding.ticker_symbol}</span>
                <i
                    className="ticker-arrow bi bi-chevron-right"
                ></i>
                </Link>
            </th>
            <td>{holding.quantity}</td>
            <td>{holding.cost_basis}</td>
            <td>
                {priceData ? (
                    <AccountItem num={priceData.current_price} comp={priceData.previous_close} />
                ) : (
                    "Loading..."
                )}
            </td>
            <td>
                {priceData ? (
                    <AccountItem num={priceData.current_percent_change} />
                ) : (
                    "Loading..."
                )}
            </td>
            <td>
                {priceData ? (
                    <AccountItem num={holding.quantity * (priceData.current_price - priceData.previous_close)} comp={priceData.current_price - holding.cost_basis} />
                ) : (
                    "Loading..."
                )}
            </td>
            <td>
                {priceData ? (
                    <AccountItem num={percentDiff(priceData.current_price, holding.cost_basis)} />
                ) : (
                    "Loading..."
                )}
            </td>
            <td>
                {priceData ? (
                    <AccountItem num={holding.quantity * (priceData.current_price - holding.cost_basis)} />
                ) : (
                    "Loading..."
                )}
            </td>
        </tr>
    );
}

export default AccountRow;
