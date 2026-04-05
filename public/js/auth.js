document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorBox = document.getElementById('error-box');
    const errorText = document.getElementById('error-text');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Simple prototype logic: admin / admin123
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify({ name: 'Admin Staff', role: 'Maintainer' }));
                
                // Redirect to dashboard
                window.location.href = 'index.html';
            } else {
                errorBox.style.display = 'block';
                errorText.textContent = 'Invalid username or password. Please try again.';
                
                // Shake effect
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }
        });
    }

    // Protection logic for other pages
    const isLoginPage = window.location.pathname.includes('login.html');
    if (!isLoginPage) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn !== 'true') {
            window.location.href = 'login.html';
        }
    }
});

// Logout Helper
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
