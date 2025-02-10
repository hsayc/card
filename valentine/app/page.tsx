'use client';

import { useState, useEffect, useRef } from 'react';

export default function Page() {
  const targetRef = useRef<HTMLButtonElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scale, setScale] = useState(1);
  const [yesText, setYesText] = useState('Yes');
  const [hearts, setHearts] = useState<{ id: number; style: React.CSSProperties }[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const generatedHearts = Array(20)
      .fill(0)
      .map((_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${8 + Math.random() * 6}s`,
        },
      }));
    setHearts(generatedHearts);
  }, []);

  const phrases = [
    'Yes',
    'Are you sure?',
    'Pretty please',
    'Cmonnn',
    'You know you want to!',
    'Pleeeease?',
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % phrases.length;
      setYesText(phrases[index]);
      setScale(1 + (index * 0.1));
    }, 5000);
    
    intervalRef.current = interval; // Store interval ID
    
    return () => clearInterval(interval);
  }, []);

  function getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  function findBestEscapeDirection(
    mouseX: number,
    mouseY: number,
    targetX: number,
    targetY: number
  ) {
    const directions = [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
    ];
    let bestDirection: [number, number] | null = null;
    let maxDistance = -1;

    for (const [dx, dy] of directions) {
      const projectedX = targetX + dx * 100;
      const projectedY = targetY + dy * 100;
      if (
        projectedX < 0 ||
        projectedX > window.innerWidth - 50 ||
        projectedY < 0 ||
        projectedY > window.innerHeight - 50
      ) {
        continue;
      }
      const distance = getDistance(mouseX, mouseY, projectedX, projectedY);
      if (distance > maxDistance) {
        maxDistance = distance;
        bestDirection = [dx, dy];
      }
    }

    if (!bestDirection) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      bestDirection = [
        Math.sign(centerX - targetX),
        Math.sign(centerY - targetY),
      ];
    }
    return bestDirection;
  }

  useEffect(() => {
    const targetEl = targetRef.current;
    if (!targetEl) return;

    function moveTarget(mouseX: number, mouseY: number) {
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      const distance = getDistance(mouseX, mouseY, targetX, targetY);

      // Start evading when mouse is within 250px
      if (distance < 250) {
        const [dx, dy] = findBestEscapeDirection(mouseX, mouseY, targetX, targetY);
        const speed = Math.max(15, (250 - distance) / 2);
        let newX = targetX + dx * speed;
        let newY = targetY + dy * speed;
        newX = Math.max(25, Math.min(window.innerWidth - 75, newX));
        newY = Math.max(25, Math.min(window.innerHeight - 75, newY));
        targetEl.style.left = `${newX}px`;
        targetEl.style.top = `${newY}px`;
      }
    }

    function handleMouseMove(e: MouseEvent) {
      moveTarget(e.clientX, e.clientY);
    }

    function handleResize() {
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      const newX = Math.min(rect.left, window.innerWidth - 75);
      const newY = Math.min(rect.top, window.innerHeight - 75);
      targetEl.style.left = `${newX}px`;
      targetEl.style.top = `${newY}px`;
    }

    // Initial position
    targetEl.style.position = 'absolute';
    
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleYesClick = () => {
    setShowModal(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Clear interval using stored ID
    }
    setYesText('Yes!');
  };

  return (
    <>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Yayyyyy!</h2>
            <div className="card-container">
              <img src="/card.svg" alt="Valentine's Card" className="valentine-card" />
            </div>
            <p>Thank you for being my Valentine! I love you &lt;3 </p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
      <div className="hearts-container">
        {hearts.map(({ id, style }) => (
          <div
            key={id}
            className="heart"
            style={style}
          >
            ❤️
          </div>
        ))}
      </div>
      <div className="button-container">
        <h1 className="valentine-heading">Ruchi, will you be my Valentine?</h1>
        <button 
          className="yes-button" 
          style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
          onClick={handleYesClick}
        >
          {yesText}
        </button>
        <button ref={targetRef} id="target">No</button>
      </div>
    </>
  );
}