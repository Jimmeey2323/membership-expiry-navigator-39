
import React, { useEffect, useState } from 'react';

interface AnimationElement {
  id: number;
  content: string;
  xStart: number;
  yStart: number;
  xEnd?: number;
  yEnd?: number;
  rotation: number;
  delay: number;
  isNumber: boolean;
}

const ProcessingAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [elements, setElements] = useState<AnimationElement[]>([]);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Generate random animation elements
    const generateElements = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const newElements: AnimationElement[] = [];
      
      // Generate letters
      for (let i = 0; i < 40; i++) {
        const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
        
        newElements.push({
          id: i,
          content: randomChar,
          xStart: Math.random() * 1000 - 500,
          yStart: Math.random() * 1000 - 500,
          rotation: Math.random() * 720 - 360,
          delay: Math.random() * 2,
          isNumber: false
        });
      }
      
      // Generate numbers
      for (let i = 0; i < 30; i++) {
        const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
        
        newElements.push({
          id: i + 40,
          content: randomNumber,
          xStart: Math.random() * 1000 - 500,
          yStart: Math.random() * 1000 - 500,
          xEnd: Math.random() * 300 - 150,
          yEnd: Math.random() * 300 - 150,
          rotation: 0,
          delay: Math.random() * 2,
          isNumber: true
        });
      }
      
      setElements(newElements);
    };

    generateElements();
    
    // Progress timer
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onComplete();
          }, 500);
        }
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 30);
    
    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg overflow-hidden flex flex-col justify-center items-center">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 bg-primary/20 rounded-full filter blur-3xl animate-spin-slow"></div>
      </div>
      
      {/* Moving elements */}
      {elements.map((element) => (
        <div
          key={element.id}
          className={`absolute ${
            element.isNumber ? 'animate-number-float' : 'animate-letter-move'
          } text-${element.isNumber ? '3xl' : 'xl'} font-bold`}
          style={{
            '--x-start': `${element.xStart}px`,
            '--y-start': `${element.yStart}px`,
            '--x-end': element.xEnd ? `${element.xEnd}px` : '0px',
            '--y-end': element.yEnd ? `${element.yEnd}px` : '0px',
            '--rotation': `${element.rotation}deg`,
            animationDelay: `${element.delay}s`,
            color: element.isNumber ? 
              'rgba(59, 130, 246, 0.7)' : 
              'rgba(139, 92, 246, 0.7)'
          } as React.CSSProperties}
        >
          {element.content}
        </div>
      ))}
      
      {/* Central spinning element */}
      <div className="relative z-10">
        <div className="w-32 h-32 border-4 border-primary rounded-full animate-spin-slow flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-secondary rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}>
          </div>
        </div>
      </div>
      
      {/* Progress text */}
      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center">
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-4 text-sm font-medium text-primary">
          Processing membership data... {progress}%
        </p>
      </div>
    </div>
  );
};

export default ProcessingAnimation;
