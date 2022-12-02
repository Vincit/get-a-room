import React, { useEffect, useState } from 'react';

export const handleOnClick = (shareDetails: any) => {
    console.log(shareDetails);
    if (navigator.share) {
        navigator
            .share(shareDetails)
            .then(() => {
                console.log('Successfully shared');
            })
            .catch((error) => {
                console.error(
                    'Something went wrong sharing the link',
                    error
                );
            });
    }
};

const useShareInMobile = ({
    label,
    text,
    title,
    url
}: {
    label: string;
    text: string;
    title: string;
    url: string | undefined;
}) => {
    const shareDetails = { url, title, text };

    return (
        <button
            className="share-icon"
            onClick={() => handleOnClick(shareDetails)}
            style={{
                backgroundColor: '#90EE90',
                border: 'none',
                margin: 'auto auto auto 10px'
            }}
        >
            Share
        </button>
    );
};

export default useShareInMobile;
