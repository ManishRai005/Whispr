import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const BackgroundEffect = () => {
  const canvasRef = useRef(null);
  const particles = [];
  const icpCoins = [];
  const particleCount = 30;
  const coinCount = 5;
  
  // Enhanced color scheme with ICP theme
  const colors = [
    'rgba(139, 92, 246, 0.6)', // Purple
    'rgba(0, 112, 243, 0.6)',  // Blue
    'rgba(255, 107, 0, 0.5)',  // Orange (ICP color)
    'rgba(167, 139, 250, 0.6)'
  ];
  
  // Preload ICP coin image
  const [icpImage, setIcpImage] = useState(null);
  
  useEffect(() => {
    // Load ICP coin image
    const img = new Image();
    img.src = '/api/placeholder/100/100'; // Placeholder for ICP coin image
    img.onload = () => setIcpImage(img);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initialize particles with improved properties
    const initParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.2,
          pulse: Math.random() * 0.02
        });
      }
    };
    
    // Initialize ICP coins
    const initIcpCoins = () => {
      for (let i = 0; i < coinCount; i++) {
        icpCoins.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 30 + 40, // Larger size for coins
          rotation: Math.random() * Math.PI * 2,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          alpha: Math.random() * 0.3 + 0.2,
          pulseSpeed: Math.random() * 0.01,
          pulseAmplitude: Math.random() * 0.1 + 0.05,
          pulsePhase: Math.random() * Math.PI * 2
        });
      }
    };
    
    // Draw a stylized ICP coin
    const drawIcpCoin = (x, y, size, rotation, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Draw coin body
      const gradient = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size);
      gradient.addColorStop(0, 'rgba(255, 107, 0, 0.8)'); // ICP orange
      gradient.addColorStop(0.7, 'rgba(255, 107, 0, 0.6)');
      gradient.addColorStop(1, 'rgba(255, 107, 0, 0.2)');
      
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw coin ring
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
      ctx.lineWidth = size * 0.05;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();
      
      // Draw ICP symbol
      ctx.beginPath();
      // Simplified ICP logo (infinity-like shape)
      const symbolSize = size * 0.4;
      
      // Left circle
      ctx.arc(-symbolSize * 0.3, 0, symbolSize * 0.3, 0, Math.PI * 2);
      // Right circle
      ctx.arc(symbolSize * 0.3, 0, symbolSize * 0.3, 0, Math.PI * 2);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
      
      // If actual image is loaded, use it
      if (icpImage) {
        ctx.drawImage(icpImage, -size * 0.6, -size * 0.6, size * 1.2, size * 1.2);
      }
      
      ctx.restore();
    };
    
    // Animation loop with improved effects
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Clear canvas with dark blue gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(10, 15, 30, 0.15)');
      gradient.addColorStop(1, 'rgba(5, 10, 20, 0.15)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles with pulsing effect
      particles.forEach(particle => {
        // Update position with slight acceleration
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Pulsating size
        const pulseFactor = Math.sin(Date.now() * particle.pulse) * 0.2 + 1;
        
        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Add glow effect
        const glow = ctx.createRadialGradient(
          particle.x, 
          particle.y, 
          0, 
          particle.x, 
          particle.y, 
          particle.size * 4
        );
        glow.addColorStop(0, particle.color.replace(')', ', 0.3)').replace('rgba', 'rgba'));
        glow.addColorStop(1, particle.color.replace(')', ', 0)').replace('rgba', 'rgba'));
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      });
      
      // Update and draw ICP coins
      icpCoins.forEach(coin => {
        // Update position
        coin.x += coin.speedX;
        coin.y += coin.speedY;
        coin.rotation += coin.rotationSpeed;
        
        // Wrap around screen
        if (coin.x < -coin.size) coin.x = canvas.width + coin.size;
        if (coin.x > canvas.width + coin.size) coin.x = -coin.size;
        if (coin.y < -coin.size) coin.y = canvas.height + coin.size;
        if (coin.y > canvas.height + coin.size) coin.y = -coin.size;
        
        // Pulsating size effect
        const pulseFactor = 
          Math.sin(Date.now() * coin.pulseSpeed + coin.pulsePhase) * 
          coin.pulseAmplitude + 1;
          
        // Draw ICP coin
        drawIcpCoin(
          coin.x, 
          coin.y, 
          coin.size * pulseFactor, 
          coin.rotation,
          coin.alpha
        );
      });
      
      // Draw enhanced connections
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150;
          
          if (distance < maxDistance) {
            // Create smoother gradient connections
            const opacity = 0.15 * (1 - distance / maxDistance);
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            
            gradient.addColorStop(0, particles[i].color.replace(')', `, ${opacity})`).replace('rgba', 'rgba'));
            gradient.addColorStop(1, particles[j].color.replace(')', `, ${opacity})`).replace('rgba', 'rgba'));
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
        }
      }
      ctx.stroke();
      
      // Draw connections from particles to ICP coins
      ctx.beginPath();
      particles.forEach(particle => {
        icpCoins.forEach(coin => {
          const dx = particle.x - coin.x;
          const dy = particle.y - coin.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 200;
          
          if (distance < maxDistance) {
            const opacity = 0.2 * (1 - distance / maxDistance);
            ctx.strokeStyle = `rgba(255, 140, 50, ${opacity})`;
            ctx.lineWidth = 1.2;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(coin.x, coin.y);
          }
        });
      });
      ctx.stroke();
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    initParticles();
    initIcpCoins();
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, [icpImage]);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="fixed inset-0 z-0"
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full" 
      />
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 opacity-50">
        ICP Network Visualization
      </div>
    </motion.div>
  );
};

export default BackgroundEffect;