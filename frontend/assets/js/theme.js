// This script must be placed in the <head> of your HTML to prevent flashing.
(function() {
    // Sets the theme on the <html> element
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    // This immediately applies the theme on initial page load
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // This part runs after the page content is loaded
    document.addEventListener('DOMContentLoaded', () => {
        const themeToggleButton = document.getElementById('theme-toggle');
        // Ensure the button exists before adding an event listener
        if (themeToggleButton) {
            const sunIcon = document.getElementById('theme-toggle-sun');
            const moonIcon = document.getElementById('theme-toggle-moon');

            // Updates the toggle icon visibility
            const updateIcon = () => {
                if (document.documentElement.classList.contains('dark')) {
                    sunIcon.classList.remove('hidden');
                    moonIcon.classList.add('hidden');
                } else {
                    sunIcon.classList.add('hidden');
                    moonIcon.classList.remove('hidden');
                }
            };
            
            // Set the correct icon when the page loads
            updateIcon();

            // Adds the click functionality to the toggle button
            themeToggleButton.addEventListener('click', () => {
                const isDark = document.documentElement.classList.toggle('dark');
                const newTheme = isDark ? 'dark' : 'light';
                localStorage.setItem('theme', newTheme);
                updateIcon();
            });
        }
    });
})();

