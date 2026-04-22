"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import type { Team } from '@/types';

// Extend THREE.Mesh to include custom properties for confetti particles
interface ConfettiParticle extends THREE.Mesh {
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
}

const EndScreenPage = () => {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const [winner, setWinner] = useState<Team | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [confettiActive, setConfettiActive] = useState(true);

  // Mock teams data - in a real app, this would come from state management
  const [teams] = useState<Team[]>([
    {
      id: "team-0",
      name: "Alpha",
      players: [],
      score: 25,
      color: "#0070FF"
    },
    {
      id: "team-1",
      name: "Beta", 
      players: [],
      score: 20,
      color: "#FF4D00"
    }
  ]);

  useEffect(() => {
    try {
      // Determine winner or draw
      if (teams.length > 0) {
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        const topTeam = sortedTeams[0];
        
        // Check if it's a draw (top two teams have same score)
        if (sortedTeams.length > 1 && sortedTeams[1].score === topTeam.score) {
          setIsDraw(true);
          setWinner(null);
        } else {
          setIsDraw(false);
          setWinner(topTeam);
        }
      } else {
        setIsDraw(false);
        setWinner(null);
      }
    } catch (error) {
      console.error('Error determining winner:', error);
      setIsDraw(false);
      setWinner(null);
    }
  }, [teams]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Only run Three.js if there's a winner or it's a draw
    if (!winner && !isDraw) return;

    // Three.js celebration scene
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Create trophy
    const trophyGroup = new THREE.Group();
    
    // Trophy cup
    const cupGeometry = new THREE.CylinderGeometry(2, 1.5, 3, 32);
    const cupMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFD700,
      emissive: 0xFFD700,
      emissiveIntensity: 0.2,
      shininess: 100
    });
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    cup.position.y = 2;
    trophyGroup.add(cup);

    // Trophy handles
    const handleGeometry = new THREE.TorusGeometry(0.8, 0.2, 8, 16);
    const handleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFD700,
      emissive: 0xFFD700,
      emissiveIntensity: 0.1
    });
    
    const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    leftHandle.position.set(-2.5, 2, 0);
    leftHandle.rotation.z = Math.PI / 2;
    trophyGroup.add(leftHandle);
    
    const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    rightHandle.position.set(2.5, 2, 0);
    rightHandle.rotation.z = Math.PI / 2;
    trophyGroup.add(rightHandle);

    // Trophy base
    const baseGeometry = new THREE.CylinderGeometry(3, 3, 1, 32);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8B4513,
      emissive: 0x8B4513,
      emissiveIntensity: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.5;
    trophyGroup.add(base);

    scene.add(trophyGroup);

    // Create confetti
    const confetti: ConfettiParticle[] = [];
    const confettiColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
    
    for (let i = 0; i < 100; i++) {
      const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const material = new THREE.MeshPhongMaterial({
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
      });
      const particle = new THREE.Mesh(geometry, material) as unknown as ConfettiParticle;
      
      particle.position.set(
        (Math.random() - 0.5) * 20,
        Math.random() * 20 - 5,
        (Math.random() - 0.5) * 20
      );
      
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        -Math.random() * 0.1 - 0.05,
        (Math.random() - 0.5) * 0.1
      );
      
      particle.rotationSpeed = new THREE.Vector3(
        Math.random() * 0.1,
        Math.random() * 0.1,
        Math.random() * 0.1
      );
      
      confetti.push(particle);
      scene.add(particle);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate trophy
      trophyGroup.rotation.y += 0.01;
      
      // Animate confetti
      if (confettiActive) {
        confetti.forEach(particle => {
          particle.position.add(particle.velocity);
          particle.rotation.x += particle.rotationSpeed.x;
          particle.rotation.y += particle.rotationSpeed.y;
          particle.rotation.z += particle.rotationSpeed.z;
          
          // Reset confetti that falls too low
          if (particle.position.y < -10) {
            particle.position.y = 20;
            particle.position.x = (Math.random() - 0.5) * 20;
            particle.position.z = (Math.random() - 0.5) * 20;
          }
        });
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      cupGeometry.dispose();
      cupMaterial.dispose();
      handleGeometry.dispose();
      handleMaterial.dispose();
      baseGeometry.dispose();
      baseMaterial.dispose();
      confetti.forEach(particle => {
        particle.geometry.dispose();
        (particle.material as THREE.Material).dispose();
      });
    };
  }, [winner, isDraw, confettiActive]);

  const handleNewGame = () => {
    router.push('/teams');
  };

  if (!winner && !isDraw) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 bg-muted-foreground rounded-full"></div>
          </div>
          <h2 className="text-2xl font-semibold">Determining Winner...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold">
              {isDraw ? (
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">It's a Draw!</span>
              ) : winner ? (
                <>
                  <span 
                    className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                    style={{ 
                      backgroundImage: `linear-gradient(to right, ${winner.color}, ${winner.color}dd)`
                    }}
                  >
                    {winner.name}
                  </span>
                  <span className="text-foreground"> Wins!</span>
                </>
              ) : (
                <span className="text-muted-foreground">Loading...</span>
              )}
            </h1>
            <div className="text-2xl text-muted-foreground">
              {isDraw ? (
                <>Final Score: <span className="text-primary">{teams[0]?.score || 0}</span> - <span className="text-accent">{teams[1]?.score || 0}</span></>
              ) : winner ? (
                <>Final Score: <span 
                  className="font-bold"
                  style={{ color: winner.color }}
                >{winner.score}</span></>
              ) : (
                <>Final Score: Loading...</>
              )}
            </div>
          </div>

          <div ref={mountRef} className="w-full h-96 max-w-2xl mx-auto" />

          <div className="bg-card border border-border rounded-xl p-8">
            <h2 className="text-2xl font-semibold mb-6">Final Standings</h2>
            <div className="space-y-3">
              {teams && teams.length > 0 ? (
                teams
                  .sort((a, b) => (b?.score || 0) - (a?.score || 0))
                  .map((team, index) => (
                    <div 
                      key={team?.id || `team-${index}`} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl ${
                          index === 0 ? 'text-primary' : index === 1 ? 'text-secondary' : index === 2 ? 'text-accent' : 'text-muted-foreground'
                        }`}>
                          {index === 0 ? '??' : index === 1 ? '??' : index === 2 ? '??' : `${index + 1}.`}
                        </div>
                        <div 
                          className="font-medium"
                          style={{ color: team?.color || 'hsl(var(--muted-foreground))' }}
                        >
                          {team?.name || 'Unknown Team'}
                        </div>
                      </div>
                      <div className="text-xl font-bold">
                        {team?.score || 0}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl text-muted-foreground">-</div>
                    <div className="font-medium text-muted-foreground">No teams available</div>
                  </div>
                  <div className="text-xl font-bold text-muted-foreground">0</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
              onClick={handleNewGame}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              New Game 
            </button>
            <button 
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors border border-border"
              onClick={() => router.push('/')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Back to Home
            </button>
            <button 
              className="inline-flex items-center gap-2 px-6 py-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setConfettiActive(!confettiActive)}
            >
              {confettiActive ? '??' : '??'} Toggle Confetti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndScreenPage;
