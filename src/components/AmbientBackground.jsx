import React from 'react';
import '../styles/AmbientBackground.css';

const QNA_POOL_1 = [
    { q: "Is investing in stocks halal?", a: "It depends on the company's business model and debt ratios." },
    { q: "How to perform Ghusl?", a: "Begin with intention, then wash the entire body including roots of hair." },
    { q: "Ruling on missing Jumu'ah?", a: "It is a major sin for men unless there is a valid excuse." },
    { q: "Can I pray in a car?", a: "For voluntary prayers, yes. For obligatory, only if impossible to stop." },
    { q: "What is the Nisaab for Zakat?", a: "Equivalent to 85g of gold or 595g of silver." },
    { q: "When does Fajr time end?", a: "At the beginning of sunrise." },
    { q: "Is dropshipping halal?", a: "If you own the product or have a valid agency contract." },
];

const QNA_POOL_2 = [
    { q: "Significance of Laylatul Qadr?", a: "A night better than a thousand months in reward." },
    { q: "Is gelatine halal?", a: "Halal if from vegetable or zabiha animal sources." },
    { q: "Can I fast without Suhoor?", a: "Yes, but Suhoor is a highly recommended Sunnah." },
    { q: "Ruling on digital drawings?", a: "Permissible if they don't depict souls or promote haraam." },
    { q: "What is Tahajjud?", a: "A voluntary night prayer performed after waking from sleep." },
    { q: "Is mortgage allowed?", a: "Most scholars prohibit it due to Riba; some allow it under dire necessity." },
    { q: "Benefit of Ayatul Kursi?", a: "Protection from Shaitan when recited before sleep." },
];

const Card = ({ item }) => (
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
