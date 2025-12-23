'use client';

import React from 'react';
import '@/styles/AmbientBackground.css';

const QNA_POOL_1 = [
    {
        q: "Is investing in stocks halal?",
        a: "Investing is halal if the company's business is permissible in Islam and it avoids excessive interest (riba) and haram activities. Some scholars advise using Sharia-compliant stocks or Islamic index funds."
    },
    {
        q: "How to perform Ghusl?",
        a: "Make the intention (niyyah) for purification, wash hands, private parts, perform wudu, then pour water over the entire body including hair roots, ensuring no part is left dry."
    },
    {
        q: "Ruling on missing Jumu'ah?",
        a: "Missing Jumu'ah without a valid excuse is considered sinful for adult men. Valid excuses include illness, travel, or other genuine incapacity."
    },
    {
        q: "Can I pray in a car?",
        a: "Obligatory prayers should be performed in a proper place if possible. If traveling or unable to stop, you may pray in the car while facing the Qibla."
    },
    {
        q: "What is the Nisaab for Zakat?",
        a: "Nisaab is the minimum amount of wealth a Muslim must possess before being liable for Zakat: 85g of gold or 595g of silver."
    },
    {
        q: "When does Fajr time end?",
        a: "Fajr time ends at the beginning of sunrise."
    },
    {
        q: "Is dropshipping halal?",
        a: "Dropshipping is halal if you have ownership of the goods or a valid agency contract. Selling items you don't own or can't deliver is not permissible."
    },
];

const QNA_POOL_2 = [
    {
        q: "Significance of Laylatul Qadr?",
        a: "Laylatul Qadr is the Night of Decree, better than a thousand months in reward. It occurs in the last ten nights of Ramadan, most likely on odd nights."
    },
    {
        q: "Is gelatine halal?",
        a: "Gelatine is halal if derived from permissible sources, such as plants or properly slaughtered (zabiha) animals. Gelatine from non-halal sources is not allowed."
    },
    {
        q: "Can I fast without Suhoor?",
        a: "Yes, fasting without Suhoor is valid, but eating Suhoor is a Sunnah and brings barakah and strength for the day."
    },
    {
        q: "Ruling on digital drawings?",
        a: "Digital drawings of inanimate objects or permissible art are allowed. Depicting animate beings (humans/animals) in ways that imitate souls is discouraged by many scholars."
    },
    {
        q: "What is Tahajjud?",
        a: "Tahajjud is a voluntary night prayer performed after sleeping, preferably in the last third of the night, seeking closeness to Allah."
    },
    {
        q: "Is mortgage allowed?",
        a: "Most scholars consider conventional mortgages involving interest (riba) prohibited. Alternatives include Islamic home finance or delayed payment plans without interest."
    },
    {
        q: "Benefit of Ayatul Kursi?",
        a: "Reciting Ayatul Kursi offers protection from Shaitan, blessings, and mercy. It is recommended after each obligatory prayer and before sleeping."
    },
];


const Card = ({ item }: { item: { q: string; a: string } }) => (
    <div className="ambient-card">
        <div className="ambient-card__question-box">
            <span className="ambient-card__prefix">Question:</span>
            <p className="ambient-card__question">{item.q}</p>
        </div>
        <div className="ambient-card__divider"></div>
        <div className="ambient-card__answer-box">
            <span className="ambient-card__prefix">Answer:</span>
            <p className="ambient-card__answer">{item.a}</p>
        </div>
    </div>
);

const AmbientBackground = () => {
    return (
        <div className="ambient-background">
            <div className="ambient-column ambient-column--left">
                <div className="ambient-track ambient-track--up">
                    {QNA_POOL_1.map((item, i) => <Card key={i} item={item} />)}
                    {QNA_POOL_1.map((item, i) => <Card key={`dup-${i}`} item={item} />)}
                </div>
            </div>

            <div className="ambient-column ambient-column--right">
                <div className="ambient-track ambient-track--down">
                    {QNA_POOL_2.map((item, i) => <Card key={i} item={item} />)}
                    {QNA_POOL_2.map((item, i) => <Card key={`dup-${i}`} item={item} />)}
                </div>
            </div>

            <div className="ambient-overlay"></div>
        </div>
    );
};

export default AmbientBackground;
