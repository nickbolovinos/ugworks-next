import React from 'react';

function FooterContent() {

    const currentYear = new Date().getFullYear();

    return (
        <footer>
            <p>&copy;{currentYear} UG Works. All Rights Reserved.</p>
        </footer>
    )

}

export default FooterContent;