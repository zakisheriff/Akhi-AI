import React from 'react';

const SEOContent = () => {
    return (
        <section className="seo-content" style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
        }}>
            <h1>Akhi AI – Your Brother in Faith & Knowledge</h1>
            <p>
                Akhi AI is an Islamic AI assistant designed to provide authentic answers
                from the Quran, Hadith, and trusted Islamic scholarship. Whether you have
                questions about fiqh, halal and haram matters, prayer times, or Islamic
                rulings, Akhi AI is your knowledgeable companion.
            </p>
            <h2>Authentic Islamic Knowledge</h2>
            <p>
                Our AI draws upon classical Islamic sources including the Holy Quran,
                Sahih Hadith collections, and scholarly consensus. Get answers about
                Salah, Zakat, fasting, Hajj, and everyday fiqh questions based on
                authentic Islamic teachings.
            </p>
            <h2>Features</h2>
            <ul>
                <li>Quran-based guidance with verse references</li>
                <li>Hadith citations from authentic collections</li>
                <li>Fiqh rulings on halal haram matters</li>
                <li>Prayer times and Qibla direction finder</li>
                <li>Educational Islamic content</li>
            </ul>
            <p>
                Built with respect for Islamic scholarship, Akhi AI serves as an
                educational tool to help Muslims around the world access reliable
                Islamic knowledge. Always consult qualified scholars for important rulings.
            </p>
        </section>
    );
};

export default SEOContent;
