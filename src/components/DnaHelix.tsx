
import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

const DnaHelix: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined' || !window.THREE) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 60;
    
    // Set up scene, camera, and renderer
    const scene = new window.THREE.Scene();
    container.__scene = scene;
    
    const camera = new window.THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new window.THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(width, height);
    container.innerHTML = ''; // Clear any existing content
    container.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new window.THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new window.THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create DNA helix
    const dnaGroup = new window.THREE.Group();
    
    // Create the strands
    for (let strand = 0; strand < 2; strand++) {
      const points = [];
      const color = strand === 0 ? 0x9b87f5 : 0x1EAEDB; // Primary and accent colors
      
      for (let i = 0; i <= 60; i++) {
        const t = i / 20;
        const angle = t * Math.PI * 2;
        const x = 2 * Math.cos(angle + (strand * Math.PI));
        const y = t * 8 / 3 - 4;
        const z = 2 * Math.sin(angle + (strand * Math.PI));
        
        points.push(new window.THREE.Vector3(x, y, z));
      }
      
      // Create a tube geometry for the strand
      const curve = new window.THREE.CatmullRomCurve3(points);
      const geometry = new window.THREE.TubeGeometry(curve, 60, 0.15, 8, false);
      const material = new window.THREE.MeshPhongMaterial({ color });
      const tube = new window.THREE.Mesh(geometry, material);
      
      dnaGroup.add(tube);
    }
    
    // Add base pairs
    for (let i = 0; i < 30; i++) {
      const t = i / 30 * 3;
      const angle = t * Math.PI * 2;
      
      const x1 = 2 * Math.cos(angle);
      const y = t * 8 / 3 - 4;
      const z1 = 2 * Math.sin(angle);
      
      const x2 = 2 * Math.cos(angle + Math.PI);
      const z2 = 2 * Math.sin(angle + Math.PI);
      
      // Create the base pair
      const baseGeometry = new window.THREE.BoxGeometry(4, 0.1, 0.1);
      const baseMaterial = new window.THREE.MeshPhongMaterial({ color: 0xffffff });
      const base = new window.THREE.Mesh(baseGeometry, baseMaterial);
      
      base.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      base.lookAt(new window.THREE.Vector3(x2, y, z2));
      
      dnaGroup.add(base);
    }
    
    scene.add(dnaGroup);
    
    // Position camera
    camera.position.z = 10;
    
    // Set initial background color based on theme
    scene.background = theme === 'dark' 
      ? new window.THREE.Color(0x111827) 
      : new window.THREE.Color(0xf4f6f9);
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Automatic rotation
      dnaGroup.rotation.y += 0.01;
      
      renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 60;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
    };
  }, [theme]);

  return (
    <div ref={containerRef} className="dna-helix-container w-full h-[60px]"></div>
  );
};

export default DnaHelix;
