import React, { useEffect, useState } from 'react';

const useShareInMobile = ({
    label,
    text,
    title,
    url
}: {
    label: string;
    text: string;
    title: string;
    url: string;
}) => {
    const shareDetails = { url, title, text };

    const handleOnClick = () => {
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

    return (
        <button
            className="share-icon"
            onClick={handleOnClick}
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
