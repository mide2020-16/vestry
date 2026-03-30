const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

  @keyframes strokeCycle {
    0%   { stroke: #fb923c; }
    16%  { stroke: #facc15; }
    33%  { stroke: #4ade80; }
    50%  { stroke: #38bdf8; }
    66%  { stroke: #f472b6; }
    83%  { stroke: #fb923c; }
    100% { stroke: #fb923c; }
  }

  .outline-letter {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(2.8rem, 10vw, 5.5rem);
    font-weight: 800;
    fill: transparent;
    stroke-width: 1.5px;
    animation: strokeCycle 5s ease-in-out infinite;
    letter-spacing: 0.05em;
  }
`;

interface OutlineTitleProps {
  text: string;
}

export default function OutlineTitle({ text }: OutlineTitleProps) {
  return (
    <>
      <style>{STYLES}</style>
      <svg
        width="100%"
        viewBox="0 0 900 90"
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible", maxHeight: 90 }}
        aria-label={text}
        role="img"
      >
        <text x="50%" y="78" textAnchor="middle" className="outline-letter">
          {text}
        </text>
      </svg>
    </>
  );
}
