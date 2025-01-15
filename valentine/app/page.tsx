'use client';

import { useState, useEffect, useRef } from 'react';

export default function Page() {
  const [attempts, setAttempts] = useState(0);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const scoreRef = useRef<HTMLDivElement | null>(null);

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

    function handleClick(e: MouseEvent) {
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      const distance = getDistance(
        e.clientX,
        e.clientY,
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
      if (distance < 100) {
        setAttempts((prev) => prev + 1);
      }
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
    targetEl.style.left = '50%';
    targetEl.style.top = '50%';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div ref={targetRef} id="target" />
      <div ref={scoreRef} id="score">Attempts: {attempts}</div>
      <style jsx global>{`
        body {
          margin: 0;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        #target {
          width: 50px;
          height: 50px;
          background: #ff6b6b;
          border-radius: 50%;
          transition: all 0.1s ease-out;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        #score {
          position: fixed;
          top: 20px;
          right: 20px;
          font-family: Arial, sans-serif;
          font-size: 20px;
          color: #444;
        }
      `}</style>
    </>
  );
}