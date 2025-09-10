document.addEventListener('DOMContentLoaded', () => {
  // Select all elements that should have the tilt effect
  const tiltableElements = document.querySelectorAll('.glass-card, .glass-form');

  tiltableElements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Adjust the intensity of the rotation
      const rotateX = (y / rect.height) * -12;
      const rotateY = (x / rect.width) * 12;

      // Apply the 3D transform. Use a quick transition for responsiveness.
      element.style.transition = 'transform 0.1s ease-out';
      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    element.addEventListener('mouseleave', () => {
      // Reset the transform with a smoother, longer transition
      element.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
      element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
});
