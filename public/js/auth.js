document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const errorBox = document.getElementById('error-box');
    const errorText = document.getElementById('error-text');

    // Load users from storage or use defaults
    let users = JSON.parse(localStorage.getItem('users')) || [
        { username: 'admin', password: 'admin123', name: 'Admin Staff' }
    ];

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userIn = document.getElementById('username').value;
            const passIn = document.getElementById('password').value;

            const foundUser = users.find(u => u.username === userIn && u.password === passIn);

            if (foundUser) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify({ name: foundUser.name, role: 'Staff' }));
                window.location.href = 'index.html';
            } else {
                errorBox.style.display = 'block';
                errorText.textContent = 'Invalid username or password.';
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('fullname').value;
            const userIn = document.getElementById('username').value;
            const passIn = document.getElementById('password').value;

            if (users.some(u => u.username === userIn)) {
                errorBox.style.display = 'block';
                errorText.textContent = 'Username already exists!';
                return;
            }

            users.push({ name, username: userIn, password: passIn });
            localStorage.setItem('users', JSON.stringify(users));
            
            // Auto-login after signup
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify({ name, role: 'Staff' }));
            window.location.href = 'index.html';
        });
    }

    // Protection logic for other pages
    const isPublicPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
    if (!isPublicPage) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn !== 'true') {
            window.location.href = 'login.html';
        } else {
            // Update UI with real user name if header exists
            const user = JSON.parse(localStorage.getItem('user'));
            const userDisplay = document.querySelector('.user-profile strong');
            if (userDisplay && user) {
                userDisplay.textContent = user.name;
            }
        }
    }
});

// Logout Helper
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
