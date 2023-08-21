import React, { useContext, useEffect } from "react";
import { QuoteContext } from "../context/QuoteContext";
import { AccountProps } from "./Accounts/types/AccountProps";
import AccountViewer from "./Accounts/AccountViewer";
import PlaidRegisterLink from "./PlaidRegisterLink";

const HoldingsViewer = ({ accounts }: { accounts: AccountProps[] }) => {
    const { refresh } = useContext(QuoteContext);

    useEffect(() => {
        const interval = setInterval(refresh, 20000);

        // Return a cleanup function to clear the interval when the component unmounts
        return () => {
            clearInterval(interval);
        };
    }, []); // Include "refresh" in the dependency array to re-create the interval if it changes

    return (
        <>
            <div className="d-flex justify-content-between">
                <h2>Holdings</h2>
                <button className="btn btn-primary" onClick={refresh}>
                    Refresh
                </button>
            </div>
            <hr />
            {accounts.length === 0 ? <PlaidRegisterLink /> : accounts.map((account) => {
                return <AccountViewer key={account.id} {...account} />;
            })}
        </>
    );
};

export default HoldingsViewer;
