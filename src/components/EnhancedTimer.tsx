"use client";

import React, { useEffect, useRef } from "react";
import type { TimerState } from "../types";

interface EnhancedTimerProps {
    timer: TimerState;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onDurationChange: (duration: number) => void;
    accentColor?: string;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

const EnhancedTimer: React.FC<EnhancedTimerProps> = ({
    timer,
    onStart,
    onPause,
    onReset,
    onDurationChange,
    accentColor = "#0070FF",
}) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const lastSecondRef = useRef<number>(timer.remaining);
    
    const progress = timer.duration > 0 ? timer.remaining / timer.duration : 0;
    const isLowTime = progress <= 0.33;
    const isFinished = timer.remaining === 0 && timer.duration > 0;
    const isBlinking = timer.isRunning && (isLowTime || isFinished);

    // Initialize audio context
    useEffect(() => {
        if (typeof window !== 'undefined' && !audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    // Play tick sound
    const playTick = (frequency: number = 800, duration: number = 50) => {
        if (!audioContextRef.current) return;
        
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
        
        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    };

    // Play completion sound
    const playCompletionSound = () => {
        if (!audioContextRef.current) return;
        
        const notes = [523.25, 659.25, 783.99]; // C, E, G
        notes.forEach((freq, index) => {
            setTimeout(() => playTick(freq, 200), index * 100);
        });
    };

    // Sound effects
    useEffect(() => {
        if (!timer.isRunning) return;

        // Play tick sound every second
        if (timer.remaining !== lastSecondRef.current) {
            if (isLowTime) {
                playTick(1200, 80); // Higher pitch for low time
            } else {
                playTick(800, 50); // Normal tick
            }
            
            // Play completion sound when timer reaches 0
            if (timer.remaining === 0 && lastSecondRef.current > 0) {
                playCompletionSound();
            }
            
            lastSecondRef.current = timer.remaining;
        }
    }, [timer.remaining, timer.isRunning, isLowTime]);

    const PRESETS = [
        { label: "30s", value: 30 },
        { label: "1m", value: 60 },
        { label: "2m", value: 120 },
        { label: "5m", value: 300 },
    ];

    return (
        <div className="enhanced-timer-container">
            <div 
                className={`timer-card ${isBlinking ? 'timer-blinking' : ''} ${isLowTime ? 'timer-low-time' : ''}`}
                style={{
                    '--accent-color': accentColor,
                    '--shadow-color': isLowTime ? 'oklch(0.6168 0.2086 25.8088)' : accentColor,
                } as React.CSSProperties}
            >
                <div className="timer-display">
                    <div className={`timer-text ${isFinished ? 'timer-finished-text' : ''}`}>
                        {formatTime(timer.remaining)}
                    </div>
                    <div className="timer-label">
                        {isFinished ? 'TIME\'S UP!' : isLowTime ? 'HURRY UP!' : 'TIMER'}
                    </div>
                </div>

                <div className="timer-controls">
                    <div className="timer-main-controls">
                        {!timer.isRunning ? (
                            <button
                                className="timer-btn start-btn"
                                onClick={onStart}
                                disabled={timer.remaining === 0}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Start
                            </button>
                        ) : (
                            <button
                                className="timer-btn pause-btn"
                                onClick={onPause}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                                Pause
                            </button>
                        )}
                        <button
                            className="timer-btn reset-btn"
                            onClick={onReset}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                            </svg>
                            Reset
                        </button>
                    </div>

                    <div className="timer-presets">
                        {PRESETS.map((p) => (
                            <button
                                key={p.value}
                                className={`preset-btn ${timer.duration === p.value ? 'active' : ''}`}
                                onClick={() => onDurationChange(p.value)}
                                disabled={timer.isRunning}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedTimer;
